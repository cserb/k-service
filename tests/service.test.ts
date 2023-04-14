/* eslint-env jest */
import { jest } from '@jest/globals';
import { fetchPastPingEvents } from '../src/service';

jest.mock('ethers');
jest.mock('../src/service', (): Record<string, unknown> => {
  return {
    ...jest.requireActual('../src/service'),
    sendPongWithRetry: jest.fn(async () => {
      console.log('Mock sendPongWithRetry called');
      return true;
    }),
  };
});

const mockContract = {
  filters: {
    Ping: () => ({ eventName: 'Ping' }),
    Pong: () => ({ eventName: 'Pong' }),
  },
  queryFilter: jest.fn(),
};

describe('fetchPastPingEvents', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('processes ping events with corresponding pong events correctly', async () => {
    const pingEvent = { transactionHash: '0x123', blockNumber: 1 };
    const pongEvent = { data: '0x123', blockNumber: 2 };

    mockContract.queryFilter.mockImplementation((filter: any) => {
      if (filter.eventName === 'Ping') {
        return [pingEvent];
      }
      if (filter.eventName === 'Pong') {
        return [pongEvent];
      }
      return [];
    });

    await fetchPastPingEvents(mockContract as any, 0);

    expect(mockContract.queryFilter).toHaveBeenCalledTimes(2);
    expect(mockContract.queryFilter).toHaveBeenCalledWith({ eventName: 'Ping' }, 0);
    expect(mockContract.queryFilter).toHaveBeenCalledWith({ eventName: 'Pong' }, 0);
    expect(consoleLogSpy).toHaveBeenCalledWith('Ping event:', pingEvent.transactionHash, pingEvent.blockNumber);
    expect(consoleLogSpy).toHaveBeenCalledWith('Pong found for ping:', pingEvent.transactionHash, pingEvent.blockNumber);
  });

  test('processes ping events without pong events correctly', async () => {
    const pingEvent = { transactionHash: '0x123', blockNumber: 1 };

    mockContract.queryFilter.mockImplementation((filter: any) => {
      if (filter.eventName === 'Ping') {
        return [pingEvent];
      }
      if (filter.eventName === 'Pong') {
        return [];
      }
      return [];
    });

    await fetchPastPingEvents(mockContract as any, 0);

    expect(mockContract.queryFilter).toHaveBeenCalledTimes(2);
    expect(mockContract.queryFilter).toHaveBeenCalledWith({ eventName: 'Ping' }, 0);
    expect(mockContract.queryFilter).toHaveBeenCalledWith({ eventName: 'Pong' }, 0);
    expect(consoleLogSpy).toHaveBeenCalledWith('Ping event:', pingEvent.transactionHash, pingEvent.blockNumber);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Pong not found for ping:', pingEvent.transactionHash, pingEvent.blockNumber);
  });
});


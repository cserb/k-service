module.exports = {
  apps: [
    {
      name: 'ping-pong-service',
      script: 'src/service.ts',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      interpreter: 'node',
      interpreter_args: '-r ts-node/register/transpile-only',
    },
  ],
};

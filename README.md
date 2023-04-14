# Hi Kleros

I wanted to mention a couple of things (in no particular order)
that I encountered while doing this exercise.

- The Ping bot that is set up on your side ran out of GoETH, so I sent a bit
of it to the address that created the pings. This was enough to make the bot
ping for some hours. GoETH is hard to get in quantities, so maybe it's better to redeploy
on Sepolia.
- The Pong Event could be indexed, which would make it easier to filter and
reason about how to make sure that there is a Pong for every Ping.
- Since I couldn't see any other Pong responses for some time, I assumed that
when checking for Pongs, I would not have to check for someone else's Pong.
- The sendPongWithRetry function should obviously have a fallback in case
it fails 3 times. One quick idea could be to just call fetchPastPingEvents.
- I failed at testing – TypeScript is not my primary language – but I left the
tests in there for you to have a look at.
- I went for TypeScript because I thought it would be easier to convey the
idea in a programming language that is mutually known and at the same time,
it has great libraries like ethers.js. Although, if I had to deploy that
bot to production and uptime and fault tolerance is a big concern, I'd choose
Elixir. A Supervisor and GenServer would make reasoning about uptime and
not skipping a beat much easier.
- The block I started at is in the code, but I'll also mention it here: 8823865.
- In order to deal with rate limitations, I would probably use in-memory
storage and batching of requests. Nowhere in the exercise requirements is it
mentioned how fast after the Ping a Pong needs to occur, so it could be
batched per day/week/month.

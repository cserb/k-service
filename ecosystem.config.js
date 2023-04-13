// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ping-pong-service',
      script: 'src/service.ts',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true, // Restart the application if it crashes
      watch: false, // restart the app on file changes
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      interpreter: 'node',
      interpreter_args: '-r ts-node/register/transpile-only', // Use ts-node to run TypeScript files
    },
  ],
};

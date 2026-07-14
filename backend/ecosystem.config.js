module.exports = {
  apps: [
    {
      name: "yds-backend",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "production",
      },
      env_file: ".env",
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: "5s",
    },
  ],
};

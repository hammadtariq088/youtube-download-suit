module.exports = {
  apps: [
    {
      name: "yds-worker",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "900M",
      node_args: "--max-old-space-size=2048",
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "production",
        WORKER_CONCURRENCY: "8",
      },
      env_file: ".env",
    },
  ],
};

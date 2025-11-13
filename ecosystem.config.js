module.exports = {
  apps: [
    { name: "siraj-backend", script: "./siraj-backend/app.js", watch: true, autorestart: true, max_memory_restart: "200M", env: { NODE_ENV: "production" } },
    { name: "siraj-dashboard", script: "./siraj-dashboard/app.js", watch: true, autorestart: true, max_memory_restart: "200M", env: { NODE_ENV: "production" } },
    { name: "siraj-brain", script: "./siraj-brain/app.js", watch: true, autorestart: true, max_memory_restart: "250M", env: { NODE_ENV: "production" } },
    { name: "siraj-monitor", script: "./siraj-monitor/app.js", watch: true, autorestart: true, max_memory_restart: "150M", env: { NODE_ENV: "production" } },
    { name: "siraj-watchdog", script: "./siraj-watchdog/app.js", watch: true, autorestart: true, max_memory_restart: "150M", env: { NODE_ENV: "production" } },
    { name: "siraj-all", script: "./siraj-all/app.js", watch: true, autorestart: true, max_memory_restart: "300M", env: { NODE_ENV: "production" } }
  ]
};

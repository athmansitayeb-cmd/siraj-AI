module.exports = {
  apps: [
    {
      name: "siraj",
      script: "backend/server.js",
      cwd: "/home/athman/siraj_backup/siraj",
      watch: true,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "guardian",
      script: "/home/athman/siraj_backup/siraj/scripts/guardian.sh",
      watch: false,
      autorestart: true
    }
  ]
};

module.exports = {
  apps: [
    {
      name: "siraj-backend",
      script: "server.js",
      cwd: "/opt/siraj/backend",
      interpreter: "node",
      env_file: "/opt/siraj/backend/.env", // ← مسار كامل
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}

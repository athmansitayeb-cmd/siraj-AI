module.exports = {
  apps: [
    {
      name: "siraj-backend",
      script: "server.js",
      cwd: "/opt/siraj/backend",
      interpreter: "node",
      args: "-r dotenv/config",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
}

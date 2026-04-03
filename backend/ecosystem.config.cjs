module.exports = {
  apps: [
    {
      name: "siraj-backend",
      script: "server.js",
      cwd: "/opt/siraj/backend",
      interpreter: "node",
      env_file: ".env",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}

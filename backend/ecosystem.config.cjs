module.exports = {
  apps: [
    {
      name: "siraj-backend",
      script: "server.js",
      cwd: "/opt/siraj/backend",
      interpreter: "node",
      env: {
        NODE_ENV: "production"
      },
      env_file: ".env",
      PAYPAL_WEBHOOK_STRICT: "true"
    }
  ]
};

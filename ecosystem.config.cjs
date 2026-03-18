module.exports = {
  apps: [
    {
      name: "siraj-backend",
      script: "./backend/siraj_v10_ultimate.cjs",
      watch: false,
      env: {
        PORT: 7070,
        MONGO_URI: "mongodb://localhost:27017/siraj",
        JWT_SECRET: "your_secret_key",
      },
    },
    {
      name: "siraj-frontend",
      script: "npm",
      args: "run dev -- --host 0.0.0.0",
      cwd: "./frontend-react",
      watch: false,
      env: {
        PORT: 3000,
      },
    },
  ],
};

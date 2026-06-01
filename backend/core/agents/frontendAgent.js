import { registerAgent } from "../agentRegistry.js";

// ================= FRONTEND AGENT =================
registerAgent("frontend", {

  description:
    "Creates frontend UI files",

  async execute({
    input,
    context
  }) {

    // ================= HTML =================
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>

<form class="login-box">
  <h1>Login</h1>

  <input
    type="email"
    placeholder="Email"
  />

  <input
    type="password"
    placeholder="Password"
  />

  <button>
    Sign In
  </button>
</form>

</body>
</html>
`;

    // ================= CSS =================
    const css = `
body {
  background: #0f172a;
  color: white;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-box {
  width: 320px;
  padding: 20px;
  background: #1e293b;
  border-radius: 12px;
}

input,
button {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
}
`;

    // ================= RETURN FILES =================
    return {
      ok: true,

      summary:
        "Frontend login UI generated",

      files: [
        {
          path: "frontend/index.html",
          content: html
        },

        {
          path: "frontend/style.css",
          content: css
        }
      ]
    };

  }

});

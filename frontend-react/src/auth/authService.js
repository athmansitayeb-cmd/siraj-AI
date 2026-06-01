export const authService = {
  getToken() {
    return localStorage.getItem("siraj_token");
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("siraj_user"));
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("siraj_token");
  },

  login(token, user = null) {
    localStorage.setItem("siraj_token", token);
    if (user) {
      localStorage.setItem("siraj_user", JSON.stringify(user));
    }
  },

  logout() {
    localStorage.removeItem("siraj_token");
    localStorage.removeItem("siraj_user");
    localStorage.removeItem("siraj_conversation");
  },
};

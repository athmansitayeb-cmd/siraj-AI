export const trackEvent = (name, params = {}) => {
  console.log("EVENT:", name, params);

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, {
      ...params,
      app: "siraj"
    });
  }
};

export const trackEvent = (name, params = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  } else {
    console.log("Analytics not ready:", name);
  }
};

/**
 * Lightweight UI Event Bus
 * Used for cross-layer communication (layout, workspace, agent context)
 */

class UIBus {
  constructor() {
    this.listeners = {};
  }

  emit(event, payload) {
    const subs = this.listeners[event];
    if (subs) {
      subs.forEach(fn => fn(payload));
    }
  }

  on(event, fn) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(fn);

    return () => {
      this.listeners[event] =
        this.listeners[event].filter(f => f !== fn);
    };
  }
}

export const uiBus = new UIBus();

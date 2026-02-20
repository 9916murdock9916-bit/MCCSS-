// core/events.js

export const Events = {
  listeners: {},

  on(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  },

  emit(event, data = null) {
    if (!this.listeners[event]) return;
    for (const handler of this.listeners[event]) handler(data);
  }
};

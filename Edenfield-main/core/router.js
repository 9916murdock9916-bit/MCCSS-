// core/router.js

export const Router = {
  routes: {},
  current: null,

  register(name, renderFn) {
    this.routes[name] = renderFn;
  },

  go(name) {
    if (!this.routes[name]) {
      console.error("Route not found:", name);
      return;
    }
    this.current = name;
    this.routes[name]();
  }
};

// router.js
export class Router {
  constructor() {
    this.routes = {};
    this.notFound = () => BuildErrorPage(404, "Page not found.");
    window.addEventListener("popstate", () => this.handle(location.pathname));
  }

  // Register a path and its render function
  register(path, handler) {
    this.routes[path] = handler;
  }

  // Navigate programmatically
  navigate(path) {
    history.pushState({}, "", path);
    this.handle(path);
  }

  // Handle the current path
  handle(path) {
    const handler = this.routes[path];
    if (handler) {
      handler(); // Call the view-rendering function
    } else {
      this.notFound();
    }
  }

  // Optionally customize 404 handler
  setNotFound(handler) {
    this.notFound = handler;
  }

  // Optional: match dynamic routes like /posts/:id
  match(path) {
    // Advanced: add later if needed
  }
}

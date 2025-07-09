import { Router } from "/public/js/router.js";
import { renderHome } from "/public/js/state.js";
import { BuildErrorPage } from "/public/js/post.js"; // 404 fallback

const router = new Router();

router.register("/", renderHome);
router.setNotFound(() => BuildErrorPage(404, "This page was not found."));

router.handle(location.pathname);
window.router = router;

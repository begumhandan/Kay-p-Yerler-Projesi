const { Router } = require("express");
const { protectRoute, checkRole } = require("../middleware/auth.middleware");

const storiesController = require("../controllers/stories.controller");

const storiesRouter = Router();

// GET: Tüm onaylı hikayeleri listele
storiesRouter.get("/", protectRoute, storiesController.getAllStories);

// GET: Onay bekleyen hikayeler (Admin ve Editör)
storiesRouter.get("/pending", protectRoute, checkRole("editor"), storiesController.getPendingStories);

// GET: hikayeyi id ye göre getir
storiesRouter.get("/:id", protectRoute, storiesController.getStoryById);

// POST: Yeni hikaye ekle
storiesRouter.post("/", protectRoute, storiesController.createStory);

// PUT: Hikaye onayla/güncelle
storiesRouter.put("/:id", protectRoute, checkRole("editor"), storiesController.updateStory);

// DELETE: Hikaye sil
storiesRouter.delete("/:id", protectRoute, checkRole("editor"), storiesController.deleteStory);

module.exports = storiesRouter;
const { Router } = require("express");
const { protectRoute, checkRole } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const locationController = require("../controllers/locations.controller");

const locationsRouter = Router();

// GET: Tüm mekanları listele (Public)
locationsRouter.get("/", protectRoute, locationController.getAllLocations);

// GET: Mekan detayını slug ile getir (Public)
locationsRouter.get("/:slug", protectRoute, locationController.getLocationBySlug);

// POST: Yeni mekan oluştur (Admin/Editor )
locationsRouter.post(
  "/",
  protectRoute, // Oturum kontrolü
  checkRole("admin"), // Rol kontrolü
  upload.fields([
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
  ]),
  locationController.createLocation
);

// PUT: Mekanı güncelle (Admin/Editor)
locationsRouter.put(
  "/:id",
  protectRoute,
  checkRole("editor"),
  upload.fields([
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
  ]),
  locationController.updateLocation
);

// DELETE: Mekanı sil (Admin/Editor)
locationsRouter.delete(
  "/:id",
  protectRoute,
  checkRole("editor"), // Editor ve Admin silebilir.
  locationController.deleteLocation
);

// POST: Galeri Resim Yükleme (Admin/Editor)
locationsRouter.post(
  "/:id/gallery",
  protectRoute,
  checkRole("editor"),
  upload.array("images", 10), // Aynı anda max 10 resim
  locationController.addGalleryImages
);

// DELETE: Galeri Resim Silme (Admin/Editor)
locationsRouter.delete(
  "/gallery/:imageId",
  protectRoute,
  checkRole("editor"),
  locationController.deleteGalleryImage
);

module.exports = locationsRouter;

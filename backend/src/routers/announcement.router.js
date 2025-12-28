const { Router } = require("express");
const { protectRoute, checkRole } = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const uploadMiddleware = multer({ storage: storage });

const controller = require("../controllers/announcement.controller");

const router = Router();

// Public
router.get("/", controller.getActiveAnnouncements);
router.get("/:slug", controller.getAnnouncementBySlug);

// Admin Only
// Admin Only
router.get("/admin/all", protectRoute, checkRole("admin"), controller.getAllAnnouncements);

const uploadFields = uploadMiddleware.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]);

router.post("/", protectRoute, checkRole("admin"), uploadFields, controller.createAnnouncement);
// PUT ile güncelleme (Admin ve Editor)
router.put("/:id", protectRoute, checkRole("admin", "editor"), uploadFields, controller.updateAnnouncement);
router.delete("/:id", protectRoute, checkRole("admin"), controller.deleteAnnouncement);
router.delete("/images/:id", protectRoute, checkRole("admin", "editor"), controller.deleteAnnouncementImage); // Yeni: Galeri resmi silme rotası

module.exports = router;

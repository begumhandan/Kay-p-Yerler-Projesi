const Router = require("express");
const { protectRoute, checkRole } = require("../middleware/auth.middleware");
require("dotenv").config();
const { upload } = require("../middleware/multer.middleware")
const userController = require("../controllers/user.controller");

const userRouter = Router();

// GET: Tüm kullanıcıları listele (Admin)
userRouter.get("/", protectRoute, checkRole("admin"), userController.getAllUsers);

// GET: Kullanıcı profili (Public veya Protected)
userRouter.get("/:id", protectRoute, userController.getUser);

//POST: Kayıt Ol (Register)
userRouter.post("/register", userController.Register);

// POST: Giriş Yap (Login)
userRouter.post("/login", userController.Login);

//PUT:sadece giriş yapmış kullanıcılar için(protectRoute) - tek dosya
userRouter.put("/:id/avatar", protectRoute, upload.single("avatar"), userController.updateAvatar);

// DELETE: Hesabı sil
userRouter.delete("/:id", protectRoute, userController.deleteUser);

module.exports = userRouter;
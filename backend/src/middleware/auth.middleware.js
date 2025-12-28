// src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const protectRoute = (req, res, next) => {
  try {
    let token;

    // tokenı cookieden al
    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }
    // eğer cookie yoksa Header'a bak 
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    //token hiç bulunamadıysa hata ver
    if (!token) {
      console.log("Token bulunamadı (Ne Cookie'de ne de Header'da).");
      return res.status(401).json({ message: "Erişim Reddedildi: Lütfen giriş yapın." });
    }

    //secretkey Oku
    const SECRET = process.env.JWT_SECRET;
    if (!SECRET) {
      console.error("JWT_SECRET .env dosyasından okunamadı!");
      return res.status(500).json({ message: "Sunucu hatası: Konfigürasyon eksik." });
    }

    //doğrulama
    const decoded = jwt.verify(token, SECRET);

    // isteğe ekle
    req.userId = decoded.userId;
    req.role = decoded.role;


    next();
  } catch (error) {
    console.log("Token doğrulama hatası:", error.message);
    return res.status(401).json({ message: "Geçersiz veya süresi dolmuş oturum." });
  }
};

const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({ message: "Rol bilgisi bulunamadı." });
    }

    if (
      req.role === requiredRole ||
      (requiredRole === "editor" && req.role === "admin")
    ) {
      next();
    } else {
      console.log(`Yetkisiz Erişim. Gerekli: ${requiredRole}, Mevcut: ${req.role}`);
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }
  };
};

module.exports = {
  protectRoute,
  checkRole,
};
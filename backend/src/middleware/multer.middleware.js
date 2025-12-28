const multer = require("multer");
const path = require("path");
const fs = require("fs");

//yüklenecek Klasörü Ayarla
const uploadDir = "uploads";

// klasör yoksa oluştur (Hata almamak için)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

//depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Dosyalar 'uploads' klasörüne gidecek
  },
  filename: function (req, file, cb) {
    // Dosya ismini benzersiz yap (çakışmayı önlemek için tarih ekliyoruz)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // örnek=> resim-163456789.jpg
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

//  dosya Filtreleme (Sadece Resim)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Sadece resim dosyaları yüklenebilir!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // maks emb
});

module.exports = { upload };
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");

// Veritabanı 
const { db } = require("./db");

// Router importları
const locationsRouter = require("./routers/location.router");
const storiesRouter = require("./routers/stories.router");
const userRouter = require("./routers/user.router");
const statsRouter = require("./routers/stats.router");
const announcementRouter = require("./routers/announcement.router");
const sitemapRouter = require("./routers/sitemap.router");

// Middleware Import
const { trackVisitor } = require("./middleware/visitor.middleware");
const { csrfCheck } = require("./middleware/csrf.middleware");

const app = express();

// Port ayarı
const PORT = process.env.PORT || 3002;

// --- Middleware ---
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // çerezlere = cookie izin ver
  methods: ["GET", "POST", "PUT", "DELETE"], //izin verilen metodlar
  allowedHeaders: ["Content-Type", "Authorization", "X-XSRF-TOKEN"] //izin verilen başlıklar
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'varsayilan_cok_gizli_anahtar'));

// Statik Dosyalar (Uploads klasörü kontrolü ve yolu)
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//scrf koruma
app.use(csrfCheck);

app.use("/uploads", express.static(uploadDir));

// Ziyaretçi Takibini statik dosyalardan sonra, API rotalarından önce koyuyorum
app.use(trackVisitor);

//test
app.get('/api/test-top', (req, res) => {
  console.log('GET /api/test-top hit');
  res.send('Top level test working');
});

//ana rota
app.get("/", (req, res) => {
  res.send("Kayıp Yerler API Çalışıyor");
});

app.use("/api/locations", locationsRouter);
app.use("/api/stories", storiesRouter);
app.use("/api/users", userRouter);
app.use("/api/stats", statsRouter);
app.use("/api/announcements", announcementRouter);
app.use("/", sitemapRouter); // /sitemap.xml olarak erişilecek

app.get('/api/test-stats', (req, res) => {
  console.log('GET /api/test-stats hit');
  res.send('Test stats working');
});

// sunucu başlatma
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
});

// dışarı aktarma
module.exports = { app, db };
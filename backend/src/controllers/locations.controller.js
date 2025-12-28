require("dotenv").config();
const { eq, sql } = require("drizzle-orm");
const { db } = require("../db");
const { locations, stories, locationImages } = require("../db/schema");

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { slugify } = require("../utils/slugify");

const PORT = process.env.PORT || 3002;

// Yardımcı: Resmi Optimize Et (WebP + Resize)
const optimizeImage = async (file) => {
  try {
    const originalPath = file.path;
    const dir = path.dirname(originalPath);
    const name = path.parse(file.filename).name;
    const newFilename = `${name}-opt.webp`;
    const newPath = path.join(dir, newFilename);

    await sharp(originalPath)
      .resize({ width: 1200, withoutEnlargement: true }) // Max genişlik 1200px
      .webp({ quality: 80 }) // WebP formatı, %80 kalite
      .toFile(newPath);

    // Orijinal büyük dosyayı sil 
    try {
      fs.unlinkSync(originalPath);
    } catch (err) {
      console.error("Orijinal dosya silinemedi:", err);
    }

    return newFilename;
  } catch (error) {
    console.error("Resim optimizasyon hatası:", error);
    //hata olursa orijinalini kullanmaya devam et
    return file.filename;
  }
};

// GET: Tüm mekanları listele (Public)
const getAllLocations = async (req, res) => {
  try {
    const allLocations = await db.query.locations.findMany();
    res.json(allLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Mekanlar listelenirken hata oluştu." });
  }
};

// GET: Mekan detayını slug ile getir (Public)
const getLocationBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const location = await db.query.locations.findFirst({
      where: eq(locations.slug, slug),
      with: {
        stories: {
          with: {
            author: {
              columns: { username: true, avatarUrl: true } // Kullanıcı adı ve avatar
            },
          },
          // Sadece onaylı hikayeleri, tarihe yeniden eskiye sırala
          where: eq(stories.isApproved, true),
          orderBy: (stories, { desc }) => [desc(stories.createdAt)],
        },
        images: true, // Galeri resimleri
      },
    });

    if (!location) {
      return res.status(404).json({ message: "Mekan bulunamadı." });
    }
    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Mekan detayları çekilemedi." });
  }
};

// POST: Yeni mekan oluştur (Admin/Editor)
const createLocation = async (req, res) => {
  // Body'den gelen veriler
  const { title, description, yearBefore, yearAfter, addres, beforeImage, afterImage, category, status } = req.body;

  // resim
  let finalBeforeUrl = "";
  let finalAfterUrl = "";

  // Dosya yüklenmişse (Multer) onu kullan
  if (req.files && req.files["beforeImage"]) {
    const optimizedName = await optimizeImage(req.files["beforeImage"][0]);
    finalBeforeUrl = `http://localhost:${PORT}/uploads/${optimizedName}`;
  }
  // Dosya yoksa, body'den geleni kullan
  else if (beforeImage) {
    finalBeforeUrl = beforeImage;
  }


  if (req.files && req.files["afterImage"]) {
    const optimizedName = await optimizeImage(req.files["afterImage"][0]);
    finalAfterUrl = `http://localhost:${PORT}/uploads/${optimizedName}`;
  } else if (afterImage) {
    finalAfterUrl = afterImage;
  }

  //ikisi de yoksa hata
  if (!finalBeforeUrl || !finalAfterUrl) {
    return res.status(400).json({ error: "Lütfen her iki resim için de ya Dosya yükleyin ya da URL girin." });
  }

  try {
    // Basit slug oluşturucu (Türkçe karakterleri ve boşlukları temizle)
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    console.log("Veritabanına ekleniyor:", { title, slug, status });

    // Veritabanına kayıt
    await db.insert(locations).values({
      title,
      slug,
      description,
      imageBeforeUrl: finalBeforeUrl,
      imageAfterUrl: finalAfterUrl,
      yearBefore: parseInt(yearBefore),
      yearAfter: parseInt(yearAfter),
      addres: addres || "Adres Belirtilmedi.",
      status: status || "yikildi",
      category: category || "Diğer",
    });

    console.log("Veritabanına kayıt BAŞARILI!");
    res.status(201).json({ success: true, message: "Mekan başarıyla kaydedildi!" });
  } catch (error) {
    console.error("Kayıt Hatası:", error);
    res.status(500).json({ error: error.message || "Sunucu hatası oluştu." });
  }
};

// PUT: Mekanı güncelle (Admin/Editor)
const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { title, description, yearBefore, yearAfter, addres, category, status } = req.body;

  try {
    // Mevcut mekanı bul
    const existingLocation = await db.query.locations.findFirst({
      where: eq(locations.id, parseInt(id)),
    });

    if (!existingLocation) {
      return res.status(404).json({ error: "Mekan bulunamadı." });
    }

    let newBeforeUrl = existingLocation.imageBeforeUrl;
    let newAfterUrl = existingLocation.imageAfterUrl;

    // Yeni dosya varsa güncelle
    if (req.files && req.files["beforeImage"]) {
      const file = req.files["beforeImage"][0];
      const optimizedName = await optimizeImage(file);
      newBeforeUrl = `${req.protocol}://${req.get("host")}/uploads/${optimizedName}`;
    }

    if (req.files && req.files["afterImage"]) {
      const file = req.files["afterImage"][0];
      const optimizedName = await optimizeImage(file);
      newAfterUrl = `${req.protocol}://${req.get("host")}/uploads/${optimizedName}`;
    }

    await db
      .update(locations)
      .set({
        title,
        description,
        addres: addres,
        yearBefore: parseInt(yearBefore),
        yearAfter: parseInt(yearAfter),
        category,
        status,
        imageBeforeUrl: newBeforeUrl,
        imageAfterUrl: newAfterUrl,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(locations.id, parseInt(id)));

    res.json({ success: true, message: `Mekan ${id} başarıyla güncellendi.` });
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    res.status(500).json({ error: "Mekan güncellenemedi." });
  }
};

// DELETE: Mekanı sil (Admin/Editor)
const deleteLocation = async (req, res) => {
  const { id } = req.params;

  try {
    const existingLocation = await db.query.locations.findFirst({
      where: eq(locations.id, Number(id)),
    });

    if (!existingLocation) {
      return res.status(404).json({ error: "Mekan bulunamadı." });
    }

    await db.delete(locations).where(eq(locations.id, Number(id)));

    res.json({ message: `Mekan ${id} başarıyla silindi.` });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ error: "Mekan silinemedi." });
  }
};

// POST: Galeriye resim ekle
const addGalleryImages = async (req, res) => {
  const { id } = req.params; // locationId

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Lütfen en az bir resim yükleyin." });
  }

  try {
    const insertedImages = [];

    // Her resim için döngü
    for (const file of req.files) {
      const optimizedName = await optimizeImage(file);
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${optimizedName}`;

      const newImage = await db.insert(locationImages).values({
        locationId: parseInt(id),
        imageUrl: imageUrl,
      }).returning();

      insertedImages.push(newImage[0]);
    }

    res.json({ message: "Galeri resimleri eklendi.", images: insertedImages });

  } catch (error) {
    console.error("Galeri yükleme hatası:", error);
    res.status(500).json({ error: "Resimler yüklenemedi." });
  }
};

// DELETE: Galeriden resim sil
const deleteGalleryImage = async (req, res) => {
  const { imageId } = req.params;

  try {
    const deleted = await db.delete(locationImages)
      .where(eq(locationImages.id, parseInt(imageId)))
      .returning();

    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Resim bulunamadı." });
    }

    res.json({ message: "Resim silindi." });
  } catch (error) {
    console.error("Resim silme hatası:", error);
    res.status(500).json({ error: "Resim silinemedi." });
  }
};

module.exports = {
  getAllLocations,
  getLocationBySlug,
  createLocation,
  updateLocation,
  deleteLocation,
  addGalleryImages,
  deleteGalleryImage,
};
const { eq, desc } = require("drizzle-orm");
const { db } = require("../db");
const { announcements, announcementImages } = require("../db/schema");
const { slugify } = require("../utils/slugify");

// GET: Tüm duyuruları listele (sadece aktif olanlar)
const getActiveAnnouncements = async (req, res) => {
    try {
        const activeList = await db.query.announcements.findMany({
            where: eq(announcements.isActive, true),
            orderBy: [desc(announcements.createdAt)],
            with: { images: true }
        });
        res.json(activeList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Duyurular listelenemedi." });
    }
};

// GET: Tüm duyuruları listele (hepsi)
const getAllAnnouncements = async (req, res) => {
    try {
        const list = await db.query.announcements.findMany({
            orderBy: [desc(announcements.createdAt)],
            with: { images: true }
        });
        res.json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Duyurular listelenemedi." });
    }
};

// GET:duyuru detayı (Public)
const getAnnouncementBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const item = await db.query.announcements.findFirst({
            where: eq(announcements.slug, slug),
            with: { images: true }
        });

        if (!item) {
            return res.status(404).json({ error: "Duyuru bulunamadı." });
        }
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Duyuru detayı çekilemedi." });
    }
};

// POST: Yeni Duyuru (Admin)
const createAnnouncement = async (req, res) => {
    const { title, content, isActive } = req.body;

    // req.files artık bir obje: { image: [File], images: [File, File] }
    const coverImageFile = req.files?.image?.[0]; // Kapak resmi
    const galleryFiles = req.files?.images || [];  // Galeri resimleri

    let coverImageUrl = null;

    if (coverImageFile) {
        coverImageUrl = `${req.protocol}://${req.get("host")}/uploads/${coverImageFile.filename}`;
    }

    try {
        const baseSlug = slugify(title);
        const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        // Duyuruyu oluştur
        const [newAnnouncement] = await db.insert(announcements).values({
            title,
            slug,
            content,
            imageUrl: coverImageUrl,
            isActive: isActive === 'true' || isActive === true,
        }).returning();

        // Galeri resimlerini ekle
        if (galleryFiles.length > 0) {
            const imageRecords = galleryFiles.map(file => ({
                imageUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
                announcementId: newAnnouncement.id
            }));

            await db.insert(announcementImages).values(imageRecords);
        }

        res.status(201).json({ success: true, message: "Duyuru oluşturuldu." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Duyuru oluşturulamadı." });
    }
};

// PUT: Güncelle (Admin/Editor)
const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, content, isActive } = req.body;

    const coverImageFile = req.files?.image?.[0]; // Yeni kapak resmi
    const galleryFiles = req.files?.images || []; // Yeni galeri resimleri

    try {
        const updateData = {
            title,
            content,
            isActive: isActive === 'true' || isActive === true,
            updatedAt: new Date().toISOString()
        };

        // Eğer yeni kapak resmi yüklendiyse güncelle
        if (coverImageFile) {
            updateData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${coverImageFile.filename}`;
        }

        // 1. Duyuruyu güncelle
        await db.update(announcements)
            .set(updateData)
            .where(eq(announcements.id, Number(id)));

        // 2. Yeni galeri resimlerini ekle
        if (galleryFiles.length > 0) {
            const imageRecords = galleryFiles.map(file => ({
                imageUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
                announcementId: Number(id)
            }));

            await db.insert(announcementImages).values(imageRecords);
        }

        res.json({ success: true, message: "Duyuru güncellendi." });
    } catch (error) {
        console.error("Güncelleme hatası:", error);
        res.status(500).json({ error: "Güncelleme işlemi başarısız." });
    }
};

// DELETE: Duyuru Sil (Admin)
const deleteAnnouncement = async (req, res) => {
    const { id } = req.params;
    try {
        await db.delete(announcements).where(eq(announcements.id, Number(id)));
        res.json({ success: true, message: "Duyuru silindi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Silme işlemi başarısız." });
    }
};

// DELETE: Galeri Resmi Sil (Admin)
const deleteAnnouncementImage = async (req, res) => {
    const { id } = req.params; // image ID
    try {
        // İstenirse dosya sisteminden de silinebilir (fs.unlink)
        // Ancak şimdilik sadece DB'den siliyoruz.
        await db.delete(announcementImages).where(eq(announcementImages.id, Number(id)));

        res.json({ success: true, message: "Resim silindi." });
    } catch (error) {
        console.error("Resim silme hatası:", error);
        res.status(500).json({ error: "Resim silinemedi." });
    }
};

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    getAnnouncementBySlug,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    deleteAnnouncementImage,
};

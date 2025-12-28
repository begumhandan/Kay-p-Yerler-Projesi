const { eq } = require("drizzle-orm");
const { db } = require("../db");
const { stories } = require("../db/schema");

// GET: Tüm onaylı hikayeleri listele (Public)
const getAllStories = async (req, res) => {
  try {
    const allStories = await db.query.stories.findMany({
      where: eq(stories.isApproved, true), // Sadece onaylıları getir
      with: {
        author: {
            columns: { password: false } //yazarın şifresi gizlensin
        },
        location: true,
      },
    });
    res.json(allStories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hikayeler listelenirken hata oluştu." });
  }
};

// GET: Onay bekleyen Hikayeler (Admin Only)
const getPendingStories = async (req, res) => {
  try {
    const pendingList = await db.query.stories.findMany({
      where: eq(stories.isApproved, false),
      with: { 
        location: true, 
        author: {
            columns: { password: false }
        } 
      },
    });
    res.json(pendingList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Onay bekleyen hikayeler çekilemedi." });
  }
};

// POST: Yeni hikaye oluştur
const createStory = async (req, res) => {
  const { content, locationId } = req.body;
  
  // Auth middleware'den gelen userId
  const currentUserId = req.userId;

  if (!currentUserId) {
    return res.status(401).json({ error: "Kullanıcı oturum bilgisi eksik." });
  }

  try {
    await db.insert(stories).values({
      content,
      userId: currentUserId,
      locationId: Number(locationId),
      isApproved: false, // Varsayılan olarak onaysız
    });

    res.status(201).json({ message: "Hikaye başarıyla oluşturuldu, onay bekleniyor." });
  } catch (error) {
    console.error("Hikaye oluşturma hatası:", error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
};

// PUT: Hikaye onaylama ve güncelleme
const updateStory = async (req, res) => {
  const { id } = req.params;
  const { isApproved, content } = req.body;

  try {
    // isApproved değerini güvenli bir boolean'a çevir
    let approvedStatus = undefined;
    if (isApproved !== undefined) {
        approvedStatus = isApproved === true || isApproved === "true" || isApproved === 1;
    }

    // Güncellenecek veriyi hazırla
    const updateData = {};
    if (content) updateData.content = content;
    if (approvedStatus !== undefined) updateData.isApproved = approvedStatus;

    await db
      .update(stories)
      .set(updateData)
      .where(eq(stories.id, Number(id)));

    res.json({ message: `Hikaye ${id} güncellendi.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hikaye güncellenemedi." });
  }
};

// GET: Hikaye detayını ID ile getir (Public)
const getStoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const story = await db.query.stories.findFirst({
      where: eq(stories.id, Number(id)),
      with: {
        author: {
            columns: { password: false }
        },
        location: true,
      },
    });

    if (!story) {
      return res.status(404).json({ message: "Hikaye bulunamadı." });
    }
    res.json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hikaye detayları çekilemedi." });
  }
};

// DELETE: Hikaye sil
const deleteStory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.delete(stories).where(eq(stories.id, Number(id)));
    res.json({ message: `Hikaye ${id} silindi.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hikaye silinemedi." });
  }
};

module.exports = {
  getAllStories,
  getPendingStories,
  createStory,
  updateStory,
  getStoryById,
  deleteStory
};
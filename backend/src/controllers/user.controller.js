require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { eq, or } = require("drizzle-orm");

// Veritabanı bağlantısı
const { db } = require("../db");
const { users } = require("../db/schema");

// GET: Tüm kullanıcıları listele (Admin)
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        password: false, // Şifreyi döndürme
      },
    });
    res.json(allUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kullanıcılar listelenirken hata oluştu." });
  }
};

// GET: Kullanıcı profili (Public veya Protected)
const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(id)),
      columns: {
        password: false, // Şifre hariç tut
      },
      with: {
        stories: {
          with: {
            location: true, // hikayeye ait olan mekanı getir
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kullanıcı detayları çekilemedi" });
  }
};

// POST: Kayıt Ol (Register)
const Register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Zorunlu alan kontrolü
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    // Benzersizlik kontrolü
    const existingUser = await db.query.users.findFirst({
      // Hem kullanıcı adı hem de e-posta ile eşleşme arıyoruz
      where: or(eq(users.username, username), eq(users.email, email)),
      columns: { id: true, username: true, email: true },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış." });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Bu email adresi zaten kayıtlı." });
      }
      return res.status(400).json({ error: "Kullanıcı adı veya email zaten kullanımda." });
    }

    // Güvenlik (Hashing) yapıyoruz
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      username,
      email,
      password: passwordHash,
      role: "user",
    };

    await db.insert(users).values(newUser);
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu." });
  } catch (error) {
    console.error("Kayıt hatası:", error);

    // Email veya username zaten varsa (Veritabanı hatası gelirse)
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res
        .status(409)
        .json({ error: "Kullanıcı adı veya email zaten kullanımda." });
    }
    res.status(500).json({ error: "Kayıt işlemi başarısız." });
  }
};

// POST: Giriş Yap (Login)
const Login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error("HATA: .env dosyasında JWT_SECRET bulunamadı!");
    return res.status(500).json({ error: "Sunucu konfigürasyon hatası." });
  }

  try {
    //kullanıcıyı bul
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({ error: "Geçersiz email veya şifre." });
    }

    //sifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Geçersiz email veya şifre." });
    }

    // JWT 
    const payload = {
      userId: user.id,
      role: user.role,
    };

    //süre ayarlama

    //rememberMe true ise 30 gün değilse 1 gün
    const expiresInDays = rememberMe ? 30 : 1;

    // Cookie için milisaniye hesabı (30 gün veya 1 gün)
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // JWT token oluşturma (1 gün geçerli)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInDays + "d" });

    // Cookie ayarla
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 gün
      sameSite: "strict",
    });

    // Frontend'e token dönüyoruz (LocalStorage için)
    res.json({
      message: "Giriş başarılı",
      token: token,
      userId: user.id,
      role: user.role,
      username: user.username,
    });
  } catch (error) {
    console.error("Login hatası:", error);
    res.status(500).json({ error: "Giriş işlemi başarısız." });
  }
};

// Hesabı sil
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Sadece kendi hesabını veya admin silebilir
    if (Number(id) !== req.userId && req.role !== "admin") {
      return res.status(403).json({ error: "Bu işlem için yetkiniz yok." });
    }

    await db.delete(users).where(eq(users.id, Number(id)));

    res.json({ message: "Hesap başarıyla silindi." });
  } catch (error) {
    console.error("Hesap silme hatası:", error);
    res.status(500).json({ error: "Hesap silinemedi." });
  }
};

// Profil fotoğrafı güncelleme
const updateAvatar = async (req, res) => {
  const { id } = req.params;
  const PORT = process.env.PORT || 3002;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Lütfen bir resim dosyası seçin." });
    }

    // url
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    await db
      .update(users)
      .set({ avatarUrl: fileUrl })
      .where(eq(users.id, Number(id)));

    res.json({ message: "Profil fotoğrafı güncellendi!", avatarUrl: fileUrl });
  } catch (error) {
    console.error("Avatar yükleme hatası:", error);
    res.status(500).json({ error: "Profil fotoğrafı güncellenemedi." });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  Register,
  Login,
  deleteUser,
  updateAvatar,
};
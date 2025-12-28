# Kayıp Yerler Projesi

**Kayıp Yerler Projesi**, kentsel hafızayı canlı tutmak, yıkılan, değişen veya risk altındaki mekanları belgelemek ve bu mekanlarla ilgili kişisel hikayeleri paylaşmak amacıyla geliştirilmiş interaktif bir web platformudur.

Kullanıcılar harita üzerinden mekanları keşfedebilir, geçmiş ve güncel hallerini (öncesi/sonrası) karşılaştırabilir ve kendi anılarını paylaşarak kolektif bir hafıza oluşturulmasına katkıda bulunabilirler.

## 🚀 Özellikler

- **Mekan Arşivi:** Yıkılan, risk altında olan, restore edilen veya işlevi değişen mekanların detaylı kayıtları.
- **Öncesi / Sonrası Karşılaştırması:** Mekanların eski ve yeni fotoğraflarının görsel olarak karşılaştırılması.
- **İnteraktif Harita:** Leaflet tabanlı harita üzerinde mekanların konumlarını görüntüleme.
- **Hikaye ve Anı Paylaşımı:** Kullanıcıların mekanlar hakkındaki kişisel anılarını ve hikayelerini paylaşabilmesi.
- **Kategorilendirme:** Mekanların durumuna (yıkıldı, restore edildi vb.) göre filtrelenmesi.
- **Ziyaretçi İstatistikleri:** Aylık ve anlık ziyaretçi takibi (Admin paneli için).
- **Yönetim Paneli:** İçeriklerin, yorumların ve kullanıcıların yönetimi için admin paneli.

## 🛠️ Teknolojiler

Bu proje modern web teknolojileri kullanılarak geliştirilmiştir.

### Frontend (İstemci Tarafı)
- **Framework:** [React](https://react.dev/) (Vite ile)
- **Dil:** JavaScript (ES6+)
- **Stil & Tasarım:** [Tailwind CSS](https://tailwindcss.com/)
- **Yönlendirme:** React Router DOM
- **Harita:** [Leaflet](https://leafletjs.com/) & React Leaflet
- **HTTP İstekleri:** Axios
- **İkonlar:** Lucide React
- **Bildirimler:** React Hot Toast
- **SEO:** React Helmet Async

### Backend (Sunucu Tarafı)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Veritabanı:** SQLite
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Kimlik Doğrulama:** JWT (JSON Web Tokens) & Bcrypt
- **Güvenlik:** Helmet, CSRF koruması
- **Dosya Yönetimi:** Multer & Sharp (Resim işleme)

## 📂 Proje Yapısı

Proje `frontend` ve `backend` olmak üzere iki ana klasörden oluşur.

```
kayip-yerler-projesi/
├── backend/         # Sunucu tarafı kodları (API, Veritabanı)
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/      # Drizzle şemaları ve bağlantı
│   │   ├── middleware/
│   │   ├── routers/
│   │   └── index.js
│   └── package.json
│
├── frontend/        # İstemci tarafı kodları (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
- Node.js (v18 veya üzeri önerilir)
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/kullaniciadi/kayip-yerler-projesi.git
cd kayip-yerler-projesi
```

### 2. Backend Kurulumu
Backend klasörüne gidin, bağımlılıkları yükleyin ve sunucuyu başlatın.

```bash
cd backend
npm install
```

`.env` dosyasını oluşturun ve gerekli değişkenleri tanımlayın (Örnek):
```env
PORT=3002
JWT_SECRET=gizli_anahtariniz
COOKIE_SECRET=cerez_gizli_anahtari
# Veritabanı dosyası proje içinde otomatik oluşturulacaktır (SQLite)
```

Veritabanı şemalarını oluşturun (Migration):
```bash
npm run generate
npm run migrate
```

Sunucuyu başlatın:
```bash
npm run dev
```
Sunucu `http://localhost:3002` adresinde çalışacaktır.

### 3. Frontend Kurulumu
Yeni bir terminal açın, frontend klasörüne gidin ve uygulamayı başlatın.

```bash
cd frontend
npm install
npm run dev
```
Uygulama genellikle `http://localhost:5173` adresinde çalışacaktır.

## 🤝 Katkıda Bulunma
Her türlü katkı, öneri ve hata bildirimi memnuniyetle karşılanır. Lütfen önce bir issue açarak tartışmayı başlatın veya doğrudan bir Pull Request gönderin.

## 📄 Lisans
Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

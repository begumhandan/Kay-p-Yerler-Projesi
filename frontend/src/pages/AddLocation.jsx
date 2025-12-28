import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api";

const AddLocation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Mekan Ekle | Kayıp Yerler";
    return () => {
      document.title = "Kayıp Yerler";
    };
  }, []);

  // Form verileri
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    yearBefore: "",
    yearAfter: new Date().getFullYear().toString(),
    addres: "",
    category: "",
    status: "",
    beforeImage: "",
    afterImage: "",
  });

  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);

  const categories = [
    "Tarihi Yapı & Konak",
    "Sinema & Tiyatro",
    "Fabrika & Endüstriyel",
    "Otel & Han",
    "Okul & Eğitim",
    "Park & Yeşil Alan",
    "İbadethane",
    "Spor Tesisi & Stadyum",
    "Meydan & Sokak",
    "Pasaj & AVM",
    "Diğer",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Text verilerini ekle
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Dosyaları ekle
      if (beforeImage) data.append("beforeImage", beforeImage);
      if (afterImage) data.append("afterImage", afterImage);

      // backende gönderiyorum
      await api.post("/locations", data);

      toast.success("Mekan başarıyla eklendi!");
      navigate("/locations");
    } catch (err) {
      toast.error(err.response?.data?.error || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl mt-8 border border-sepia-dark/10">
      <h2 className="text-3xl font-bold mb-6 text-sepia-dark font-mono">Yeni Kayıp Mekan Ekle</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Başlık ve Açıklama */}
        <div>
          <label className="block text-sm font-bold mb-1">Mekan Adı</label>
          <input
            required
            type="text"
            className="w-full p-2 border rounded bg-sepia-light/20"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Hikayesi / Açıklama</label>
          <textarea
            required
            rows={3}
            className="w-full p-2 border rounded bg-sepia-light/20"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Yıllar */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Eski Yıl (Örn: 1980)</label>
            <input
              required
              type="number"
              className="w-full p-2 border rounded"
              onChange={(e) => setFormData({ ...formData, yearBefore: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Günümüz Yılı</label>
            <input
              required
              type="number"
              defaultValue={2025}
              className="w-full p-2 border rounded"
              onChange={(e) => setFormData({ ...formData, yearAfter: e.target.value })}
            />
          </div>
        </div>

        {/* Kategori ve Durum */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Kategori</label>
            <select
              required
              className="w-full p-2 border rounded bg-sepia-light/20"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              defaultValue=""
            >
              <option value="" disabled>Seçiniz</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Mevcut Durum</label>
            <select
              required
              className="w-full p-2 border rounded bg-sepia-light/20"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              defaultValue=""
            >
              <option value="" disabled>
                Seçiniz
              </option>
              <option value="yikildi">Yıkıldı</option>
              <option value="risk altinda">Risk Altında</option>
              <option value="restore edildi">Restore Edildi</option>
              <option value="degisti">Değişti</option>
            </select>
          </div>
        </div>

        {/* adres */}
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400 flex items-center gap-2">
            <MapPin size={16} /> Açık Adres / Konum
          </label>
          <textarea
            required
            rows={2}
            placeholder="Örn: İstiklal Cad. No:12 Beyoğlu/İstanbul"
            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-black focus:border-amber-500 focus:outline-none"
            onChange={(e) => setFormData({ ...formData, addres: e.target.value })}
          />
        </div>

        {/* resim yükleme kısmı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-400 hover:border-amber-500/50 transition text-center">
            <label className="block text-sm font-bold mb-2 text-gray-500">Eski Fotoğraf (Siyah/Beyaz)</label>
            <div className="flex flex-col items-center justify-center gap-2 cursor-pointer relative h-24">
              <Upload className="text-gray-400" />
              <input
                required
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => setBeforeImage(e.target.files ? e.target.files[0] : null)}
              />
              <span className="text-xs text-amber-600 truncate max-w-full px-2">
                {beforeImage ? beforeImage.name : "Dosya Seçin"}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-400 hover:border-amber-500/50 transition text-center">
            <label className="block text-sm font-bold mb-2 text-gray-500">Yeni Fotoğraf (Güncel)</label>
            <div className="flex flex-col items-center justify-center gap-2 cursor-pointer relative h-24">
              <Upload className="text-gray-400" />
              <input
                required
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => setAfterImage(e.target.files ? e.target.files[0] : null)}
              />
              <span className="text-xs text-amber-600 truncate max-w-full px-2">
                {afterImage ? afterImage.name : "Dosya Seçin"}
              </span>
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold p-4 rounded-lg hover:shadow-lg hover:from-amber-700 hover:to-orange-800 transition transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Arşive Kaydet "}
        </button>
      </form>
    </div>
  );
};

export default AddLocation;
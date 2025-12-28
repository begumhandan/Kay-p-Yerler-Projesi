import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Upload, RefreshCw, Trash2, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

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

const EditLocation = () => {
  const { slug } = useParams(); //slug al url den
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locationId, setLocationId] = useState(null);

  // Form verileri
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    yearBefore: "",
    yearAfter: "",
    addres: "",
    category: "",
    status: "",
  });

  // Mevcut resim URL'leri (resim düzenleme için eskisi getirilecek)
  const [currentImages, setCurrentImages] = useState({ before: "", after: "" });
  const [newBeforeImage, setNewBeforeImage] = useState(null);
  const [newAfterImage, setNewAfterImage] = useState(null);

  // Galeri State
  const [galleryImages, setGalleryImages] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // mevcut verileri çek
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const res = await api.get(`/locations/${slug}`);
        const data = res.data;

        setLocationId(data.id);
        setFormData({
          title: data.title,
          description: data.description,
          yearBefore: data.yearBefore.toString(),
          yearAfter: data.yearAfter.toString(),
          addres: data.addres || data.address, // API'den dönen isme göre
          category: data.category,
          status: data.status,
        });
        setCurrentImages({
          before: data.imageBeforeUrl,
          after: data.imageAfterUrl,
        });
        setGalleryImages(data.images || []);
      } catch (error) {
        console.error("Mekan bilgileri alınamadı", error);
        alert("Mekan bulunamadı!");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchLocationData();
  }, [slug, navigate]);

  // Güncelleme işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationId) return;
    setSubmitting(true);

    try {
      const data = new FormData();
      // Text verilerini ekle
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Sadece yeni dosya seçildiyse ekle
      if (newBeforeImage) data.append("beforeImage", newBeforeImage);
      if (newAfterImage) data.append("afterImage", newAfterImage);

      // PUT isteği gönder
      await api.put(`/locations/${locationId}`, data);

      toast.success("Mekan başarıyla güncellendi!");
      navigate(`/location/${slug}`); // mekanın olduğu sayfaya geri dön
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Güncelleme başarısız.");
    } finally {
      setSubmitting(false);
    }
  };

  // Galeri İşlemleri
  const handleUploadGallery = async () => {
    if (newGalleryFiles.length === 0) return alert("Lütfen resim seçin.");

    setUploadingGallery(true);
    const formData = new FormData();
    for (let i = 0; i < newGalleryFiles.length; i++) {
      formData.append("images", newGalleryFiles[i]);
    }

    try {
      const res = await api.post(`/locations/${locationId}/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      //başarılı yükleme ve listeyi güncelle
      setGalleryImages((prev) => [...prev, ...res.data.images]);
      setNewGalleryFiles([]);//seçim temizlensin
      alert("Resimler galeriye eklendi!");
    } catch (error) {
      console.error(error);
      alert("Galeriye yükleme başarısız.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!window.confirm("Bu resmi silmek istiyor musunuz?")) return;

    try {
      await api.delete(`/locations/gallery/${imageId}`);
      // UI'dan kaldır
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error(error);
      alert("Resim silinemedi.");
    }
  };


  if (loading)
    return (
      <div className="text-center mt-20">
        <RefreshCw className="animate-spin inline" /> Yükleniyor...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-20 px-4">
      <div className="bg-surface border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-black flex items-center gap-3">
          <span className="bg-black/20 p-2 rounded-lg text-blue-500">
            <Save size={24} />
          </span>
          <span className="text-primary">{formData.title}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/*header*/}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400">Mekan Adı</label>
            <input
              required
              type="text"
              value={formData.title}
              className="w-full p-3 rounded-lg bg-background border border-gray-700 text-black focus:border-primary focus:outline-none transition"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* category- status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-400 flex items-center gap-2">Kategori</label>
              <select
                required
                className="w-full p-3 rounded-lg bg-background border border-gray-700 text-black focus:border-primary focus:outline-none transition"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-400 flex items-center gap-2">
                Şu Anki Durumu
              </label>
              <select
                required
                className="w-full p-3 rounded-lg bg-background border border-gray-700 text-black focus:border-primary focus:outline-none transition"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="yikildi">Yıkıldı</option>
                <option value="risk altinda">Risk Altında</option>
                <option value="restore edildi">Restore Edildi</option>
                <option value="degisti">İşlev Değiştirdi</option>
              </select>
            </div>
          </div>

          {/* desc*/}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400">Hikayesi / Açıklama</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              className="w-full p-3 rounded-lg bg-background border border-gray-700 text-black focus:border-primary focus:outline-none transition"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* eski yıl - yeni yıl */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-400 flex items-center gap-2">
                Eski Yıl
              </label>
              <input
                required
                type="number"
                value={formData.yearBefore}
                className="w-full p-3 rounded-lg bg-background border border-gray-700 text-black focus:border-primary focus:outline-none"
                onChange={(e) => setFormData({ ...formData, yearBefore: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-400">Günümüz Yılı</label>
              <input
                required
                type="number"
                value={formData.yearAfter}
                className="w-full p-3 rounded-lg bg-background border border-gray-700 text-black focus:border-primary focus:outline-none"
                onChange={(e) => setFormData({ ...formData, yearAfter: e.target.value })}
              />
            </div>
          </div>

          {/*adress*/}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400 flex items-center gap-2">
              Açık Adres / Konum
            </label>
            <textarea
              required
              rows={2}
              value={formData.addres}
              className="w-full p-3 rounded-lg bg-background border border-gray-700 text-black focus:border-primary focus:outline-none"
              onChange={(e) => setFormData({ ...formData, addres: e.target.value })}
            />
          </div>

          {/* update*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-900 pt-6">

            {/* eski foto updates*/}
            <div className="bg-background p-4 rounded-lg border border-dashed border-gray-900 text-center group">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Eski Fotoğraf (Değiştirmek için tıkla)
              </label>

              {currentImages.before && !newBeforeImage && (
                <img
                  src={currentImages.before}
                  alt="Mevcut"
                  className="h-24 mx-auto mb-2 object-cover rounded opacity-50 group-hover:opacity-100 transition"
                />
              )}

              <div className="flex flex-col items-center justify-center gap-2 cursor-pointer relative h-24 bg-surface/50 rounded">
                <Upload className="text-gray-500 group-hover:text-primary transition-colors" size={24} />
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setNewBeforeImage(e.target.files ? e.target.files[0] : null)}
                />
                <span className="text-xs text-primary font-bold break-all px-2">
                  {newBeforeImage
                    ? newBeforeImage.name
                    : currentImages.before
                      ? "Yeni dosya seçilmedi (Eskisi kalacak)"
                      : "Dosya Seç"}
                </span>
              </div>
            </div>

            {/* yeni foto updates*/}
            <div className="bg-background p-4 rounded-lg border border-dashed border-gray-700 text-center group">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Yeni Fotoğraf (Değiştirmek için tıkla)
              </label>

              {currentImages.after && !newAfterImage && (
                <img
                  src={currentImages.after}
                  alt="Mevcut"
                  className="h-24 mx-auto mb-2 object-cover rounded opacity-50 group-hover:opacity-100 transition"
                />
              )}

              <div className="flex flex-col items-center justify-center gap-2 cursor-pointer relative h-24 bg-surface/50 rounded">
                <Upload className="text-gray-500 group-hover:text-primary transition-colors" size={24} />
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setNewAfterImage(e.target.files ? e.target.files[0] : null)}
                />
                <span className="text-xs text-primary font-bold break-all px-2">
                  {newAfterImage
                    ? newAfterImage.name
                    : currentImages.after
                      ? "Yeni dosya seçilmedi (Eskisi kalacak)"
                      : "Dosya Seç"}
                </span>
              </div>
            </div>
          </div>

          {/*galeri*/}
          <div className="border border-gray-800 rounded-xl p-6 bg-black/5">
            <h3 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
              <ImagePlus size={24} className="text-purple-600" /> Galeri Yönetimi
            </h3>

            {/* mevcut resimler*/}
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                    <img src={img.imageUrl} alt="Galeri" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-700"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-4 italic">Henüz galeriye resim eklenmemiş.</p>
            )}

            {/* yeni resim yükleme alanı */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full">
                <label className="block text-sm font-bold mb-2 text-gray-600">Yeni Resimler Ekle</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full p-2 bg-white border border-gray-400 rounded-lg text-sm"
                  onChange={(e) => setNewGalleryFiles(e.target.files)}
                />
                <p className="text-xs text-gray-500 mt-1">{newGalleryFiles.length} dosya seçildi.</p>
              </div>
              <button
                type="button"
                onClick={handleUploadGallery}
                disabled={uploadingGallery || newGalleryFiles.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingGallery ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                Yükle
              </button>
            </div>
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="w-full bg-stone-400 to-primary text-black font-bold p-4 rounded-lg hover:shadow-md "
          >
            {submitting ? "Güncelleniyor..." : "Değişiklikleri Kaydet "}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditLocation;
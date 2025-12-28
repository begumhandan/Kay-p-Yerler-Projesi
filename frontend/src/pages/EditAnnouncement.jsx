import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";

const EditAnnouncement = () => {
    const navigate = useNavigate();
    const { slug } = useParams(); // URL'den slug al
    const [id, setId] = useState(null); // Güncelleme için ID lazım
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null); // Yeni yüklenen kapak resmi
    const [currentImageUrl, setCurrentImageUrl] = useState(null); // Mevcut kapak resmi URL'i

    // Galeri için Stateler
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [existingGallery, setExistingGallery] = useState([]); // Mevcut galeri görselleri
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    // Mevcut verileri çek
    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const res = await api.get(`/announcements/${slug}`);
                const data = res.data;
                setId(data.id);
                setTitle(data.title);
                setContent(data.content);
                setIsActive(data.isActive);
                if (data.imageUrl) {
                    setCurrentImageUrl(data.imageUrl);
                }
                // Mevcut galeri resimlerini yükle
                if (data.images) {
                    setExistingGallery(data.images);
                }
            } catch (error) {
                console.error("Duyuru detayı alınamadı", error);
                toast.error("Duyuru bulunamadı.");
                navigate("/admin");
            }
        };

        if (slug) {
            fetchAnnouncement();
        }
    }, [slug, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGalleryFiles(prev => [...prev, ...files]);//eski resimlerle yeni resimler birleştir
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);//eski resimlerle yeni resimler birleştir
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = async (imageId) => {
        if (!window.confirm("Bu resmi galeriden silmek istediğinize emin misiniz?")) return;

        try {
            await api.delete(`/announcements/images/${imageId}`);
            setExistingGallery(prev => prev.filter(img => img.id !== imageId));
            toast.success("Resim silindi.");
        } catch (error) {
            console.error("Resim silinemedi", error);
            toast.error("Resim silinemedi.");
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
        setCurrentImageUrl(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("isActive", isActive);
        if (image) {
            formData.append("image", image);
        }

        // galeri resimlerini ekle
        galleryFiles.forEach(file => {
            formData.append("images", file);
        });

        try {
            await api.put(`/announcements/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Duyuru başarıyla güncellendi!");
            navigate("/admin");
        } catch (error) {
            console.error("Duyuru güncelleme hatası:", error);
            toast.error("Duyuru güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg my-10">
            <h1 className="text-2xl font-bold mb-6 text-brand-red border-b pb-2">Duyuruyu Düzenle</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows="5"
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none resize-none"
                    ></textarea>
                </div>

                {/* resim yükle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Resmi</label>

                    {/* kapak resmi */}
                    <div className="mb-6">
                        {!preview && !currentImageUrl ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-red transition">
                                <label htmlFor="image-upload" className="cursor-pointer text-center">
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Kapak resmi seçmek için tıklayın</span>
                                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        ) : (
                            <div className="relative inline-block border rounded overflow-hidden group">
                                <img
                                    src={preview || currentImageUrl}
                                    alt="Önizleme"
                                    className="h-48 w-auto object-cover"
                                />
                                <div className="absolute top-1 right-1 flex gap-1">
                                    <label htmlFor="image-upload-edit" className="bg-white text-gray-700 p-1 rounded-full shadow hover:bg-gray-100 cursor-pointer">
                                        <Upload size={16} />
                                        <input id="image-upload-edit" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>
                        )}
                        {/* kapak resmi güncelleme uyarısı */}
                        {image && <p className="text-xs text-green-600 mt-1">Yeni kapak resmi seçildi.</p>}
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2 pt-4 border-t">Galeri Resimleri</label>

                    {/* mevcut galeri */}
                    {existingGallery.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Mevcut Galeri:</p>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                {existingGallery.map((img) => (
                                    <div key={img.id} className="relative group border rounded-lg overflow-hidden shadow-sm aspect-square bg-white">
                                        <img src={img.imageUrl} alt="Mevcut Galeri" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Sil"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* yeni ekleme alanı */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-red transition bg-gray-50">
                        <label htmlFor="gallery-upload" className="cursor-pointer text-center w-full">
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500 font-medium">Galeriye yeni fotoğraf eklemek için tıklayın</span>
                            <p className="text-xs text-gray-400 mt-1">Çoklu seçim yapabilirsiniz</p>
                            <input
                                id="gallery-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryChange}
                            />
                        </label>
                    </div>

                    {/* yeni yükleneceklerin önizlemesini göster */}
                    {galleryPreviews.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-bold text-green-600 mb-2 uppercase">Yeni Eklenecekler:</p>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                {galleryPreviews.map((src, index) => (
                                    <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm aspect-square bg-white">
                                        <img src={src} alt={`Yeni Galeri ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGalleryImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-5 h-5 text-brand-red rounded focus:ring-brand-red"
                    />
                    <label htmlFor="isActive" className="text-gray-700 font-medium cursor-pointer">
                        Yayında Olsun
                    </label>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin")}
                        className="px-6 py-2 mr-4 text-gray-600 hover:text-gray-900 font-medium"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2 bg-brand-red text-white font-bold rounded shadow hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? "Kaydediliyor..." : "Güncelle"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAnnouncement;

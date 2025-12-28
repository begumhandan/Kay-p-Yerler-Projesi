import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const AddAnnouncement = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState(null); // Kapak resmi
    const [coverPreview, setCoverPreview] = useState(null);//kapak resmi önizleme
    const [galleryImages, setGalleryImages] = useState([]); // Galeri resimleri
    const [galleryPreviews, setGalleryPreviews] = useState([]);//galeri resimleri önizleme
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setGalleryImages((prev) => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryImages((prev) => prev.filter((_, i) => i !== index));//galeri resimlerini filtrele -silme için
        setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));//galeri resimlerini filtrele -silme için
    };

    const handleRemoveCover = () => {
        setCoverImage(null);//kapak resmini temizle
        setCoverPreview(null);//kapak resmini temizle
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("isActive", isActive);

        // Kapak Resmi
        if (coverImage) {
            formData.append("image", coverImage);
        }

        // Galeri Resimleri
        galleryImages.forEach((img) => {
            formData.append("images", img);
        });

        try {
            await api.post("/announcements", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Duyuru başarıyla oluşturuldu!");
            navigate("/admin");
        } catch (error) {
            toast.error("Duyuru oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg my-10">
            <h1 className="text-2xl font-bold mb-6 text-brand-red border-b pb-2">Yeni Duyuru Ekle</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                        placeholder="Duyuru başlığı"
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
                        placeholder="Duyuru detayları"
                    ></textarea>
                </div>

                {/* resim yükleme */}
                <div>
                    {/* kapak resmi */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Resmi</label>
                    <div className="mb-6">
                        {!coverPreview ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-red transition">
                                <label htmlFor="cover-upload" className="cursor-pointer text-center w-full">
                                    <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500 font-medium">Kapak resmi seçmek için tıklayın</span>
                                    <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                                </label>
                            </div>
                        ) : (
                            <div className="relative inline-block border rounded overflow-hidden group">
                                <img src={coverPreview} alt="Kapak Önizleme" className="h-48 w-auto object-cover" />
                                <button
                                    type="button"
                                    onClick={handleRemoveCover}
                                    className="absolute top-1 right-1 bg-white text-red-600 p-1 rounded-full shadow hover:bg-gray-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* galeri resimleri seçimi */}
                    <label className="block text-sm font-medium text-gray-700 mb-2 pt-4 border-t">Galeri Resimleri</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-red transition bg-gray-50">
                        <label htmlFor="gallery-upload" className="cursor-pointer text-center w-full">
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500 font-medium">Galeriye fotoğraf eklemek için tıklayın (Çoklu)</span>
                            <div className="text-xs text-gray-400 mt-1">Ctrl tuşu ile birden fazla seçebilirsiniz</div>
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

                    {/* galeri önizlemeleri */}
                    {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                            {galleryPreviews.map((src, index) => (
                                <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm aspect-square bg-white">
                                    <img src={src} alt={`Galeri ${index + 1}`} className="w-full h-full object-cover" />
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
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2">
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
                        className="px-8 py-2 bg-brand-red text-white font-bold rounded shadow hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? "Yükleniyor..." : "Duyuruyu Yayınla"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAnnouncement;

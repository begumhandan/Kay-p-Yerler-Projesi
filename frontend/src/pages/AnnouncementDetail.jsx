import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { Calendar, ArrowLeft } from "lucide-react";

const AnnouncementDetail = () => {
    const { slug } = useParams();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null); // Modal için state

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/announcements/${slug}`);
                setAnnouncement(res.data);
            } catch (error) {
                console.error("Duyuru detayı alınamadı", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchDetail();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">Duyuru bulunamadı.</h2>
                <Link to="/announcements" className="text-brand-red hover:underline mt-4 inline-block">
                    Duyurulara Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            <Link to="/announcements" className="inline-flex items-center text-gray-600 hover:text-brand-red mb-6 transition">
                <ArrowLeft size={20} className="mr-2" /> Tüm Duyurular
            </Link>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                {announcement.imageUrl && (
                    <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="w-full h-96 object-cover"
                    />
                )}

                <div className="p-8">
                    <div className="flex items-center text-gray-500 mb-4 text-sm font-medium uppercase tracking-wide">
                        <Calendar size={18} className="mr-2" />
                        {new Date(announcement.createdAt).toLocaleDateString("tr-TR", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-brand-black">
                        {announcement.title}
                    </h1>

                    <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                    </div>

                    {/* duyuru galerisi */}
                    {announcement.images && announcement.images.length > 0 && (
                        <div className="mt-10 border-t pt-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                📷 Fotoğraf Galerisi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {announcement.images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group"
                                        onClick={() => setSelectedImage(img.imageUrl)}
                                    >
                                        <img
                                            src={img.imageUrl}
                                            alt="Galeri"
                                            className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* resim inceleme */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Tam Ekran"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                        >
                            <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">Kapat ✕</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementDetail;

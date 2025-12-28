import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Calendar, AlertCircle } from "lucide-react";

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Duyurular | Kayıp Yerler";
        return () => {
            document.title = "Kayıp Yerler";
        };
    }, []);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get("/announcements");
                setAnnouncements(res.data);
            } catch (error) {
                console.error("Duyurular çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 min-h-screen">
            <h1 className="text-4xl font-serif text-brand-black mb-8 border-b-2 border-gray-300 pb-4">
                Duyurular ve Haberler
            </h1>

            {announcements.length === 0 ? (
                <div className="text-center py-20 bg-white shadow-lg rounded-lg">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-600">Henüz yayınlanmış bir duyuru yok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {announcements.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                            {item.imageUrl && (
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                                    />
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <Calendar size={14} className="mr-1" />
                                    {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                                </div>

                                <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2">
                                    {item.title}
                                </h2>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {item.content.length > 150
                                        ? item.content.substring(0, 150) + "..."
                                        : item.content}
                                </p>

                                <Link
                                    to={`/announcement/${item.slug}`}
                                    className="inline-block text-brand-red font-medium hover:text-red-700 transition"
                                >
                                    Detayları Gör →
                                </Link>


                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementsPage;

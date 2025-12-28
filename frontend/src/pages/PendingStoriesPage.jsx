import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Edit, Trash2, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const PendingStoriesPage = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        document.title = "Onay Bekleyenler | Kayıp Yerler";
        return () => { document.title = "Kayıp Yerler"; };
    }, []);

    useEffect(() => {
        const fetchPendingStories = async () => {
            try {
                const res = await api.get('/stories/pending');
                setStories(res.data);
            } catch (error) {
                console.error(error);
                if (error.response && error.response.status === 401) {
                    toast.error("Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");
                    navigate("/login");
                } else {
                    toast.error('Hikayeler yüklenemedi.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPendingStories();
    }, [navigate]);

    const handleApprove = async (id, content) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-2 items-center">
                <span className="font-semibold text-gray-800">
                    Bu hikayeyi onaylamak istediğinize emin misiniz?
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.put(`/stories/${id}`, { isApproved: true, content });
                                setStories(stories.filter(s => s.id !== id));
                                toast.success('Hikaye onaylandı! ');
                            } catch (error) {
                                console.error(error);
                                toast.error('Onaylama başarısız.');
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-bold transition"
                    >
                        Evet, Onayla
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded text-sm font-bold transition"
                    >
                        İptal
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: "top-center",
            style: {
                border: '1px solid #E5E7EB',
                padding: '16px',
                color: '#1F2937',
                borderRadius: '12px',
                'boxShadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                background: '#fff',
            },
        });
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-2 items-center">
                <span className="font-semibold text-gray-800">
                    Bu hikayeyi silmek istediğinize emin misiniz?
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/stories/${id}`);
                                setStories(stories.filter(s => s.id !== id));
                                toast.success('Hikaye silindi.');
                            } catch (error) {
                                console.error(error);
                                toast.error('Silme başarısız.');
                            }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm font-bold transition"
                    >
                        Evet, Sil
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded text-sm font-bold transition"
                    >
                        İptal
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: "top-center",
            style: {
                border: '1px solid #E5E7EB',
                padding: '16px',
                color: '#1F2937',
                borderRadius: '12px',
                'boxShadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                background: '#fff',
            },
        });
    };

    // modal fonksiyonları - düzenleme
    const openEditModal = (story) => {
        setEditingStory(story);
        setEditContent(story.content);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setEditingStory(null);
        setEditContent("");
    };

    const handleSaveAndApprove = async () => {
        if (!editingStory) return;
        try {
            await api.put(`/stories/${editingStory.id}`, { isApproved: true, content: editContent });
            setStories(stories.filter(s => s.id !== editingStory.id));
            toast.success('Hikaye güncellenerek onaylandı!');
            closeEditModal();
        } catch (error) {
            console.error(error);
            toast.error('Güncelleme başarısız.');
        }
    };

    if (loading) return <div className="text-center mt-10">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-sepia-dark border-b pb-2">Onay Bekleyen Hikayeler</h1>

            {stories.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Şu an onay bekleyen hikaye yok. 🎉</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {stories.map(story => (
                        <div key={story.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">

                            <div className="mb-4">
                                <blockquote className="text-lg text-gray-800 italic border-l-4 border-sepia-dark pl-4 py-1 bg-gray-50/50 rounded-r">
                                    "{story.content}"
                                </blockquote>
                            </div>

                            <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                                <span className="flex items-center gap-1">Mekan: <strong className="text-sepia-dark">{story.location?.title || "Bilinmiyor"}</strong></span>
                                <span className="flex items-center gap-1">Yazan Kişi: <strong>{story.author?.username || "Anonim"}</strong></span>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end">
                                <button
                                    onClick={() => handleApprove(story.id, story.content)}
                                    className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-md hover:bg-green-100 transition font-medium text-sm flex items-center gap-1 shadow-sm"
                                >
                                    <Check size={14} /> Onayla
                                </button>

                                <button
                                    onClick={() => openEditModal(story)}
                                    className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-100 transition font-medium text-sm flex items-center gap-1 shadow-sm"
                                >
                                    <Edit size={14} /> Düzenle
                                </button>

                                <button
                                    onClick={() => handleDelete(story.id)}
                                    className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-100 transition font-medium text-sm flex items-center gap-1 shadow-sm"
                                >
                                    <Trash2 size={14} /> Sil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* editleme modalı*/}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative transform transition-all scale-100">
                        <button
                            onClick={closeEditModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Edit className="text-blue-600" size={24} /> Hikayeyi Düzenle
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2">
                                <Info size={20} className="shrink-0" />
                                <span>Metni düzenleyip kaydettiğinizde hikaye otomatik olarak <u>onaylanacaktır</u>.</span>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Hikaye İçeriği</label>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-48 resize-none text-gray-700 text-lg leading-relaxed shadow-inner"
                                    placeholder="Hikaye metnini buraya yazın..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={closeEditModal}
                                className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveAndApprove}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
                            >
                                <Save size={18} /> Kaydet ve Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingStoriesPage;
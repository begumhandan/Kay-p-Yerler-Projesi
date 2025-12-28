import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, MapPin, MessageSquare, TrendingUp, Activity, RefreshCw, PlusCircle, Trash2, Megaphone, Edit, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    // Başlangıç değerleri
    const [stats, setStats] = useState({
        online: 0,
        totalVisitors: 0,
        monthlyVisitors: 0,
        totalLocations: 0,
        totalStories: 0,
        totalUsers: 0,
        mostPopularLocation: 'Veri Yok',
        mostPopularLocationSlug: null
    });
    const [announcements, setAnnouncements] = useState([]);

    const [loading, setLoading] = useState(true);

    // verileri çekeceğimiz fonk
    const fetchData = async () => {
        try {
            const res = await api.get('/stats');
            setStats(res.data);

            const annRes = await api.get('/announcements/admin/all');
            setAnnouncements(annRes.data);
        } catch (error) {
            console.error("İstatistikler alınamadı", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/announcements/${id}`);
            toast.success("Duyuru silindi.");
            fetchData(); // Listeyi yenile
        } catch (error) {
            console.error("Silme hatası", error);
            toast.error("Silinemedi.");
        }
    };

    useEffect(() => {
        document.title = "Yönetici Paneli | Kayıp Yerler";
        return () => {
            document.title = "Kayıp Yerler";
        };
    }, []);

    useEffect(() => {
        fetchData();
        // 10 saniyede bir verileri yenile
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);// temizleme
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <RefreshCw className="animate-spin text-sepia-dark" size={40} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4 mb-10">
            {/* header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-mono text-sepia-dark flex items-center gap-3">
                    <Activity className="text-brand-red" />
                    Sistem Analiz Raporu
                </h1>
                <div className="text-sm text-gray-500 font-bold bg-white px-3 py-1 rounded shadow-sm border border-gray-200 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Canlı Veri
                </div>
            </div>

            {/* istatistik kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

                {/* online ziyaretçiler sys*/}
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Şu An Online</p>
                            <h2 className="text-4xl font-bold text-sepia-dark mt-2">{stats.online}</h2>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <Activity size={24} className="text-green-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xs text-green-600 mt-4 font-bold">Aktif Kullanıcı</p>
                </div>

                {/* aylık giriş sys */}
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Aylık Giriş Sayısı</p>
                            <h2 className="text-4xl font-bold text-sepia-dark mt-2">{stats.monthlyVisitors}</h2>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <TrendingUp size={24} className="text-purple-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Son 30 gün</p>
                </div>

                {/* kaç üye var*/}
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Kayıtlı Üye</p>
                            <h2 className="text-4xl font-bold text-sepia-dark mt-2">{stats.totalUsers}</h2>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <Users size={24} className="text-red-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Veritabanındaki kullanıcılar</p>
                </div>

                {/* toplam kaç mekan var */}
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Arşivdeki Mekan</p>
                            <h2 className="text-4xl font-bold text-sepia-dark mt-2">{stats.totalLocations}</h2>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <MapPin size={24} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-blue-500 mt-4 font-medium">Haritadaki noktalar</p>
                </div>

                {/* toplam yorum/anı sys */}
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Paylaşılan Anı</p>
                            <h2 className="text-4xl font-bold text-sepia-dark mt-2">{stats.totalStories}</h2>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <MessageSquare size={24} className="text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Kullanıcı yorumları</p>
                </div>

            </div>

            {/* most of popular mekan  */}
            <div className="mt-8 bg-gradient-to-r from-sepia-dark to-gray-800 text-white p-8 rounded-lg shadow-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                {/*background*/}
                <TrendingUp size={150} className="absolute -right-10 -bottom-10 text-white opacity-5 pointer-events-none" />

                <div className="z-10">
                    <h3 className="text-sm uppercase tracking-widest opacity-80 font-mono mb-2 text-brand-red">🏆 Ziyaretçilerin Favorisi</h3>
                    <h2 className="text-3xl md:text-5xl font-bold">{stats.mostPopularLocation}</h2>
                    <p className="mt-4 text-sm opacity-70 max-w-lg">
                        Bu mekan, kullanıcılar tarafından en çok yorum yapılan ve anı paylaşılan yer olarak öne çıkıyor.
                    </p>
                </div>

                <div className="mt-6 md:mt-0 z-10">
                    {stats.mostPopularLocationSlug ? (
                        <Link to={`/location/${stats.mostPopularLocationSlug}`} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded flex items-center gap-2 transition " title="Detaya Git">
                            Mekanı İncele <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <button onClick={fetchData} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded flex items-center gap-2 transition">
                            <RefreshCw size={16} /> Yenile
                        </button>
                    )}
                </div>
            </div>
            {/* duyuu bölümü */}
            <div className="mt-10 mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-mono text-sepia-dark flex items-center gap-2">
                        <Megaphone className="text-orange-500" /> Duyuru ve Haber Yönetimi
                    </h2>
                    <Link to="/admin/add-announcement" className="bg-brand-red text-white px-4 py-2 rounded shadow hover:bg-red-700 transition flex items-center gap-2 font-bold">
                        <PlusCircle size={20} /> Yeni Duyuru Ekle
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                <th colSpan="2" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {announcements.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Henüz hiç duyuru eklenmemiş.
                                    </td>
                                </tr>
                            ) : (
                                announcements.map((ann) => (
                                    <tr key={ann.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ann.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ann.isActive ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Yayında</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Pasif</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ann.createdAt).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/admin/edit-announcement/${ann.slug}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                                                <Edit size={16} /> Düzenle
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1">
                                                <Trash2 size={16} /> Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
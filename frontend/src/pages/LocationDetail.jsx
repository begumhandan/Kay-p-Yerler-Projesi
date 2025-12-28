import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Edit, MapPin, Trash2, Info } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api";
import CompareSlider from "../components/CompareSlider";
import Gallery from "../components/Gallery";

const DEFAULT_AVATAR = "/public/defaultkullanıcı.png";

const LocationDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [newStory, setNewStory] = useState("");
  const [loading, setLoading] = useState(true);

  // Sadece sessionStorage kullanılıyor
  const isAuthenticated = !!sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    api
      .get(`/locations/${slug}`)
      .then((res) => {
        setLocation(res.data);
        console.log("Mekan Durumu:", res.data.status);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "yikildi":
        return "Yıkıldı";
      case "risk altinda":
        return "Risk Altında";
      case "restore edildi":
        return "Restore Edildi";
      case "degisti":
        return "İşlev Değiştirdi";
      default:
        return status || "Bilinmiyor";
    }
  };

  const handleDelete = async () => {
    if (!location) return;

    toast((t) => (
      <div className="flex flex-col gap-4 p-2 items-center">
        <span className="font-semibold text-gray-800">
          Bu mekanı silmek istediğinize emin misiniz?
        </span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/locations/${location.id}`);
                toast.success("Mekan başarıyla silindi.");
                navigate("/");
              } catch (error) {
                console.error(error);
                toast.error("Silme işlemi başarısız oldu.");
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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        background: '#fff',
      },
    });
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    if (!location) return;

    try {
      await api.post("/stories", {
        content: newStory,
        locationId: location.id,
      });
      toast.success("Hikayeniz gönderildi! Editör onayından sonra yayınlanacaktır.", { duration: 4000 });
      setNewStory("");
    } catch (err) {
      toast.error("Hikaye gönderilemedi.");
    }
  };

  useEffect(() => {
    if (location && location.title) {
      document.title = `${location.title} | Kayıp Yerler`;
    } else {
      document.title = "Kayıp Yerler";
    }

    // sayfadan çıkınca başlığı eski haline getirsin
    return () => {
      document.title = "Kayıp Yerler";
    };
  }, [location]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-6 mb-20">
        <div className="text-center mt-10 text-black">Yükleniyor...</div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-6 mb-20">
        <div className="text-center mt-10 text-black">Mekan bulunamadı.</div>
      </div>
    );
  }

  const stories = location.stories || [];
  const addressText = location.address || location.addres;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 mb-20">

      {/* başlık ve yıllar*/}
      <div className="flex flex-col items-center text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-black font-sans tracking-tight">
          {location.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold mt-4">
          <span className="bg-red-700 text-gray-200 px-3 py-1 rounded border border-red-800 flex items-center gap-2">
            <Calendar size={14} /> {location.yearBefore}
          </span>
          <span className="text-gray-800 font-extrabold">➔</span>
          <span className="bg-black text-gray-200 px-3 py-1 rounded border border-primary/20 flex items-center gap-2">
            <Calendar size={14} /> {location.yearAfter}
          </span>
        </div>
      </div>

      {/* solda adres ve durum, sağda butonlar:düzenle ve sil alt alta*/}
      <div className="flex flex-col md:flex-row justify-between items-center w-full mb-10 gap-4 border-b border-gray-200/20 pb-4">

        {/* SOL: Adres ve Durum */}
        <div className="flex flex-col gap-3 items-start">
          {/* Adres */}
          {addressText && (
            <div className="flex items-center gap-2 text-gray-800 text-lg font-medium opacity-80">
              <MapPin size={20} className="text-red-600" />
              <span>{addressText}</span>
            </div>
          )}

          {/* Durum Badge */}
          <div className="bg-black/20 rounded-full px-2 py-1 flex items-center gap-2 text-gray-800 font-bold text-base ml-2 text-size-sm">
            <span>{getStatusInfo(location.status)}</span>
          </div>
        </div>

        {/* SAĞ: Butonlar - adminse ve editorse */}
        {(role === "admin" || role === "editor") && (
          <div className="flex items-center gap-3">
            <Link
              to={`/edit-location/${location.slug}`}
              className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition border border-blue-600/30"
            >
              <Edit size={16} /> Düzenle
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition border border-red-600/30"
            >
              <Trash2 size={16} /> Sil
            </button>
          </div>
        )}
      </div>

      {/* slider*/}
      <div className="mb-12 shadow-2xl rounded-2xl overflow-hidden border border-gray-800">
        <CompareSlider beforeImage={location.imageBeforeUrl} afterImage={location.imageAfterUrl} />
      </div>

      {/* Galeri galerisi */}
      {location.images && location.images.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3 border-b border-gray-800 pb-4">
            <span className="w-1.5 h-8 bg-black rounded-full"></span>
            Mekan Galerisi
          </h2>
          <Gallery images={location.images} />
        </div>
      )}

      {/* mekan hikaye */}
      <div className="bg-surface p-8 md:p-10 rounded-2xl border border-gray-800 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3 border-b border-gray-800 pb-4">
          <span className="w-1.5 h-8 bg-primary rounded-full"></span>
          Mekanın Hikayesi
        </h2>
        <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-light whitespace-pre-line">
          {location.description}
        </p>
      </div>

      {/* ziyaretçi anılar/yorumları */}
      <div className="bg-surface p-8 rounded-2xl border border-gray-800 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-4">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            Ziyaretçi Anıları
            <span className="text-sm font-bold bg-black px-3 py-1 rounded-full text-gray-100 border border-gray-900">
              {stories.length} Yorum
            </span>
          </h3>
        </div>

        <div className="flex flex-col gap-12">

          {/* Yorum ekleme form */}
          <div className="w-full max-w-4xl mx-auto">
            <h4 className="text-lg font-bold text-gray-700 mb-4 text-center md:text-left">Bir Anı Bırak</h4>
            {isAuthenticated ? (
              <form onSubmit={handleStorySubmit} className="relative">
                <textarea
                  required
                  rows={4}
                  className="w-full p-4 bg-black/30 border border-gray-700 rounded-xl text-black text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition resize-none placeholder-gray-500"
                  placeholder="Bu mekanla ilgili bir hatıran var mı? "
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full mt-3 bg-white hover:bg-gray-100 text-black py-3 rounded-xl font-bold transition text-sm flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Paylaş
                </button>
              </form>
            ) : (
              <div className="text-center p-8 bg-gray-500/20 rounded-xl border border-dashed border-gray-100">
                <p className="text-gray-700 mb-4">Anılarını paylaşmak için giriş yapmalısın.</p>
                <Link
                  to="/login"
                  className="inline-block bg-primary/10 text-primary px-6 py-2 rounded-lg font-bold hover:bg-primary/20 transition"
                >
                  Giriş Yap
                </Link>
              </div>
            )}
          </div>

          {/* yorumlar */}
          <div className="w-full max-w-4xl mx-auto">
            <h4 className="text-lg font-bold text-gray-700 mb-4 text-center md:text-left">Yorumlar</h4>
            <div className="space-y-4">
              {stories.length === 0 && (
                <div className="text-center py-10 opacity-50 bg-black/20 rounded-xl">
                  <p className="text-gray-500 italic">Henüz bir anı paylaşılmamış.</p>
                  <p className="text-sm text-gray-400">İlk sen ol!</p>
                </div>
              )}

              {stories.map((story) => {
                // yazar bilgisi al
                const author = story.author || {};
                // avatar url varsa getri yoksa default
                const avatarUrl = author.avatarUrl || DEFAULT_AVATAR;

                return (
                  <div
                    key={story.id}
                    className="bg-black/20 p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition group"
                  >

                    <div className="flex gap-4 items-start">

                      <div className="flex-shrink-0">
                        <img
                          src={avatarUrl}
                          alt={`${author.username} avatar`}

                          className="w-10 h-10 rounded-full object-cover border border-gray-600"
                        />
                      </div>

                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-800/50">
                          <span className="text-sm font-bold text-gray-100 flex items-center gap-2">
                            {author.username}
                          </span>
                          <span className="text-[12px] text-gray-700 font-mono">
                            {formatDate(story.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm italic leading-relaxed">
                          "{story.content}"
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default LocationDetail;
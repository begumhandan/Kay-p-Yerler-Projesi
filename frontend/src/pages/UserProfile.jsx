import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { User, Mail, Shield, Calendar, MessageSquare, ArrowRight, MapPin, Camera, Trash2, LogOut, Settings } from "lucide-react";
import toast from "react-hot-toast";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Sadece sessionStorage kullan
  const userId = sessionStorage.getItem("userId");
  const isOwnProfile = true;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false); // loading kapatıldı.
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
      } catch (error) {
        console.error("Profil yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, navigate]);

  // başlık
  useEffect(() => {
    if (user && user.username) {
      document.title = `${user.username} | Kayıp Yerler`;
    } else {
      document.title = "Profil | Kayıp Yerler";
    }
    return () => {
      document.title = "Kayıp Yerler";
    };
  }, [user]);

  // resim seçilirse çalışsın
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    const toastId = toast.loading("Fotoğraf yükleniyor...");

    try {
      // Backend'e gönder
      const res = await api.put(`/users/${userId}/avatar`, formData);

      // State'i güncelle -sayfayı yenilemeden resim değişsin
      setUser((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));

      toast.success("Profil fotoğrafı güncellendi!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Yükleme başarısız.", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  //hesabı kalıcı filme fonk
  const handleDeleteAccount = () => {
    toast((t) => (
      <div className="flex flex-col gap-4 p-2 items-center">
        <span className="font-semibold text-gray-800 text-center">
          Hesabınızı KALICI OLARAK silmek istediğinize emin misiniz? <br />
          <span className="text-red-500 text-xs">Bu işlem geri alınamaz!</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/users/${userId}`);

                //storage temizle
                localStorage.clear();
                sessionStorage.clear();

                toast.success("Hesabınız başarıyla silindi.", { duration: 3000 });

                setTimeout(() => {
                  navigate("/login");
                  window.location.reload();
                }, 1000);
              } catch (error) {
                console.error(error);
                toast.error("Hesap silinemedi.");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-bold transition"
          >
            Evet, Hesabımı Sil
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
      duration: 6000,
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

  if (loading) return <div className="text-center mt-20 text-gray-500">Profil yükleniyor...</div>;
  if (!user) return <div className="text-center mt-20 text-red-500">Kullanıcı bulunamadı.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/*profil */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10 border border-gray-100 relative">
        {/*arkaplan */}
        <div className="bg-gradient-to-r from-sepia-dark to-gray-800 h-32 relative"></div>

        <div className="px-8 pb-8">
          {/* avatar*/}
          <div className="relative -mt-12 mb-4 w-fit">
            <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg overflow-hidden group relative">

              {/* avatar varsa avatra yoksa default foto */}
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <User size={40} />
                </div>
              )}

              {/* hover olunca kamera ikonu çıkar */}
              {isOwnProfile && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Camera size={24} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.username}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
              <Shield size={16} className="text-amber-600" />
              <span className="capitalize font-medium">{user.role}</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
              <Mail size={16} className="text-blue-600" />
              <span>{user.email}</span>
            </div>
          </div>
          {isOwnProfile && (
            <div className="absolute top-4 right-4 flex gap-2">


              {/* hesap sil butonu */}
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold transition"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Hesabı Sil</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* yazdığı hikayeler*/}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MessageSquare className="text-brand-red" />
          Paylaşılan Anılar ({user.stories ? user.stories.length : 0})
        </h2>

        {user.stories && user.stories.length > 0 ? (
          <div className="grid gap-6">
            {user.stories.map((story) => (
              <div key={story.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col">
                <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    {formatDate(story.createdAt)}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${story.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {story.isApproved ? "Yayında" : "Onay Bekliyor"}
                  </span>
                </div>

                <div className="mb-3">
                  <h3 className="text-lg font-bold text-sepia-dark flex items-center gap-2">
                    <MapPin size={18} className="text-brand-red" />
                    {story.location ? story.location.title : "Bilinmeyen Mekan"}
                  </h3>
                </div>

                <p className="text-gray-700 italic text-base leading-relaxed mb-4">
                  "{story.content}"
                </p>

                {story.location && (
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link
                      to={`/location/${story.location.slug}`}
                      className="text-amber-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all w-fit"
                    >
                      Mekana Git <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Henüz hiç hikaye paylaşmamışsınız.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
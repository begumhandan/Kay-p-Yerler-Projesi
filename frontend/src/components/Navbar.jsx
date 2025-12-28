import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Map, LogOut, PlusCircle, User, Activity, Bell, X, Menu } from "lucide-react";
import toast from "react-hot-toast";// pop up içi hem api hem de toast import ettim
import { api } from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingCount, setPendingCount] = useState(0);

  // Token var mı? (Giriş yapılmış mı kontrolü)
  // Sadece sessionStorage kontrol ediliyor (Kullanıcı isteği: tarayıcı kapanınca çıkış yapılması)
  const token = sessionStorage.getItem("token");
  const isAuthenticated = !!token;
  const role = sessionStorage.getItem("role");
  const username = sessionStorage.getItem("username");

  //bilidrim kontrolü
  useEffect(() => {
    // Sadece giriş yapan admin ve editör için çalışsın
    if (isAuthenticated && (role === "admin" || role === "editor")) {

      const checkPendingStories = async () => {
        try {
          const res = await api.get("/stories/pending");
          // Backend veri kontrolü (dizi mi obje mi?)
          const totalPending = res.data.count !== undefined ? res.data.count : res.data.length;

          if (totalPending > 0) {
            setPendingCount(totalPending); // Kırmızı nokta (Badge)

            //kullanıcı daha önce "kapat"a bastı mı kontrol et
            const isDismissed = sessionStorage.getItem("notificationDismissed");


            // Eğer kapatmadıysa göster (sayfayı yenilese de gösterir)
            if (!isDismissed) {
              toast.custom((t) => (
                <div
                  className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-96 bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                  {/*zil ikonu*/}
                  <div className="flex-shrink-0 p-4">
                    <div className="bg-yellow-50 p-2 rounded-full">
                      <Bell className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 w-0 p-4 pl-0">
                    <div className="flex items-start">
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-bold text-gray-900">
                          Onay Bekleyenler Var
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Şu an sistemde <span className="font-bold text-red-600">{totalPending} adet</span> bekleyen yorum var.
                        </p>
                      </div>
                    </div>

                    {/* Buton */}
                    <div className="ml-3 mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          toast.dismiss(t.id);
                          navigate("/pending-stories");
                          // incele diyince kapatılmış sayıyoruz
                          sessionStorage.setItem("notificationDismissed", "true");
                        }}
                        className="bg-gray-700 hover:bg-black text-white text-sm font-medium py-1.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 transition shadow-sm"
                      >
                        İncele
                      </button>

                    </div>
                  </div>

                  {/* x butonu */}
                  <div>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        // Xe basıca hafızaya aldık
                        sessionStorage.setItem("notificationDismissed", "true");
                      }}
                      className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-start justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ), {
                id: 'pending-notification-toast', //aynı anda birden fazla açılmasın diye id verdim
                duration: Infinity, //kullanıcı kapatana kadar ekranda kalsın
                position: "bottom-right",
              });
            }
          } else {
            setPendingCount(0);
          }
        } catch (error) {
          setPendingCount(0);
          console.error("Bildirim hatası:", error);
        }
      };
      checkPendingStories();
    }
  }, [isAuthenticated, role, navigate, location.pathname]); // Bu değerler değişince mesela logim olunca tekrar çalışır.navigate,location.pathname kullanmamın nedeni sayfa değişirse badge değişsin. badge:pendingCount

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);

    // Çıkış işlemleri
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("notificationDismissed");

    navigate("/login");
    window.location.reload();
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-sepia-dark text-sepia-light p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 tracking-normal text-gray-100 hover:text-red-700 transition duration-300"
        >
          <img
            src="/kayıpYerler.png"
            alt="Kayıp Yerler Logo"
            className="h-10 md:h-12 w-auto rounded-lg object-contain border border-gray-400/50"
          />
          <span className="font-serif tracking-tight">Kayıp Yerler</span>
        </Link>

        {/* masaüstü menüsü */}
        <div className="hidden lg:flex items-center gap-6">
          {/* giriş yap ve kayıt ol sayfalarında bu linkleri gizle */}
          {!['/login', '/register'].includes(location.pathname) && (
            <>
              <Link to="/locations" className="hover:text-brand-red transition font-medium">
                Mekanlar
              </Link>
              <Link to="/announcements" className="hover:text-brand-red transition font-medium">
                Duyurular
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>{(role === "admin" || role === "editor") && (
              <Link to="/pending-stories" className="flex items-center gap-1 hover:text-brand-red transition font-medium">
                Onay Bekleyen Hikayeler ({pendingCount})
              </Link>
            )}
              {role === "admin" && (
                <>

                  <Link to="/add-location" className="flex items-center gap-1 hover:text-brand-red transition">
                    <PlusCircle size={18} /> Mekan Ekle
                  </Link>

                  <Link to="/admin" className="flex items-center gap-1 text-brand-red hover:text-red-700 font-bold bg-white px-3 py-1 rounded shadow-sm border border-brand-red/20 transition">
                    <Activity size={18} /> Yönetim Paneli
                  </Link>

                </>
              )}



              <div className="flex items-center gap-4 border-l border-gray-600 pl-4">
                <Link
                  to="/profile"
                  className="text-md uppercase text-gray-400 flex items-center gap-1 font-bold hover:text-brand-red transition-colors cursor-pointer"
                  title="Profilime Git"
                >
                  <User size={14} /> {username || role}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
                >
                  <LogOut size={18} /> Çıkış
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-brand-red px-4 py-2 rounded shadow bg-white text-black hover:bg-gray-300 transition">
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="bg-brand-red text-white px-4 py-2 rounded shadow hover:bg-red-700 transition"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        {/* mobil menü */}
        {!['/login', '/register'].includes(location.pathname) && (
          <div className="lg:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        )}

        {['/login', '/register'].includes(location.pathname) && (
          <div className="lg:hidden flex items-center gap-3">
            <Link to="/login" className="hover:text-brand-red px-4 py-2 rounded shadow bg-white text-black hover:bg-gray-300 transition">
              Giriş Yap
            </Link>
            <Link to="/register" className="bg-brand-red text-white px-4 py-2 rounded shadow hover:bg-red-700 transition">
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>

      {/*dropdown-mobil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full right-4 mt-2 w-64 bg-sepia-dark border border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex flex-col text-sm">

            <Link to="/locations" onClick={toggleMobileMenu} className="hover:bg-white/10 px-6 py-3 border-b border-gray-700/50 transition">
              Mekanlar
            </Link>
            <Link to="/announcements" onClick={toggleMobileMenu} className="hover:bg-white/10 px-6 py-3 border-b border-gray-700/50 transition">
              Duyurular
            </Link>

            {isAuthenticated ? (
              <>
                {(role === "admin" || role === "editor") && (
                  <Link to="/pending-stories" onClick={toggleMobileMenu} className="px-6 py-3 text-yellow-400 border-b border-gray-700/50 hover:bg-white/10 transition flex items-center gap-2">
                    ⏳ Onay Bekleyenler ({pendingCount})
                  </Link>
                )}
                {role === "admin" && (
                  <div className="flex flex-col border-b border-gray-700/50">
                    <Link to="/add-location" onClick={toggleMobileMenu} className="px-6 py-3 hover:bg-white/10 transition flex items-center gap-2">
                      <PlusCircle size={16} /> Mekan Ekle
                    </Link>

                    <Link to="/admin" onClick={toggleMobileMenu} className="px-6 py-3 text-brand-red font-bold hover:bg-white/10 transition flex items-center gap-2">
                      <Activity size={16} /> Yönetim Paneli
                    </Link>

                  </div>
                )}



                <div className="flex flex-col py-2">
                  <Link to="/profile" onClick={toggleMobileMenu} className="px-6 py-3 font-bold hover:bg-white/10 transition flex items-center gap-2">
                    <User size={16} /> Profilim
                  </Link>
                  <button onClick={() => { toggleMobileMenu(); handleLogout(); }} className="px-6 py-3 text-red-400 font-bold hover:bg-white/10 transition flex items-center gap-2 w-full text-left">
                    <LogOut size={16} /> Çıkış Yap
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col p-4 gap-2 bg-black/20">
                <Link to="/login" onClick={toggleMobileMenu} className="text-center hover:text-brand-red py-2">
                  Giriş Yap
                </Link>
                <Link to="/register" onClick={toggleMobileMenu} className="bg-brand-red text-white py-2 rounded text-center shadow">
                  Kayıt Ol
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
      {/* çıkış */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-enter text-center border border-gray-200">

            <div className="mb-4 flex justify-center text-red-100 bg-red-50 p-3 rounded-full w-16 h-16 mx-auto items-center">
              <LogOut size={32} className="text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Çıkış Yapılıyor</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Hesabınızdan çıkış yapmak istediğinize emin misiniz?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition border border-gray-300"
              >
                İptal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-bold transition shadow-lg shadow-red-500/30"
              >
                Evet, Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
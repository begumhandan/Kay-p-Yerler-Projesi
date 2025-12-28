import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {

  // Sadece sessionStorage kullan (kapatınca logout olsun)
  const role = sessionStorage.getItem("role");

  const showAdminLink = role === "admin" || role === "editor";
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/*açıklama */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="text-red-500" /> Kayıp Yerler
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Unutulmuş mekanların hikayelerini keşfedin, kendi anılarınızı paylaşın ve tarihe tanıklık edin.
          </p>
          {/* Sosyal Medya İkonları - göstermelik koydum */}
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white transition"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white transition"><Twitter size={20} /></a>
          </div>
        </div>

        {/* site haritası kısmı */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2 inline-block">
            Site Haritası
          </h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-white hover:pl-2 transition-all duration-300">
                › Ana Sayfa
              </Link>
            </li>
            <li>
              {/* mekan sayfası */}
              <Link to="/locations" className="hover:text-white hover:pl-2 transition-all duration-300">
                › Mekanları Keşfet
              </Link>
            </li>
            <li>
              <Link to="/announcements" className="hover:text-white hover:pl-2 transition-all duration-300">
                › Duyurular
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-white hover:pl-2 transition-all duration-300">
                › Profilim
              </Link>
            </li>
            {showAdminLink && (
              <li>
                <Link to="/admin" className="hover:text-white hover:pl-2 transition-all duration-300 text-yellow-500 font-bold">
                  › Yönetim Paneli
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* iletişim*/}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2 inline-block">
            İletişim
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-red-500" />
              <span>Samsun, Türkiye</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              <span>info@kayipyerler.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-green-500" />
              <span>+90 555 55 55</span>
            </li>
          </ul>
        </div>
      </div>

      {/* telif*/}
      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Kayıp Yerler Projesi. Tüm hakları saklıdır.
      </div>
    </footer>
  );
};

export default Footer;
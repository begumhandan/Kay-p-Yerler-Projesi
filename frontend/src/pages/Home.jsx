import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { ArrowRight, Calendar, History, Camera, MessageCircle, ChevronRight, MapPin } from "lucide-react";

// Resimler public klasöründe olduğu için import etmeye gerek yok, string olarak kullanıyoruz.
const heroImages = ["/galata_kulesi.jpg", "/resim.jpg", "/resim_1.jpg"];

const Home = () => {
  const [featuredLocations, setFeaturedLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slider State'i
  const [currentSlide, setCurrentSlide] = useState(0);

  //anasayfa foto zamanlayıcısı
  useEffect(() => {
    const slideInterval = setInterval(() => {
      // Mevcut slide index'ini 1 artır, eğer son resme geldiyse başa yani 0 a dön.
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5 Saniye

    // Component unmount olduğunda interval'i temizle.
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    api
      .get("/locations")
      .then((res) => {
        const data = res.data || [];
        const latest = data.slice(0, 3);
        setFeaturedLocations(latest);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    document.title = "Kayıp Yerler";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/*slider*/}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* slider */}
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroImages.map((img, index) => (
            <div key={index} className="min-w-full h-full relative">
              {/*resim */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${img}")` }}
              ></div>
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
          ))}
        </div>

        {/* içerik */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border border-amber-500/50 bg-amber-900/30 backdrop-blur-sm text-amber-400 text-sm font-semibold tracking-wider uppercase animate-fade-in-up">
            Dijital Kent Arşivi
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            Kaybolan Şehrin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
              İzlerini Sür
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Yıkılan binalar, değişen sokaklar ve unutulan hatıralar... Şehrin hafızasından silinen yapıları dijital
            ortamda yeniden keşfet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/locations"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-amber-900/50"
            >
              Arşivi Keşfet
              <ArrowRight size={20} />
            </Link>

          </div>
        </div>

        {/* slider noktaları */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-amber-500 w-8" : "bg-white/50 hover:bg-white"
                }`}
            />
          ))}
        </div>

        {/* alt dekorasyon */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10"></div>
      </div>

      {/* ozellikler */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group p-8 rounded-3xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100">
              <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/20">
                <History size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zaman Yolculuğu</h3>
              <p className="text-gray-600 leading-relaxed">
                Slider teknolojisi ile mekanların eski ve yeni hallerini üst üste koyarak karşılaştırın.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100">
              <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/20">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hatıraları Yaşat</h3>
              <p className="text-gray-600 leading-relaxed">
                Eski sinemalar, okullar veya parklar... Mekanlara ait anılarınızı yazın, hikayeleri okuyun.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100">
              <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/20">
                <Camera size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Görsel Hafıza</h3>
              <p className="text-gray-600 leading-relaxed">
                Yüksek çözünürlüklü eski fotoğraflar ve detaylı konum bilgileriyle şehri keşfedin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* onerilen mekanlar */}
      <div className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-amber-600 font-bold tracking-wider uppercase text-sm">Son Eklenenler</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Kayıp Mekanlar</h2>
            </div>
            <Link
              to="/locations"
              className="hidden md:flex items-center gap-2 text-gray-600 font-bold hover:text-amber-600 transition-colors group"
            >
              Tümünü Gör
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredLocations.map((loc) => (
                <Link
                  key={loc.id}
                  to={`/location/${loc.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={loc.imageBeforeUrl}
                      alt={loc.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                      {loc.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {loc.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{loc.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      {/* sol: tarih ve adres */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                          <Calendar size={14} className="text-amber-500" />
                          <span>
                            {loc.yearBefore} - {loc.yearAfter}
                          </span>
                        </div>
                        {/*adres*/}
                        {(loc.address || loc.addres) && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin size={12} />
                            <span className="line-clamp-1">{loc.address || loc.addres}</span>
                          </div>
                        )}
                      </div>

                      {/* buton */}
                      <span className="text-amber-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        İncele <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link to="/locations" className="inline-flex items-center gap-2 text-amber-600 font-bold">
              Tüm Arşivi Gör <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home;
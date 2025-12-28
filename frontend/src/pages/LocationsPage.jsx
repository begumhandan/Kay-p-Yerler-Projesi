import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { MapPin, Search, Filter, Star, Grid3x3, List, SlidersHorizontal, Calendar, X } from "lucide-react";

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = "Mekanlar | Kayıp Yerler";
    return () => {
      document.title = "Kayıp Yerler";
    };
  }, []);

  useEffect(() => {
    api
      .get("/locations")
      .then((res) => {
        setLocations(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  //kategorileri benzersiz olarak al
  const categories = ["Tümü", ...new Set(locations.map((loc) => loc.category || "Diğer"))];

  // filtreleme yap
  let filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Tümü" || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sıralama yap
  if (sortBy === "oldest") {
    filteredLocations = [...filteredLocations].sort((a, b) => (a.yearBefore || 0) - (b.yearBefore || 0));
  } else if (sortBy === "newest") {
    filteredLocations = [...filteredLocations].sort((a, b) => b.id - a.id);
  }

  // popüler mekanlar => ilk 5 tanesi
  const popularLocations = locations.slice(0, 5);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tümü");
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Mekanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen">
      {/* header */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">Kayıp Mekanlar Arşivi</h1>
            <p className="text-xl text-amber-100">
              Türkiye'nin hafızasından silinen {locations.length} yapıyı keşfedin. Geçmişin izlerini takip edin ve
              şehrin hikayesine ortak olun.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 mb-12">
        {/* öne çıkan mekanlar */}
        {popularLocations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <Star className="text-amber-500 fill-amber-500" size={28} />
                Öne Çıkan Mekanlar
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {popularLocations.map((loc) => (
                <Link
                  to={`/location/${loc.slug}`}
                  key={loc.id}
                  className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url("${loc.imageBeforeUrl}")` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-amber-300 transition-colors">
                      {loc.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-amber-600 px-2 py-1 rounded">{loc.yearBefore}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* arama-filtre */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* arama*/}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Mekan veya açıklama ara..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 bg-gray-50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* view*/}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-xl transition-colors ${viewMode === "grid" ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                title="Grid görünümü"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 rounded-xl transition-colors ${viewMode === "list" ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                title="Liste görünümü"
              >
                <List size={20} />
              </button>
            </div>

            {/* toggle filtre */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors ${showFilters ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <SlidersHorizontal size={20} />
              Filtreler
            </button>
          </div>

          {/* filtre paneli */}
          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* kategoriler */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Kategori</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory === cat
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* sıralama */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Sırala</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 bg-gray-50"
                  >
                    <option value="newest">En Yeni Eklenenler</option>
                    <option value="oldest">En Eski Tarih</option>
                  </select>
                </div>
              </div>

              {/* temizle */}
              {(searchTerm || selectedCategory !== "Tümü" || sortBy !== "newest") && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                >
                  <X size={16} />
                  Filtreleri Temizle
                </button>
              )}
            </div>
          )}

          {/*sonuç */}
          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            <span className="font-semibold">{filteredLocations.length}</span> mekan bulundu
          </div>
        </div>

        {/* mekan listele */}
        {filteredLocations.length > 0 ? (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredLocations.map((loc) =>
              viewMode === "grid" ? (
                <Link
                  to={`/location/${loc.slug}`}
                  key={loc.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("${loc.imageBeforeUrl}")` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="absolute top-4 right-4">
                      <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-lg">
                        {loc.category || "Genel"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors flex-1">
                        {loc.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{loc.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {/* sol=> tarih - adres  */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>
                            {loc.yearBefore} - {loc.yearAfter}
                          </span>
                        </div>
                        {/* adres */}
                        {(loc.address || loc.addres) && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin size={12} />
                            <span className="line-clamp-1">{loc.address || loc.addres}</span>
                          </div>
                        )}
                      </div>

                      {/* sağ=> botunlar */}
                      <span className="text-amber-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Detayları Gör
                        <MapPin size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  to={`/location/${loc.slug}`}
                  key={loc.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row border border-gray-100"
                >
                  <div className="relative md:w-80 h-48 md:h-auto overflow-hidden flex-shrink-0">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("${loc.imageBeforeUrl}")` }}
                    ></div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
                          {loc.title}
                        </h3>
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-700 whitespace-nowrap ml-4">
                          {loc.category || "Genel"}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">{loc.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {/* sol=> adres - tarih => liste görünüm */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>
                            {loc.yearBefore} - {loc.yearAfter}
                          </span>
                        </div>
                        {(loc.address || loc.addres) && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin size={12} />
                            <span>{loc.address || loc.addres}</span>
                          </div>
                        )}
                      </div>

                      <span className="text-amber-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Detayları Gör
                        <MapPin size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Filter size={64} className="mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Sonuç Bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              Aradığınız kriterlere uygun mekan bulunamadı. Farklı filtreler deneyebilirsiniz.
            </p>
            <button
              onClick={clearFilters}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPage;
import { useState } from 'react';
import { X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// css kısmı
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Gallery = ({ images }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [initialSlide, setInitialSlide] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const visibleImages = images.slice(0, 5); // İlk 5 resim
    const hiddenCount = images.length - 5; // Kaç tane daha fazla resim varsa hidden yap isteyen üstüne basıp baksın

    const openLightbox = (index) => {
        setInitialSlide(index);
        setIsOpen(true);
    };

    return (
        <>
            {/* Grid Görünümü */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
                {visibleImages.map((img, index) => {
                    // İlk resim büyük olsun 
                    // 5. resim eğer fazlası varsa daha fazla ile gösterilir
                    const isLast = index === 4;
                    const showOverlay = isLast && hiddenCount > 0;

                    return (
                        <div
                            key={img.id || index}
                            onClick={() => openLightbox(index)}
                            className={`relative cursor-pointer group overflow-hidden rounded-xl border border-gray-800 ${index === 0 ? 'col-span-2 row-span-2 h-[300px] md:h-[400px]' : 'h-[145px] md:h-[195px]'}`}
                        >
                            <img
                                src={img.imageUrl}
                                alt={`Galeri ${index}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Hover Efekti */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* +X Overlay (Son Resim ve Fazlası Varsa) */}
                            {showOverlay && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl md:text-2xl backdrop-blur-sm">
                                    +{hiddenCount + 1} Fotoğraf
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Lightbox / Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-md">
                    {/* Kapat Butonu */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 text-white hover:text-gray-300 z-[60] p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition shadow-lg"
                    >
                        <X size={28} />
                    </button>

                    {/* Swiper Slider (Full Ekran) */}
                    <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center relative">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation
                            pagination={{ clickable: true, type: 'fraction' }}
                            initialSlide={initialSlide}
                            className="w-full h-full flex items-center"
                            spaceBetween={40}
                        >
                            {images.map((img, idx) => (
                                <SwiperSlide key={img.id || idx} className="flex items-center justify-center !h-full p-2">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <img
                                            src={img.imageUrl}
                                            alt={`Full Galeri ${idx}`}
                                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;


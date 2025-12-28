import { useState } from 'react';

const CompareSlider = ({ beforeImage, afterImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);

    const handleMove = (e) => {
        setSliderPosition(Number(e.target.value));
    };

    return (
        <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-lg shadow-2xl border-4 border-sepia-dark select-none group">

            {/* Alttaki Resim (SONRA - Renkli/Yeni) */}
            <img
                src={afterImage}
                alt="After"
                className="absolute top-0 left-0 w-full h-full object-cover"
            />

            {/* Üstteki Resim (ÖNCE - Eski) - Clip Path ile kestik */}
            <div
                className="absolute top-0 left-0 w-full h-full object-cover border-r-2 border-white"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
                {/* Eski Yıl Etiketi */}
                <span className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 text-xs rounded uppercase font-mono tracking-widest">
                    Geçmiş
                </span>
            </div>

            {/* Yeni Yıl Etiketi (Sağ üstte sabit) */}
            <span className="absolute top-4 right-4 bg-brand-red/80 text-white px-2 py-1 text-xs rounded uppercase font-mono tracking-widest">
                Günümüz
            </span>

            {/* Kontrol Çubuğu (Range Input) - Görünmez ama etkileşimli */}
            <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleMove}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Görsel Sürgü Çizgisi */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none transition-all duration-75"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-brand-red font-bold">
                    ↔
                </div>
            </div>
        </div>
    );
};

export default CompareSlider;
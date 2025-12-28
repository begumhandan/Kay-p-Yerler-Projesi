const slugify = (text) => {
    if (!text) return "";

    const trMap = {
        ç: "c",
        Ç: "c",
        ğ: "g",
        Ğ: "g",
        ş: "s",
        Ş: "s",
        ü: "u",
        Ü: "u",
        ı: "i",
        İ: "i",
        ö: "o",
        Ö: "o",
    };

    return text
        .split("")
        .map((char) => trMap[char] || char)
        .join("")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Alfanümerik olmayanları sil
        .trim()
        .replace(/\s+/g, "-") // Boşlukları tireye çevir
        .replace(/-+/g, "-"); // Çoklu tireleri teke indir
};

module.exports = { slugify };

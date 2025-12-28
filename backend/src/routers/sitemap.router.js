const { Router } = require("express");
const { db } = require("../db");
const { locations, announcements } = require("../db/schema");
const { eq } = require("drizzle-orm");

const router = Router();

// Domain adresi 
const BASE_URL = "http://localhost:5173";

router.get("/sitemap.xml", async (req, res) => {
    try {
        //statik sayfalar
        const staticPages = [
            "",
            "/locations",
            "/announcements",
            "/login",
            "/register",
        ];

        // dinamik mekanlar
        const allLocations = await db.query.locations.findMany({
            columns: { slug: true, updatedAt: true }
        });

        // aktif duyurular
        const allAnnouncements = await db.query.announcements.findMany({
            where: eq(announcements.isActive, true),
            columns: { slug: true, updatedAt: true }
        });

        // XML Oluşturma
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // statik sayfalar ekle
        staticPages.forEach((page) => {
            xml += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // mekanları ekle
        allLocations.forEach((loc) => {
            xml += `
  <url>
    <loc>${BASE_URL}/location/${loc.slug}</loc>
    <lastmod>${new Date(loc.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
        });

        //duyuruları ekle
        allAnnouncements.forEach((ann) => {

        });

        xml += `
</urlset>`;

        res.header("Content-Type", "application/xml");
        res.send(xml);

    } catch (error) {
        console.error("Sitemap error:", error);
        res.status(500).send("Sitemap oluşturulurken hata meydan geldi.");
    }
});

module.exports = router;

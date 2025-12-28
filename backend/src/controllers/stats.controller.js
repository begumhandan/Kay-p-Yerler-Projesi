const { gt, count, desc, eq, sum } = require("drizzle-orm");
const { db } = require("../db");
const { users, visitors, locations, stories } = require("../db/schema");

const getVisitorsStats = async (req, res) => {
    try {
        const now = Date.now();

        const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

        // Ziyaretçi Analizi
        // Son 5 dakikada aktif olanlar (Online)
        const onlineResult = await db.select({ count: count() })
            .from(visitors)
            .where(gt(visitors.lastActive, fiveMinutesAgo));

        // Toplam ziyaretçi
        const totalVisitorsResult = await db
            .select({ total: sum(visitors.visitCount) })
            .from(visitors);

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // son 1 ay ziyaretçi sayısı (Aktif olanlar - Toplam Giriş/Tıklama Sayısı)
        let monthlyVisitorsResult = [{ total: 0 }];
        try {
            monthlyVisitorsResult = await db.select({ total: sum(visitors.visitCount) })
                .from(visitors)
                .where(gt(visitors.lastActive, oneMonthAgo));
        } catch (err) {
            console.error("Monthly visitors query failed:", err);
            // Fallback to 0
        }

        //içerik analizi =>toplam sayı
        const totalLocationResult = await db.select({ count: count() })
            .from(locations);

        const totalStoriesResult = await db.select({ count: count() })
            .from(stories);

        const totalUsersResult = await db.select({ count: count() })
            .from(users);

        //  En Çok Yorum Alan Mekan (Popüler Mekan)
        // Hikayeleri mekan ID'sine göre grupla ve say
        const popularLocationQuery = await db.select({
            locationId: stories.locationId,
            storyCount: count(stories.id)
        })
            .from(stories)
            .groupBy(stories.locationId)
            .orderBy(desc(count(stories.id)))
            .limit(1);

        let mostPopularLocationTitle = "Veri Yok";
        let mostPopularLocationSlug = null;

        // Eğer en az bir hikaye varsa, o mekanın ismini bul
        if (popularLocationQuery.length > 0) {
            const loc = await db.query.locations.findFirst({
                where: eq(locations.id, popularLocationQuery[0].locationId)
            });
            if (loc) {
                mostPopularLocationTitle = loc.title;
                mostPopularLocationSlug = loc.slug;
            }
        }

        // Sonuçları döndür
        res.json({
            online: Number(onlineResult[0]?.count || 0),
            totalVisitors: Number(totalVisitorsResult[0]?.total || 0),
            monthlyVisitors: Number(monthlyVisitorsResult[0]?.total || 0),
            totalLocations: Number(totalLocationResult[0]?.count || 0),
            totalStories: Number(totalStoriesResult[0]?.count || 0),
            totalUsers: Number(totalUsersResult[0]?.count || 0),
            mostPopularLocation: mostPopularLocationTitle,
            mostPopularLocationSlug: mostPopularLocationSlug
        });

    } catch (error) {
        console.error('İstatistik hatası:', error);
        res.status(500).json({ error: 'İstatistikler alınamadı' });
    }
};

module.exports = {
    getVisitorsStats
};
// src/middleware/visitor.middleware.js
const { eq, sql } = require("drizzle-orm");
const { db } = require("../db");
const { visitors } = require("../db/schema");

const trackVisitor = async (req, res, next) => {
    // kullanıcının tarayıcısında "visited" çerezi var mı kontrol
    // Varsa, bu kişiyi zaten saydık demektir. Veritabanını yormadan devam et

    try {
        //ip adresi bulma
        const forwarded = req.headers['x-forwarded-for'];
        const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded) || req.socket.remoteAddress || '0.0.0.0';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const now = new Date();

        // veritabanı
        // IP kayıtlı mı diye bak
        const existingVisitor = await db.query.visitors.findFirst({
            where: eq(visitors.ipAddress, ip)
        });

        if (existingVisitor) {

            // Son etkinlikten bu yana geçen süre (milisaniye)
            const timeDiff = now - new Date(existingVisitor.lastActive).getTime();

            // Eğer 1 saatten kısa süre geçmişse, sayacı artırma (Sayfa yenilendiğinde gelen çoklu istekleri engeller)
            if (timeDiff < 3600000) {
                await db.update(visitors)
                    .set({
                        lastActive: now,
                        userAgent: userAgent
                    })
                    .where(eq(visitors.id, existingVisitor.id));
            } else {
                await db.update(visitors)
                    .set({
                        visitCount: sql`${visitors.visitCount} + 1`,
                        lastActive: now,
                        userAgent: userAgent
                    })
                    .where(eq(visitors.id, existingVisitor.id));
            }

        } else {

            await db.insert(visitors)
                .values({
                    ipAddress: ip,
                    userAgent: userAgent,
                    lastActive: new Date(now),
                    visitCount: 1
                });
        }

        if (!req.cookies?.has_visited) {
            res.cookie("has_visited", "true", {
                maxAge: 24 * 60 * 60 * 1000, // 24 saat (1 gün)
                httpOnly: true
            });
        }
    } catch (error) {
        console.error('Ziyaretçi takip hatası:', error);
    }

    next();
};

module.exports = { trackVisitor };
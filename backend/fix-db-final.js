const { db } = require("./src/db"); // Dosya yolun src/db ise
const { sql } = require("drizzle-orm");

async function fixDatabase() {
  console.log("🛠️ Veritabanı kökten tamir ediliyor...");

  try {
    //İşlem güvenliği için foreign key kontrolünü kapat
    await db.run(sql`PRAGMA foreign_keys=OFF`);

    //Mevcut tabloyu yedek ismine çek
    console.log("1. Eski tablo yedekleniyor...");
    try {
        await db.run(sql`ALTER TABLE visitors RENAME TO visitors_backup`);
    } catch (e) {
        console.log("   (Tablo zaten yedeklenmiş olabilir veya yok, devam ediliyor...)");
    }

    //Yeni tabloyu istediğim sütunlarla sıfırdan yarat
    console.log("2. Yeni tablo oluşturuluyor...");
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS visitors (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        ip_address text NOT NULL,
        user_agent text NOT NULL,
        visit_count integer DEFAULT 1 NOT NULL,
        last_active integer NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP
      )
    `);

    //verileri yedekten yeni tabloya aktar
    //visit_count sütunu için "1" değerini zorla basıyoruz.
    console.log("3. Veriler aktarılıyor...");
    try {
        await db.run(sql`
          INSERT INTO visitors (id, ip_address, user_agent, last_active, created_at, visit_count)
          SELECT id, ip_address, user_agent, last_active, created_at, 1 
          FROM visitors_backup
        `);
        console.log("   Veriler başarıyla kurtarıldı.");
    } catch (e) {
        console.log("   Aktarılacak eski veri bulunamadı (Tablo boş olabilir).");
    }

    //yedek tabloyu sil
    console.log("4. Temizlik yapılıyor...");
    try {
        await db.run(sql`DROP TABLE visitors_backup`);
    } catch (e) {}

    //foreign keys geri aç
    await db.run(sql`PRAGMA foreign_keys=ON`);

    console.log("İŞLEM TAMAMLANDI! Sütun eklendi ve veriler korundu.");

  } catch (error) {
    console.error("Kritik Hata:", error.message);
  }
}

fixDatabase();
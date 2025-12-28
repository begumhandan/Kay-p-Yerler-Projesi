const { db } = require("./src/db"); 
const { sql } = require("drizzle-orm");

async function fixDatabase() {
  console.log("🛠️ Veritabanı tamiri başlıyor...");

  try {
    // Sütunu manuel olarak ekliyoruz
    await db.run(sql`ALTER TABLE visitors ADD COLUMN visit_count integer DEFAULT 1 NOT NULL`);
    console.log("BAŞARILI: visit_count sütunu eklendi!");
  } catch (error) {
    if (error.message.includes("duplicate column")) {
        console.log("Bilgi: Sütun zaten varmış, sorun yok.");
    } else {
        console.error("Hata oluştu:", error.message);
    }
  }
}

fixDatabase();
const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
    console.log("Tablo oluşturuluyor...");
    db.exec(`
    CREATE TABLE IF NOT EXISTS announcement_images (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      image_url text NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      announcement_id integer NOT NULL,
      FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON UPDATE no action ON DELETE cascade
    );
  `);
    console.log("BAŞARILI: 'announcement_images' tablosu oluşturuldu!");
} catch (error) {
    console.error("HATA:", error.message);
}

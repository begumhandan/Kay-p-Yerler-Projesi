require('dotenv').config();
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');


const dbPath = process.env.DB_FILE_NAME || "sqlite.db";

if (!dbPath) {
    throw new Error('DB_FILE_NAME is not defined');
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Migrations klasörünün mutlak yolu =>Projenin kök dizinindeki 'drizzle' klasörü
const migrationsFolder = path.join(process.cwd(), 'drizzle');

async function main() {

    if (!fs.existsSync(migrationsFolder)) {
        console.error(' Hata: Migrations klasörü bulunamadı:', migrationsFolder);
        console.error('Lütfen önce "npm run generate" komutunu çalıştırın.');
        process.exit(1);
    }

    try {
        const files = fs.readdirSync(migrationsFolder);
        console.log('Bulunan migration dosyaları:', files);
    } catch (e) {
        console.error('Dosya okuma hatası:', e);
    }

    console.log("Veritabanı güncelleniyor...");
    
    await migrate(db, { migrationsFolder });
    
    console.log('Migrations başarıyla tamamlandı.');
    sqlite.close();
}

main().catch((err) => {
    console.error('Migration hatası:', err);
    process.exit(1);
});
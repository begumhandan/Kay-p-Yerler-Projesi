const { drizzle } = require("drizzle-orm/better-sqlite3");
const Database = require("better-sqlite3");
const schema = require("./schema"); 
require("dotenv").config(); // .env dosyasını okumak için


const dbUrl = process.env.DB_FILE_NAME || "sqlite.db";

const sqlite = new Database(dbUrl);

// Veritabanı bağlantısını oluştur
const db = drizzle(sqlite, { schema });

module.exports = { db };
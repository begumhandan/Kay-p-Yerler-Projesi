const Database = require('better-sqlite3');
const db = new Database('sqlite.db');
const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='announcement_images'").get();
console.log(row ? 'EXISTS' : 'MISSING');

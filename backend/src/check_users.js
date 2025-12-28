
const { db } = require("./db/index"); 

async function main() {
    try {
        console.log("kullanıcılar getiriliyor.");
        
        const users = await db.query.users.findMany();
        
        console.log("Users in DB:");
        users.forEach(u => {
            console.log(`ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
        });

        process.exit(0); // İşlem bitince çık
    } catch (error) {
        console.error("bir hata oluştu:", error);
        process.exit(1);
    }
}

main();
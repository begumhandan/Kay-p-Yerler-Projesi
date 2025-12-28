const { db } = require("./db/index");
const { users } = require("./db/schema");

async function main() {
    try {
        console.log("Kullanıcılar getiriliyor.");

        const allUsers = await db.select().from(users);
        
        console.log("Users in DB:", allUsers);
        
        process.exit(0); // İşlem bitince terminalden çık
    } catch (error) {
        console.error("error fetching users:", error);
        process.exit(1);
    }
}

main();
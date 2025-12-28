const bcrypt = require("bcrypt");
const { eq } = require("drizzle-orm");

const { db } = require("./db/index"); 
const { users } = require("./db/schema");

async function resetPassword() {
  try {
    // veritabanında kayıtlı olan admin emailini buraya yazmalısın
    // (Önceki veritabanı dökümünde "admin@test.com" veya "begum@gmail.com" görünüyordu)
    const email = "admin@example.com"; 
    const newPassword = "123456";
    
    console.log(` Şifre sıfırlanıyor: ${email}...`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email))
      .returning({ updatedId: users.id }); //güncellenen id döner

    if (result.length > 0) {
        console.log(` Başarılı! ${email} kullanıcısının şifresi "${newPassword}" olarak güncellendi.`);
    } else {
        console.log(` Uyarı: "${email}" adında bir kullanıcı bulunamadı.`);
    }

    process.exit(0); //işlem bittiysa kapat
  } catch (error) {
    console.error(" Bir hata oluştu:", error);
    process.exit(1);
  }
}

resetPassword();
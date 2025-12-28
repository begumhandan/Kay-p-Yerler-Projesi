const crypto = require('crypto');

const csrfCheck = (req, res, next) => {
  // token Oluşturma (eğer yoksa vermeli)
  // double submit cookie pattern: Cookie 'XSRF-TOKEN' olarak set edilir (HttpOnly: false olmalı ki JS okuyabilsin).
  let token = req.cookies && req.cookies['XSRF-TOKEN'];

  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Frontend (Axios) okuyup header'a yazabilsin diye
      secure: process.env.NODE_ENV === 'production', // Prod'da sadece HTTPS
      sameSite: 'lax'
    });
  }

  // okuma İsteklerini (GET, HEAD, OPTIONS) güvenli kabul tt
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  // token Doğrulama
  // Frontentin header'da gönderdiği token ile cookie'deki token eşleşmek zorunda
  const requestToken = req.headers['x-xsrf-token'];

  if (!requestToken || requestToken !== token) {
    console.error(`CSRF Hatası! Header: ${requestToken}, Cookie: ${token}`);
    return res.status(403).json({ error: "Güvenlik uyarısı: CSRF Token doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin." });
  }

  next();
};

module.exports = { csrfCheck };
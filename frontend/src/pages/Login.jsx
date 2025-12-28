import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // sayfa yüklendiğinde kayıtlı email var mı?
  useEffect(() => {
    // CSRF Token'ın oluşması için backend'e boş bir istek at
    api.get("/test-top").catch(() => { });

    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        password: savedPassword || ""
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // backende rememberMe bilgisini de gönderiyorum 
      const res = await api.post("/users/login", { ...formData, rememberMe: rememberMe });

      //beni hatırla
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberedPassword", formData.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword")
      }

      // localStorage'da kalan eski token varsa temizlesin
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("username");

      const storage = sessionStorage;

      storage.setItem("token", res.data.token);
      storage.setItem("userId", res.data.userId);
      storage.setItem("role", res.data.role);
      storage.setItem("username", res.data.username);

      // anasayfaya yönlendir 
      window.location.href = "/";

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Giriş başarısız. Bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] bg-sepia-light">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 border border-sepia-dark/10">
        <h2 className="text-3xl font-bold mb-6 text-center text-sepia-dark font-mono">
          Hesabınıza Giriş Yapın
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* eposta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              placeholder="ornek@hotmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red pr-10"
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
              />

              {/* Göz ikon buton*/}
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sepia-dark focus:outline-none"
                onMouseDown={(e) => { e.preventDefault(); setShowPassword(true); }}
                onMouseUp={(e) => { e.preventDefault(); setShowPassword(false); }}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* beni hatırla */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer select-none">
                Beni Hatırla
              </label>
            </div>
          </div>

          {/* giriş yap*/}
          <button
            type="submit"
            className="w-full bg-sepia-dark text-white p-2 rounded hover:bg-brand-red transition duration-300 font-bold mt-4"
          >
            Giriş Yap
          </button>
        </form>
        {/*hesap yoksa kayıt olsun*/}
        <p className="mt-4 text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link to="/register" className="text-brand-red font-bold hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
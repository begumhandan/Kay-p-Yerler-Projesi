import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api"; // Named export
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); //hata mesaj temizlensin
    try {
      await api.post("/users/register", formData);
      toast.success("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Kayıt başarısız. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] bg-sepia-light">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 border border-sepia-dark/10">
        <h2 className="text-3xl font-bold mb-6 text-center text-sepia-dark font-mono">Aramıza Katıl</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-posta</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            {/*input kapsayıcısına 'relative' ekle */}
            <div className="relative">
              <input
                // type dinamik
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red pr-10"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              {/* şifre için göz  */}
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sepia-dark"
                // sadece basılı tutunca göster
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                // mobil için
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-sepia-dark text-white p-2 rounded hover:bg-brand-red transition duration-300 font-bold"
          >
            Kayıt Ol
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Zaten hesabın var mı?{" "}
          <Link to="/login" className="text-brand-red font-bold hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
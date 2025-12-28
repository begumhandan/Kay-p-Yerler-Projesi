import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddLocation from "./pages/AddLocation";
import Home from "./pages/Home";
import LocationsPage from "./pages/LocationsPage";
import LocationDetail from "./pages/LocationDetail";
import PendingStoriesPage from "./pages/PendingStoriesPage";
import AdminDashboard from "./pages/AdminDashboard";
import EditLocation from "./pages/EditLocation";
import AddAnnouncement from "./pages/AddAnnouncement";
import EditAnnouncement from "./pages/EditAnnouncement";
import UserProfile from "./pages/UserProfile";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import Footer from "./components/Footer";

const ProtectedLayout = () => {
  const isAuthenticated = !!sessionStorage.getItem("token");
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicLayout = () => {
  const isAuthenticated = !!sessionStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

const AppLayout = () => {
  const location = useLocation();
  const noFooterRouters = ["/login", "/register"];
  const showFooter = !noFooterRouters.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-sepia-light font-sans text-sepia-dark">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Navbar />

      <div className="flex-grow relative">
        <Routes>
          {/* Herkese Açık / Misafir (Giriş yapılmışsa Anasayfaya atar) */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Korumalı Rotalar (Giriş yapılmamışsa Login'e atar) */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/announcement/:slug" element={<AnnouncementDetail />} />
            <Route path="/add-location" element={<AddLocation />} />
            <Route path="/location/:slug" element={<LocationDetail />} />
            <Route path="/edit-location/:slug" element={<EditLocation />} />
            <Route path="/pending-stories" element={<PendingStoriesPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-announcement" element={<AddAnnouncement />} />
            <Route path="/admin/edit-announcement/:slug" element={<EditAnnouncement />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Routes>
      </div>

      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import OffersPage from './pages/OffersPage';
import ListsPage from './pages/ListsPage';
import ListDetailPage from './pages/ListDetailPage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user && !user.isInitialized && window.location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" />;
  }
  return <>{children}</>;
};

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-black tracking-tighter italic">WSPÓLNE WAKACJE</Link>
              {user && (
                <div className="hidden md:flex space-x-1">
                  <Link to="/" className="hover:bg-white hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition">Odkrywaj</Link>
                  <Link to="/groups" className="hover:bg-white hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition">Moje Grupy</Link>
                  <Link to="/lists" className="hover:bg-white hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition">Listy</Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold bg-blue-600 px-3 py-1 rounded-full border border-blue-400">
                    👋 {user.firstName || user.phone}
                  </span>
                  <button onClick={logout} className="text-xs font-bold opacity-75 hover:opacity-100 underline">Wyloguj</button>
                </div>
              ) : (
                <Link to="/login" className="bg-white text-blue-700 px-6 py-2 rounded-full font-black text-sm hover:bg-blue-50 transition shadow-lg">ZALOGUJ SIĘ</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
          <Route path="/lists" element={<ProtectedRoute><ListsPage /></ProtectedRoute>} />
          <Route path="/lists/:id" element={<ProtectedRoute><ListDetailPage /></ProtectedRoute>} />
        </Routes>
      </main>
      
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-gray-800 pb-8 mb-8">
            <div>
              <p className="text-2xl font-black mb-2 tracking-tighter italic">Wspólne Wakacje</p>
              <p className="text-gray-400 text-sm max-w-md">Najlepszy sposób na wspólne planowanie wyjazdów ze znajomymi i rodziną. Wybierajcie, oceniajcie i decydujcie razem!</p>
            </div>
            <div className="md:text-right">
              <p className="text-indigo-400 font-bold mb-1">ACOST - All Company OS by Tajski</p>
              <p className="text-white text-xl font-black">Stworzone by Dawid Thai Thanh</p>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs">
            &copy; 2024 Wspólne Wakacje. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;


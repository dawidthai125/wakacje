import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OffersPage from './pages/OffersPage';
import ListsPage from './pages/ListsPage';
import ListDetailPage from './pages/ListDetailPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold">Wspólne Wakacje</Link>
              </div>
              <div className="flex space-x-4">
                <Link to="/" className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium">Oferty</Link>
                <Link to="/lists" className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium">Listy</Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<OffersPage />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/lists/:id" element={<ListDetailPage />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-lg font-semibold mb-2">Wspólne Wakacje - Latwiejsze Planowanie</p>
            <p className="text-gray-400">Stworzone by Dawid Thai Thanh (ACOST - All Company OS by Tajski)</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

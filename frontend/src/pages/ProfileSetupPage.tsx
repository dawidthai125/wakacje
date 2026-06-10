import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ProfileSetupPage = () => {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(user.id, firstName, lastName);
      updateUser(data);
      navigate('/');
    } catch (err) {
      alert('Błąd podczas aktualizacji profilu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Uzupełnij swój profil</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">To pomoże Twoim znajomym rozpoznać Cię w grupie.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imię</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-3"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nazwisko</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-3"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Zapisywanie...' : 'Zakończ konfigurację'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;

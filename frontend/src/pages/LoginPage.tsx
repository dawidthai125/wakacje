import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'phone' | 'pin' | 'setup'>('phone');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePhoneCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.checkPhone(phone);
      if (data.isInitialized) {
        setStep('pin');
      } else {
        setStep('setup');
      }
    } catch (err) {
      alert('Błąd podczas sprawdzania numeru');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(phone, pin);
      login(data.token, data.profile);
      navigate('/');
    } catch (err) {
      alert('Nieprawidłowy PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.setupPin(phone, pin);
      login(data.token, data.profile);
      navigate('/profile-setup');
    } catch (err) {
      alert('Błąd podczas ustawiania PINu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {step === 'phone' ? 'Witaj we Wspólnych Wakacjach!' : step === 'pin' ? 'Wprowadź PIN' : 'Ustaw swój PIN'}
        </h2>
        
        <p className="text-gray-600 text-sm mb-6 text-center">
          {step === 'phone' 
            ? 'Zaloguj się numerem telefonu, aby planować wyjazdy ze znajomymi.' 
            : step === 'pin' 
            ? `Wpisz PIN dla numeru ${phone}`
            : 'To Twoje pierwsze logowanie. Ustal 4-cyfrowy PIN dostępu.'}
        </p>

        {step === 'phone' && (
          <form onSubmit={handlePhoneCheck} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Numer telefonu</label>
              <input
                type="tel"
                placeholder="np. 500600700"
                className="w-full border rounded-lg px-4 py-3 text-lg tracking-widest"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              {loading ? 'Sprawdzanie...' : 'Dalej'}
            </button>
          </form>
        )}

        {(step === 'pin' || step === 'setup') && (
          <form onSubmit={step === 'pin' ? handleLogin : handleSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Twój PIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="****"
                className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-[1em]"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Wróć
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                {loading ? 'Przetwarzanie...' : step === 'pin' ? 'Zaloguj' : 'Zapisz i wejdź'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

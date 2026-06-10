import { useState, useEffect } from 'react';
import { Offer } from '../types';
import { offersAPI, listsAPI } from '../api';

const OffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    price: '',
    destination: '',
    startDate: '',
    endDate: '',
    adults: '2',
    children: '0',
    rooms: '1',
    platform: '',
  });

  useEffect(() => {
    fetchOffers();
    fetchLists();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await offersAPI.getAll();
      setOffers(response.data);
    } catch (err) {
      console.error('Błąd podczas pobierania ofert:', err);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await listsAPI.getAll();
      setLists(response.data);
    } catch (err) {
      console.error('Błąd podczas pobierania list:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await offersAPI.create({
      ...formData,
      price: parseFloat(formData.price),
      adults: parseInt(formData.adults),
      children: parseInt(formData.children),
      rooms: parseInt(formData.rooms),
    });
    setFormData({
      title: '',
      url: '',
      price: '',
      destination: '',
      startDate: '',
      endDate: '',
      adults: '2',
      children: '0',
      rooms: '1',
      platform: '',
    });
    fetchOffers();
  };

  const handleAddToList = async (offerId: string, listId: string) => {
    await listsAPI.addOffer(listId, offerId);
    alert('Dodano do listy!');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę ofertę?')) {
      await offersAPI.delete(id);
      fetchOffers();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Oferty Wakacyjne</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Dodaj nową ofertę</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł</label>
            <input
              type="text"
              required
              className="w-full border rounded-md px-3 py-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              required
              className="w-full border rounded-md px-3 py-2"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cena (PLN)</label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full border rounded-md px-3 py-2"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cel</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data wyjazdu</label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data powrotu</label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dorośli</label>
            <input
              type="number"
              min="1"
              className="w-full border rounded-md px-3 py-2"
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dzieci</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-md px-3 py-2"
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pokoje</label>
            <input
              type="number"
              min="1"
              className="w-full border rounded-md px-3 py-2"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platforma</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              placeholder="np. wakacje.pl, Itaka, TUI"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Dodaj ofertę
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{offer.title}</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">{offer.price} PLN</p>
              <p className="text-sm text-gray-600 mb-1">Cel: {offer.destination || 'Nie określono'}</p>
              <p className="text-sm text-gray-600 mb-1">
                {offer.startDate && offer.endDate ? `${offer.startDate} - ${offer.endDate}` : 'Daty nie określone'}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                {offer.adults} dorosłych, {offer.children} dzieci, {offer.rooms} pokoje
              </p>
              <p className="text-sm text-gray-500 mb-3">Platforma: {offer.platform || 'Nie określono'}</p>
              
              <div className="flex flex-col gap-2">
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm text-center hover:bg-blue-700"
                >
                  Zobacz ofertę
                </a>
                
                {lists.length > 0 && (
                  <div className="relative">
                    <select
                      className="w-full border rounded-md px-3 py-1 text-sm"
                      defaultValue=""
                      onChange={(e) => e.target.value && handleAddToList(offer.id, e.target.value)}
                    >
                      <option value="">Dodaj do listy...</option>
                      {lists.map((list) => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersPage;

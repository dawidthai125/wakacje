import { useState, useEffect } from 'react';
import { Offer, FamilyGroup } from '../types';
import { offersAPI, listsAPI, scrapeAPI } from '../api';
import ComparisonTable from '../components/ComparisonTable';

const OffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<Offer[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([
    { adults: 2, children: 0, roomConfig: '1 pokój' }
  ]);

  const [filters, setFilters] = useState({
    destination: '',
    minPeople: '',
    maxPrice: '',
    earliestDeparture: '',
    latestReturn: '',
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

  const toggleSelectOffer = (offer: Offer) => {
    if (selectedOffers.find(o => o.id === offer.id)) {
      setSelectedOffers(selectedOffers.filter(o => o.id !== offer.id));
    } else {
      if (selectedOffers.length >= 4) {
        alert('Możesz porównać maksymalnie 4 oferty jednocześnie.');
        return;
      }
      setSelectedOffers([...selectedOffers, offer]);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchDest = offer.destination.toLowerCase().includes(filters.destination.toLowerCase());
    const matchPeople = filters.minPeople === '' || offer.totalPeople >= parseInt(filters.minPeople);
    const matchPrice = filters.maxPrice === '' || offer.price <= parseFloat(filters.maxPrice);
    
    // Filtry dat
    const matchDeparture = !filters.earliestDeparture || (offer.startDate >= filters.earliestDeparture);
    const matchReturn = !filters.latestReturn || (offer.endDate <= filters.latestReturn);

    return matchDest && matchPeople && matchPrice && matchDeparture && matchReturn;
  });

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    price: '',
    destination: '',
    startDate: '',
    endDate: '',
    platform: '',
    hotelRating: '3',
    foodConfig: 'All Inclusive',
  });

  const fetchLists = async () => {
    try {
      const response = await listsAPI.getAll();
      setLists(response.data);
    } catch (err) {
      console.error('Błąd podczas pobierania list:', err);
    }
  };

  const addFamilyGroup = () => {
    setFamilyGroups([...familyGroups, { adults: 2, children: 0, roomConfig: '1 pokój' }]);
  };

  const removeFamilyGroup = (index: number) => {
    setFamilyGroups(familyGroups.filter((_, i) => i !== index));
  };

  const updateFamilyGroup = (index: number, field: keyof FamilyGroup, value: any) => {
    const newGroups = [...familyGroups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setFamilyGroups(newGroups);
  };

  const handleScrape = async () => {
    if (!formData.url) {
      alert('Wklej najpierw URL oferty.');
      return;
    }
    try {
      const response = await scrapeAPI.fetchData(formData.url);
      const data = response.data;
      setFormData({
        ...formData,
        title: data.title,
        price: data.price.toString(),
        platform: data.platform,
      });
      alert('Dane pobrane pomyślnie! Uzupełnij resztę szczegółów.');
    } catch (err) {
      console.error(err);
      alert('Nie udało się pobrać danych automatycznie. Spróbuj wpisać ręcznie.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPeople = familyGroups.reduce((sum, g) => sum + g.adults + g.children, 0);
    
    await offersAPI.create({
      ...formData,
      price: parseFloat(formData.price),
      hotelRating: parseInt(formData.hotelRating),
      familyGroups,
      totalPeople,
    });
    
    setFormData({
      title: '',
      url: '',
      price: '',
      destination: '',
      startDate: '',
      endDate: '',
      platform: '',
      hotelRating: '3',
      foodConfig: 'All Inclusive',
    });
    setFamilyGroups([{ adults: 2, children: 0, roomConfig: '1 pokój' }]);
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

      {/* Filtry i Akcje */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-500">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wyszukaj cel</label>
            <input 
              type="text"
              placeholder="np. Grecja, Turcja..."
              className="w-full border rounded-md px-3 py-2"
              value={filters.destination}
              onChange={(e) => setFilters({...filters, destination: e.target.value})}
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min. osób</label>
            <input 
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={filters.minPeople}
              onChange={(e) => setFilters({...filters, minPeople: e.target.value})}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max cena (PLN)</label>
            <input 
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>

          <div className="w-40">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Najwcześniejszy wylot</label>
            <input 
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={filters.earliestDeparture}
              onChange={(e) => setFilters({...filters, earliestDeparture: e.target.value})}
            />
          </div>

          <div className="w-40">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Najpóźniejszy powrót</label>
            <input 
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={filters.latestReturn}
              onChange={(e) => setFilters({...filters, latestReturn: e.target.value})}
            />
          </div>
          
          <button 
            onClick={() => setShowComparison(true)}
            disabled={selectedOffers.length < 2}
            className={`px-6 py-2 rounded-md font-bold transition ${
              selectedOffers.length >= 2 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Porównaj ({selectedOffers.length})
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Dodaj nową ofertę</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  className="flex-1 border rounded-md px-3 py-2"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-200 text-xs font-bold"
                >
                  Pobierz dane
                </button>
              </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard (Gwiazdki)</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.hotelRating}
                onChange={(e) => setFormData({ ...formData, hotelRating: e.target.value })}
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}*</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wyżywienie</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                placeholder="np. All Inclusive, HB"
                value={formData.foodConfig}
                onChange={(e) => setFormData({ ...formData, foodConfig: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Konfiguracja rodzin/pokoi</h3>
              <button
                type="button"
                onClick={addFamilyGroup}
                className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200"
              >
                + Dodaj kolejną rodzinę
              </button>
            </div>
            
            <div className="space-y-4">
              {familyGroups.map((group, index) => (
                <div key={index} className="flex flex-wrap gap-4 items-end bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">Dorosłych</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border rounded-md px-2 py-1"
                      value={group.adults}
                      onChange={(e) => updateFamilyGroup(index, 'adults', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">Dzieci</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded-md px-2 py-1"
                      value={group.children}
                      onChange={(e) => updateFamilyGroup(index, 'children', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs text-gray-500 mb-1">Pokój/Konfiguracja</label>
                    <input
                      type="text"
                      placeholder="np. 1 duży, 2 pokoje obok siebie"
                      className="w-full border rounded-md px-2 py-1"
                      value={group.roomConfig}
                      onChange={(e) => updateFamilyGroup(index, 'roomConfig', e.target.value)}
                    />
                  </div>
                  {familyGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFamilyGroup(index)}
                      className="text-red-500 hover:text-red-700 pb-1"
                    >
                      Usuń
                    </button>
                  )}
                </div>
              ))}
            </div>
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
          
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-bold hover:bg-blue-700">
            Zapisz ofertę
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => {
          const isSelected = selectedOffers.find(o => o.id === offer.id);
          return (
            <div 
              key={offer.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col border-2 transition ${
                isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent'
              }`}
            >
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => toggleSelectOffer(offer)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">{offer.title}</h3>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{offer.hotelRating}*</span>
                </div>
              <p className="text-2xl font-bold text-green-600 mb-2">{offer.price} PLN</p>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">📍</span> {offer.destination || 'Nie określono'}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">📅</span> {offer.startDate && offer.endDate ? `${offer.startDate} - ${offer.endDate}` : 'Daty nie określone'}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">🍽️</span> {offer.foodConfig}
                </p>
                <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                  <strong>Grupy:</strong> {offer.familyGroups?.map((g, i) => (
                    <div key={i}>{i+1}: {g.adults} dor., {g.children} dz. ({g.roomConfig})</div>
                  ))}
                  <div className="mt-1 font-bold border-t border-blue-200 pt-1">Łącznie osób: {offer.totalPeople}</div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">Platforma: {offer.platform || 'Nie określono'}</p>
              
              <div className="flex flex-col gap-2">
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm text-center font-semibold hover:bg-blue-700"
                >
                  Zobacz ofertę
                </a>
                
                {lists.length > 0 && (
                  <div className="relative">
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
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
                  className="text-red-500 text-xs hover:underline mt-2 self-end"
                >
                  Usuń ofertę
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {showComparison && (
        <ComparisonTable 
          offers={selectedOffers} 
          onClose={() => setShowComparison(false)} 
        />
      )}
    </div>
  );
};


export default OffersPage;

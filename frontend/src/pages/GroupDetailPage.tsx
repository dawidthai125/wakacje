import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { groupsAPI, offersAPI, ratingsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { Offer } from '../types';
import ComparisonTable from '../components/ComparisonTable';

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [groupOffers, setGroupOffers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOffers, setSelectedOffers] = useState<Offer[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showPropose, setShowPropose] = useState(false);
  const [ratingForms, setRatingForms] = useState<Record<string, any>>({});
  const [newOfferData, setNewOfferData] = useState({
    title: '', url: '', price: '', destination: '', startDate: '', endDate: '', hotelRating: '3', foodConfig: 'All Inclusive', platform: ''
  });

  const handleProposeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    try {
      // 1. Stwórz ofertę globalnie
      const offerRes = await offersAPI.create({
        ...newOfferData,
        price: parseFloat(newOfferData.price),
        hotelRating: parseInt(newOfferData.hotelRating),
        familyGroups: [],
        totalPeople: 0,
      });
      
      // 2. Podepnij pod grupę
      await groupsAPI.addOffer(id, offerRes.data.id, user.id, false);
      
      setNewOfferData({ title: '', url: '', price: '', destination: '', startDate: '', endDate: '', hotelRating: '3', foodConfig: 'All Inclusive', platform: '' });
      setShowPropose(false);
      fetchData();
      alert('Propozycja dodana!');
    } catch (err) {
      alert('Błąd dodawania propozycji');
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [offersRes, membersRes] = await Promise.all([
        groupsAPI.getOffers(id),
        groupsAPI.getMembers(id)
      ]);
      setGroupOffers(offersRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await groupsAPI.addMember(id, newMemberPhone);
      setNewMemberPhone('');
      fetchData();
      alert('Członek dodany!');
    } catch (err) {
      alert('Błąd dodawania członka (może już być w grupie)');
    }
  };

  const handleRatingSubmit = async (offerId: string) => {
    const form = ratingForms[offerId];
    if (!form || !user) return;
    
    try {
      await ratingsAPI.create({
        listOfferId: offerId, // Tutaj używamy offerId jako klucza w tym kontekście
        raterName: `${user.firstName} ${user.lastName}`,
        locationRating: parseInt(form.locationRating),
        priceRating: parseInt(form.priceRating),
        amenitiesRating: parseInt(form.amenitiesRating),
        foodRating: parseInt(form.foodRating),
        serviceRating: parseInt(form.serviceRating),
        comments: form.comments,
        isFor: form.isFor,
      });
      setRatingForms({ ...ratingForms, [offerId]: undefined });
      fetchData();
    } catch (err) {
      alert('Błąd dodawania oceny');
    }
  };

  const toggleSelectOffer = (offer: any) => {
    if (selectedOffers.find(o => o.id === offer.id)) {
      setSelectedOffers(selectedOffers.filter(o => o.id !== offer.id));
    } else {
      setSelectedOffers([...selectedOffers, offer]);
    }
  };

  if (loading) return <div className="text-center py-12">Ładowanie grupy...</div>;

  const isAdmin = members.find(m => m.profiles.id === user.id)?.role === 'admin';

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Lewy panel: Członkowie i zarządzanie */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">👥</span> Członkowie Grupy
            </h2>
            <div className="space-y-3 mb-6">
              {members.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {m.profiles.firstName ? `${m.profiles.firstName} ${m.profiles.lastName}` : m.profiles.phone}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{m.role}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {isAdmin && (
              <form onSubmit={handleAddMember} className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Zaproś numerem</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    className="flex-1 border rounded-md px-2 py-1 text-sm"
                    placeholder="500..."
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                  />
                  <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">+</button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-indigo-600 p-6 rounded-xl shadow-md text-white">
            <h3 className="font-bold mb-2">Ranking Grupy 🏆</h3>
            <p className="text-xs text-indigo-100 mb-4">Oferty sortowane są według różnicy głosów ZA i PRZECIW.</p>
            <button 
              onClick={() => setShowComparison(true)}
              disabled={selectedOffers.length < 2}
              className="w-full bg-white text-indigo-600 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
            >
              Porównaj wybrane ({selectedOffers.length})
            </button>
          </div>
        </div>

        {/* Prawy panel: Oferty i ranking */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Aktualne Propozycje</h1>
            <button 
              onClick={() => setShowPropose(!showPropose)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
            >
              {showPropose ? 'Anuluj' : '+ Zaproponuj Wakacje'}
            </button>
          </div>

          {showPropose && (
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-500 mb-8">
              <h2 className="text-xl font-bold mb-4">Dodaj swoją propozycję dla grupy</h2>
              <form onSubmit={handleProposeOffer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link do oferty</label>
                  <input type="url" required className="w-full border rounded-lg px-3 py-2" value={newOfferData.url} onChange={e => setNewOfferData({...newOfferData, url: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nazwa hotelu / Tytuł</label>
                  <input type="text" required className="w-full border rounded-lg px-3 py-2" value={newOfferData.title} onChange={e => setNewOfferData({...newOfferData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cena (PLN)</label>
                  <input type="number" required className="w-full border rounded-lg px-3 py-2" value={newOfferData.price} onChange={e => setNewOfferData({...newOfferData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cel</label>
                  <input type="text" required className="w-full border rounded-lg px-3 py-2" value={newOfferData.destination} onChange={e => setNewOfferData({...newOfferData, destination: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wyżywienie</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" value={newOfferData.foodConfig} onChange={e => setNewOfferData({...newOfferData, foodConfig: e.target.value})} />
                </div>
                <button type="submit" className="md:col-span-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">Dodaj Propozycję</button>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {groupOffers.map((offer) => {
              const isSelected = selectedOffers.find(o => o.id === offer.id);
              return (
                <div key={offer.id} className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-transparent'}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <input 
                          type="checkbox" 
                          checked={!!isSelected}
                          onChange={() => toggleSelectOffer(offer)}
                          className="mt-1.5 w-5 h-5 rounded border-gray-300 text-indigo-600"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{offer.title}</h3>
                          <p className="text-2xl font-black text-green-600">{offer.price} PLN</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                          <span className="text-2xl font-black text-green-600">{offer.zaCount}</span>
                          <span className="text-[10px] font-black text-green-700 uppercase">ZA</span>
                        </div>
                        <div className="flex flex-col items-center bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                          <span className="text-2xl font-black text-red-600">{offer.przeciwCount}</span>
                          <span className="text-[10px] font-black text-red-700 uppercase">PRZECIW</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      <div><span className="font-bold">Cel:</span> {offer.destination}</div>
                      <div><span className="font-bold">Termin:</span> {offer.startDate}</div>
                      <div><span className="font-bold">Standard:</span> {offer.hotelRating}*</div>
                      <div><span className="font-bold">Jedzenie:</span> {offer.foodConfig}</div>
                    </div>

                    <div className="flex gap-4 mb-6">
                      <a href={offer.url} target="_blank" className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg font-bold hover:bg-blue-700">Zobacz Ofertę</a>
                      <button 
                        onClick={() => setRatingForms({...ratingForms, [offer.id]: { raterName: '', locationRating: '3', priceRating: '3', amenitiesRating: '3', foodRating: '3', serviceRating: '3', comments: '', isFor: true }})}
                        className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-200"
                      >
                        Dodaj moją opinię
                      </button>
                    </div>

                    {ratingForms[offer.id] && (
                      <div className="bg-gray-50 p-6 rounded-xl border-2 border-indigo-200 mb-6">
                        <h4 className="font-bold mb-4">Twoja ocena dla: {offer.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Twoja decyzja</label>
                            <select 
                              className="w-full border-2 rounded-lg px-3 py-2 font-bold"
                              value={ratingForms[offer.id].isFor ? 'true' : 'false'}
                              onChange={(e) => setRatingForms({...ratingForms, [offer.id]: {...ratingForms[offer.id], isFor: e.target.value === 'true'}})}
                            >
                              <option value="true">👍 JESTEM ZA</option>
                              <option value="false">👎 JESTEM PRZECIW</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                             {['locationRating', 'priceRating', 'amenitiesRating', 'foodRating', 'serviceRating'].map(field => (
                               <div key={field}>
                                 <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{field.replace('Rating', '')}</label>
                                 <input 
                                  type="number" min="1" max="5" 
                                  className="w-full border rounded-md px-2 py-1"
                                  value={ratingForms[offer.id][field]}
                                  onChange={(e) => setRatingForms({...ratingForms, [offer.id]: {...ratingForms[offer.id], [field]: e.target.value}})}
                                 />
                               </div>
                             ))}
                          </div>
                        </div>
                        <div className="mb-6">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Komentarz</label>
                          <textarea 
                            className="w-full border-2 rounded-lg px-4 py-2"
                            value={ratingForms[offer.id].comments}
                            onChange={(e) => setRatingForms({...ratingForms, [offer.id]: {...ratingForms[offer.id], comments: e.target.value}})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRatingSubmit(offer.id)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Zapisz Głos</button>
                          <button onClick={() => setRatingForms({...ratingForms, [offer.id]: undefined})} className="bg-gray-200 px-6 py-2 rounded-lg">Anuluj</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showComparison && (
        <ComparisonTable offers={selectedOffers} onClose={() => setShowComparison(false)} />
      )}
    </div>
  );
};

export default GroupDetailPage;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { List, Rating } from '../types';
import { listsAPI, ratingsAPI } from '../api';

const ListDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<List | null>(null);
  const [ratings, setRatings] = useState<Record<string, Rating[]>>({});
  const [ratingForms, setRatingForms] = useState<Record<string, any>>({});

  useEffect(() => {
    if (id) {
      fetchList();
    }
  }, [id]);

  const fetchList = async () => {
    if (!id) return;
    try {
      const response = await listsAPI.getById(id);
      setList(response.data);
      
      if (response.data.offers) {
        const ratingsData: Record<string, Rating[]> = {};
        for (const offer of response.data.offers) {
          try {
            const ratingsResponse = await ratingsAPI.getByListOffer(offer.id);
            ratingsData[offer.id] = ratingsResponse.data;
          } catch (err) {
            console.error('❌ Błąd podczas pobierania ocen:', err);
          }
        }
        setRatings(ratingsData);
      }
    } catch (err) {
      console.error('❌ Błąd podczas pobierania listy:', err);
    }
  };

  const handleRatingSubmit = async (listOfferId: string) => {
    const form = ratingForms[listOfferId];
    if (!form) return;
    
    await ratingsAPI.create({
      listOfferId,
      raterName: form.raterName,
      locationRating: parseInt(form.locationRating),
      priceRating: parseInt(form.priceRating),
      amenitiesRating: parseInt(form.amenitiesRating),
      comments: form.comments,
      isFor: form.isFor,
    });
    
    setRatingForms({ ...ratingForms, [listOfferId]: undefined });
    fetchList();
  };

  const calculateAverageRating = (offerRatings: Rating[]) => {
    if (offerRatings.length === 0) return "0.0";
    const total = offerRatings.reduce((sum, r) => {
      return sum + (r.locationRating + r.priceRating + r.amenitiesRating) / 3;
    }, 0);
    return (total / offerRatings.length).toFixed(1);
  };

  if (!list) {
    return <div className="text-center py-12">Ładowanie...</div>;
  }

  const sortedOffers = [...(list.offers || [])].sort((a, b) => {
    const avgA = parseFloat(calculateAverageRating(ratings[a.id] || []));
    const avgB = parseFloat(calculateAverageRating(ratings[b.id] || []));
    return avgB - avgA;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{list.name}</h1>
      <p className="text-gray-600 mb-8">Właściciel: {list.ownerName}</p>

      <div className="space-y-8">
        {sortedOffers.map((offer) => {
          const offerRatings = ratings[offer.id] || [];
          const avgRating = calculateAverageRating(offerRatings);
          
          return (
            <div key={offer.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{offer.title}</h3>
                    <p className="text-2xl font-bold text-green-600 mt-1">{offer.price} PLN</p>
                  </div>
                  {offerRatings.length > 0 && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-yellow-500">{avgRating}</div>
                      <div className="text-sm text-gray-500">średnia ocena</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                  <div>Cel: {offer.destination || 'Nie określono'}</div>
                  <div>
                    {offer.startDate && offer.endDate ? `${offer.startDate} - ${offer.endDate}` : 'Daty nie określone'}
                  </div>
                  <div>{offer.adults} dorosłych, {offer.children} dzieci</div>
                  <div>{offer.rooms} pokoje</div>
                </div>

                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-6"
                >
                  Zobacz ofertę
                </a>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-4">Oceny i komentarze</h4>
                  
                  {offerRatings.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {offerRatings.map((rating) => (
                        <div key={rating.id} className="bg-gray-50 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{rating.raterName}</span>
                            <span className={`px-2 py-1 rounded text-sm ${rating.isFor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {rating.isFor ? 'ZA' : 'PRZECIW'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                            <div>Lokalizacja: {rating.locationRating}/5</div>
                            <div>Cena: {rating.priceRating}/5</div>
                            <div>Udogodnienia: {rating.amenitiesRating}/5</div>
                          </div>
                          {rating.comments && <p className="text-gray-600">{rating.comments}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {!ratingForms[offer.id] ? (
                    <button
                      onClick={() => setRatingForms({
                        ...ratingForms,
                        [offer.id]: {
                          raterName: '',
                          locationRating: '3',
                          priceRating: '3',
                          amenitiesRating: '3',
                          comments: '',
                          isFor: true,
                        }
                      })}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Dodaj ocenę
                    </button>
                  ) : (
                    <div className="bg-gray-50 rounded-md p-4">
                      <h5 className="font-semibold mb-4">Dodaj swoją ocenę</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Twoje imię</label>
                          <input
                            type="text"
                            className="w-full border rounded-md px-3 py-2"
                            value={ratingForms[offer.id].raterName}
                            onChange={(e) => setRatingForms({
                              ...ratingForms,
                              [offer.id]: { ...ratingForms[offer.id], raterName: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Za czy przeciw?</label>
                          <select
                            className="w-full border rounded-md px-3 py-2"
                            value={ratingForms[offer.id].isFor ? 'true' : 'false'}
                            onChange={(e) => setRatingForms({
                              ...ratingForms,
                              [offer.id]: { ...ratingForms[offer.id], isFor: e.target.value === 'true' }
                            })}
                          >
                            <option value="true">ZA</option>
                            <option value="false">PRZECIW</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lokalizacja (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="w-full border rounded-md px-3 py-2"
                            value={ratingForms[offer.id].locationRating}
                            onChange={(e) => setRatingForms({
                              ...ratingForms,
                              [offer.id]: { ...ratingForms[offer.id], locationRating: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cena (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="w-full border rounded-md px-3 py-2"
                            value={ratingForms[offer.id].priceRating}
                            onChange={(e) => setRatingForms({
                              ...ratingForms,
                              [offer.id]: { ...ratingForms[offer.id], priceRating: e.target.value }
                            })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Udogodnienia (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="w-full border rounded-md px-3 py-2"
                            value={ratingForms[offer.id].amenitiesRating}
                            onChange={(e) => setRatingForms({
                              ...ratingForms,
                              [offer.id]: { ...ratingForms[offer.id], amenitiesRating: e.target.value }
                            })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Komentarze</label>
                          <textarea
                            className="w-full border rounded-md px-3 py-2"
                            rows={3}
                            value={ratingForms[offer.id].comments}
                            onChange={(e) => setRatingForms({
                              ...ratingForms,
                              [offer.id]: { ...ratingForms[offer.id], comments: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRatingSubmit(offer.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Zapisz ocenę
                        </button>
                        <button
                          onClick={() => setRatingForms({ ...ratingForms, [offer.id]: undefined })}
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListDetailPage;

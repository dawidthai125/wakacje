import { Offer } from '../types';

interface ComparisonTableProps {
  offers: Offer[];
  onClose: () => void;
}

const ComparisonTable = ({ offers, onClose }: ComparisonTableProps) => {
  if (offers.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Porównanie Ofert ({offers.length})</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 border-b font-semibold text-gray-600 w-48">Cecha</th>
                {offers.map(offer => (
                  <th key={offer.id} className="p-4 border-b font-bold text-blue-800 min-w-[250px]">
                    {offer.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Cena</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b font-bold text-green-600 text-lg">
                    {offer.price} PLN
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Cel podróży</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b text-gray-700">
                    {offer.destination}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Termin</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b text-sm text-gray-700">
                    {offer.startDate} - {offer.endDate}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Standard</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b text-yellow-600 font-bold">
                    {offer.hotelRating}*
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Wyżywienie</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b text-gray-700">
                    {offer.foodConfig}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Konfiguracja grup</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b text-xs text-gray-600">
                    {offer.familyGroups?.map((g, i) => (
                      <div key={i} className="mb-1">
                        Gr {i+1}: {g.adults} dor., {g.children} dz. ({g.roomConfig})
                      </div>
                    ))}
                    <div className="mt-2 font-bold text-blue-700 border-t pt-1">
                      Razem: {offer.totalPeople} osób
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Platforma</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b text-sm text-gray-500 italic">
                    {offer.platform}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b font-medium bg-gray-50">Akcja</td>
                {offers.map(offer => (
                  <td key={offer.id} className="p-4 border-b">
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 w-full text-center"
                    >
                      Wybierz ofertę
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;

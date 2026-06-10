import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List } from '../types';
import { listsAPI } from '../api';

const ListsPage = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [formData, setFormData] = useState({ name: '', ownerName: '' });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const response = await listsAPI.getAll();
    setLists(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await listsAPI.create(formData);
    setFormData({ name: '', ownerName: '' });
    fetchLists();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Listy Wakacyjne</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Utwórz nową listę</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa listy</label>
            <input
              type="text"
              required
              className="w-full border rounded-md px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twoje imię</label>
            <input
              type="text"
              required
              className="w-full border rounded-md px-3 py-2"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Utwórz listę
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div key={list.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{list.name}</h3>
              <p className="text-sm text-gray-600 mb-4">Właściciel: {list.ownerName}</p>
              <Link
                to={`/lists/${list.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 block text-center"
              >
                Zobacz listę
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPage;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  useEffect(() => {
    if (user) fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      const { data } = await groupsAPI.getUserGroups(user.id);
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await groupsAPI.create(newGroupName, newGroupDesc, user.id);
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreate(false);
      fetchGroups();
    } catch (err) {
      alert('Błąd tworzenia grupy');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Twoje Grupy</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
        >
          + Nowa Grupa
        </button>
      </div>

      {showCreate && (
        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-500 mb-8">
          <h2 className="text-xl font-bold mb-4">Utwórz nową grupę znajomych</h2>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nazwa grupy</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg px-3 py-2"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="np. Wakacje 2024 - Ekipa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opis (opcjonalnie)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="np. Wyjazd do Grecji w lipcu"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Stwórz</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Anuluj</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Link
            key={group.id}
            to={`/groups/${group.id}`}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:border-blue-500 transition flex flex-col"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">{group.name}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-1">{group.description || 'Brak opisu'}</p>
            <div className="text-blue-600 font-semibold text-sm">Przejdź do grupy &rarr;</div>
          </Link>
        ))}
        {groups.length === 0 && !showCreate && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
            Nie należysz jeszcze do żadnej grupy. Stwórz nową, aby zacząć planowanie!
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;

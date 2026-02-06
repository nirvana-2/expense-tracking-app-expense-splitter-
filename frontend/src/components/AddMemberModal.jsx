import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Search, UserPlus, Check } from 'lucide-react';
import SidePanel from './SidePanel';

const AddMemberModal = ({ isOpen, onClose, groupId, onMemberAdded }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(null);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 2) {
            setLoading(true);
            try {
                const response = await api.get(`/users/search?query=${value}`);
                // Ensure results are not already in the group (logic handled here or filtered by user perception)
                // For simplicity, just showing search results.
                setResults(response.data.users || []);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
        }
    };

    const addMember = async (userId) => {
        setAdding(userId);
        try {
            await api.post(`/groups/${groupId}/members`, { userId });
            toast.success('Member added successfully');
            onMemberAdded();
            // Don't close immediately, user might want to add more
        } catch (error) {
            console.error("Add member failed", error);
            toast.error(error.response?.data?.message || 'Failed to add member');
        } finally {
            setAdding(null);
        }
    };

    return (
        <SidePanel isOpen={isOpen} onClose={onClose} title="Add Members">
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="Search by name, email or phone..."
                        className="w-full bg-slate-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    {loading && <p className="text-center text-slate-500 py-4">Searching...</p>}

                    {!loading && results.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search Results</h3>
                            {results.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-bold border border-white/5">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addMember(user._id)}
                                        disabled={adding === user._id}
                                        className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {adding === user._id ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <UserPlus size={20} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && query.length > 2 && results.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-slate-400">No users found matching "{query}"</p>
                        </div>
                    )}
                </div>
            </div>
        </SidePanel>
    );
};

export default AddMemberModal;

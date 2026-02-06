import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { X, Plus, Users } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/groups', { name, description });
            toast.success('Group created successfully!');
            setName('');
            setDescription('');
            onGroupCreated();
            onClose();
        } catch (error) {
            console.error('Create group error:', error);
            toast.error(error.response?.data?.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-card w-full max-w-md relative p-0 rounded-2xl overflow-hidden shadow-2xl bg-white">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-indigo-600" size={20} /> New Group
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Trip to Pokhara"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this group for?"
                            rows={3}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <Plus size={18} /> Create Group
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;

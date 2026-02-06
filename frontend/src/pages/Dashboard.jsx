import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LogOut, Plus, Users, Search, Trash2 } from 'lucide-react';
import CreateGroupModal from '../components/CreateGroupModal';


const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            setGroups(response.data.groups || []);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (e, groupId, groupName) => {
        e.stopPropagation(); // Prevent card click navigation

        if (window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
            try {
                await api.delete(`/groups/${groupId}`);
                // Remove from local state to avoid refetching
                setGroups(groups.filter(g => g._id !== groupId));
            } catch (error) {
                console.error('Failed to delete group', error);
                // toast.error(error.response?.data?.message || 'Failed to delete group');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white selection:bg-indigo-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                            ES
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">ExpenseSplitter</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.name}</span>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Your Groups</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>Create Group</span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5/50">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-slate-400 dark:text-slate-500" size={32} />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No groups yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">Create a group to start splitting expenses with your friends, roommates, or trip buddies.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            Create your first group &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => {
                            const isAdmin = (group.admin?._id || group.admin) === user?._id;
                            return (
                                <div
                                    key={group._id}
                                    onClick={() => navigate(`/groups/${group._id}`)}
                                    className="group relative glass-card p-6 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                                >
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors">
                                            <Search size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => handleDeleteGroup(e, group._id, group.name)}
                                                className="text-slate-400 dark:text-slate-500 hover:text-rose-400 transition-colors z-10"
                                                title="Delete Group"
                                            >
                                                <Trash2 size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 truncate pr-16 text-slate-900 dark:text-white">{group.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 h-10">
                                        {group.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                                        <Users size={16} />
                                        <span>{group.members?.length || 1} members</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {showCreateModal && (
                <CreateGroupModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onGroupCreated={fetchGroups}
                />
            )}
        </div>
    );
};

export default Dashboard;

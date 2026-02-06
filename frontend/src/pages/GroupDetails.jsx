import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
    ArrowLeft, Settings, Plus, Users, UserPlus, Trash2, ChevronDown, ChevronUp,
    Calendar, DollarSign, PieChart, TrendingUp
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import AddMemberModal from '../components/AddMemberModal';

const GroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState({ owes: [], owed: [], settled: [] });
    const [loading, setLoading] = useState(true);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showMembersDropdown, setShowMembersDropdown] = useState(false);

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    const fetchGroupData = async () => {
        try {
            setLoading(true);
            const [groupRes, expensesRes, balancesRes] = await Promise.all([
                api.get(`/groups/${id}`),
                api.get(`/expenses/group/${id}`),
                api.get(`/expenses/group/${id}/balances`)
            ]);

            setGroup(groupRes.data.group);
            setExpenses(expensesRes.data.expenses);
            setBalances(balancesRes.data.balances);
        } catch (error) {
            console.error('Failed to fetch group details', error);
            // toast.error('Failed to load group details'); 
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (userId, memberName) => {
        if (window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
            try {
                await api.delete(`/groups/${id}/members/${userId}`);
                fetchGroupData();
            } catch (error) {
                console.error('Failed to remove member', error);
            }
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expenses/${expenseId}`);
                fetchGroupData();
            } catch (error) {
                console.error('Failed to delete expense', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">Group Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <h1 className="font-bold text-lg truncate mx-4 flex-1 text-center">
                        {group.name}
                    </h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddExpense(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Expense</span>
                        </button>
                        <button
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            title="Group Settings"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-6 max-w-4xl">
                {/* Group Stats/Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                        <div className="text-slate-400 text-sm mb-1">Total Expenses</div>
                        <div className="text-2xl font-bold text-white">
                            Rs. {expenses.reduce((sum, start) => sum + start.amount, 0).toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 relative group">
                        <div className="flex justify-between items-start mb-1">
                            <div className="text-slate-400 text-sm">Members</div>
                            <button
                                onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                {showMembersDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-indigo-400" />
                            <span className="font-medium">{group.members.length} people</span>
                        </div>

                        {/* Dropdown for Members List */}
                        {showMembersDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 max-h-60 overflow-y-auto space-y-1">
                                    {group.members.map(member => {
                                        // Handle potential populated admin field or raw ID
                                        const adminId = group.admin?._id || group.admin;
                                        const isAdmin = adminId === member._id;
                                        const isCurrentUserAdmin = (group.admin?._id || group.admin) === user._id;

                                        return (
                                            <div key={member._id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group/member">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-slate-300 truncate max-w-[100px]">{member.name}</span>
                                                </div>
                                                {isCurrentUserAdmin && member._id !== user._id && (
                                                    <button
                                                        onClick={() => handleDeleteMember(member._id, member.name)}
                                                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded ml-1">Admin</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-2 border-t border-white/5 bg-slate-900/50">
                                    <button
                                        onClick={() => {
                                            setShowAddMember(true);
                                            setShowMembersDropdown(false);
                                        }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <UserPlus size={14} />
                                        Add Member
                                    </button>
                                </div>
                            </div>
                        )}

                        {!showMembersDropdown && (
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 w-full justify-center border border-indigo-500/20"
                                title="Add Member"
                            >
                                <UserPlus size={14} />
                                <span>Add Member</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-2xl border border-indigo-500/20">
                        <div className="text-indigo-300 text-sm mb-1">Your Net Balance</div>
                        {(() => {
                            // Find user's balance in the arrays
                            const userOwes = balances.owes.find(b => b.user._id === user._id);
                            const userOwed = balances.owed.find(b => b.user._id === user._id);

                            if (userOwed) {
                                return <div className="text-2xl font-bold text-emerald-400">+ Rs. {userOwed.balance}</div>;
                            } else if (userOwes) {
                                return <div className="text-2xl font-bold text-rose-400"> Rs. {userOwes.balance}</div>;
                            } else {
                                return <div className="text-2xl font-bold text-slate-300">Settled</div>;
                            }
                        })()}
                    </div>
                </div>

                {/* Balances Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-indigo-400" />
                        Balances
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Who Owes */}
                        <div className="bg-slate-800/30 rounded-2xl p-4 border border-white/5">
                            <h3 className="text-sm font-medium text-rose-400 mb-3 uppercase tracking-wider">Owes Money</h3>
                            {balances.owes.length === 0 ? (
                                <p className="text-slate-500 text-sm italic">No one owes anything.</p>
                            ) : (
                                <div className="space-y-3">
                                    {balances.owes.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {item.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{item.user.name}</span>
                                            </div>
                                            <span className="font-bold text-rose-400">Rs. {item.balance}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Who is Owed */}
                        <div className="bg-slate-800/30 rounded-2xl p-4 border border-white/5">
                            <h3 className="text-sm font-medium text-emerald-400 mb-3 uppercase tracking-wider">Owed Money</h3>
                            {balances.owed.length === 0 ? (
                                <p className="text-slate-500 text-sm italic">No one is owed anything.</p>
                            ) : (
                                <div className="space-y-3">
                                    {balances.owed.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {item.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{item.user.name}</span>
                                            </div>
                                            <span className="font-bold text-emerald-400">+ Rs. {item.balance}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expenses List */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-400" />
                            Recent Expenses
                        </h2>
                        {/* Filter could go here */}
                    </div>

                    <div className="space-y-3">
                        {expenses.length === 0 ? (
                            <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-slate-400">No expenses yet.</p>
                                <button
                                    onClick={() => setShowAddExpense(true)}
                                    className="text-indigo-400 hover:text-indigo-300 text-sm mt-2"
                                >
                                    Add the first expense
                                </button>
                            </div>
                        ) : (
                            expenses.map(expense => (
                                <div
                                    key={expense._id}
                                    className="bg-slate-800 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-3">
                                            <div className="mt-1 w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                    {expense.title}
                                                </h3>
                                                {expense.description && (
                                                    <p className="text-xs text-slate-500 mb-0.5 max-w-[200px] truncate">
                                                        {expense.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-slate-400">
                                                    {expense.paidBy.name} paid Rs. {expense.amount}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-white">
                                                Rs. {expense.amount}
                                            </span>
                                            <span className="text-xs text-slate-500 block mb-1">
                                                {formatDate(expense.date)}
                                            </span>

                                            {/* Delete Button for Expense */}
                                            {(group.admin === user._id || expense.paidBy._id === user._id) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteExpense(expense._id);
                                                    }}
                                                    className="inline-flex p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Delete Expense"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* My Share Info - Optional: Highlight how much involves me */}
                                    {(() => {
                                        const mySplit = expense.splits.find(s => s.user._id === user._id);
                                        if (mySplit) {
                                            return (
                                                <div className="mt-2 text-xs bg-black/20 inline-block px-2 py-1 rounded-lg text-slate-400">
                                                    Your share: <span className="text-rose-400">Rs. {mySplit.amount.toFixed(2)}</span>
                                                </div>
                                            );
                                        } else if (expense.paidBy._id === user._id) {
                                            return (
                                                <div className="mt-2 text-xs bg-black/20 inline-block px-2 py-1 rounded-lg text-slate-400">
                                                    You paid
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {showAddExpense && (
                <AddExpenseModal
                    isOpen={showAddExpense}
                    onClose={() => setShowAddExpense(false)}
                    groupId={id}
                    members={group.members}
                    onExpenseAdded={() => {
                        fetchGroupData();
                        // maybe toast success
                    }}
                />
            )}

            {showAddMember && (
                <AddMemberModal
                    isOpen={showAddMember}
                    onClose={() => setShowAddMember(false)}
                    groupId={id}
                    onMemberAdded={() => {
                        fetchGroupData();
                        setShowAddMember(false);
                    }}
                />
            )}
        </div>
    );
};

export default GroupDetails;
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import SidePanel from './SidePanel';
import {
    Receipt, ChevronRight, ChevronLeft, Check,
    Utensils, Car, Zap, Coffee, Home, ShoppingCart,
    Users, CreditCard, Divide
} from 'lucide-react';

const CATEGORIES = [
    { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { id: 'transport', label: 'Transportation', icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'entertainment', label: 'Entertainment', icon: Coffee, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { id: 'accommodation', label: 'Accommodation', icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { id: 'other', label: 'Other', icon: ShoppingCart, color: 'text-slate-400', bg: 'bg-slate-500/20' }
];

const AddExpenseModal = ({ isOpen, onClose, groupId, members = [], onExpenseAdded }) => {
    const { user } = useContext(AuthContext);

    // Form State
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState(''); // CHANGED: description → title
    const [description, setDescription] = useState(''); // ADDED: separate description field
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [splitType, setSplitType] = useState('equal');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [loading, setLoading] = useState(false);

    // Initialize defaults when opening
    useEffect(() => {
        if (isOpen && user) {
            setStep(1);
            setTitle(''); // CHANGED
            setDescription(''); // ADDED
            setAmount('');
            setCategory('');
            setPaidBy(user._id);
            setSplitType('equal');
            if (members.length > 0) {
                setSelectedMembers(members.map(m => m._id));
            }
        }
    }, [isOpen, user, members]);

    const handleNext = () => {
        if (step === 1 && (!title || !amount || !category)) { // CHANGED: description → title
            toast.warn("Please fill in all details");
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const toggleMemberSelection = (memberId) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== memberId));
        } else {
            setSelectedMembers([...selectedMembers, memberId]);
        }
    };

    const calculateSplits = () => {
        if (splitType === 'equal') {
            const count = selectedMembers.length;
            if (count === 0) return [];
            const splitAmount = parseFloat(amount) / count;
            return selectedMembers.map(memberId => ({
                user: memberId,
                amount: parseFloat(splitAmount.toFixed(2))
            }));
        }
        return [];
    };

    const handleSubmit = async () => {
        if (selectedMembers.length === 0) {
            toast.error("Please select at least one person to split with");
            return;
        }

        setLoading(true);
        try {
            const expenseData = {
                title, // FIXED: use title state
                description, // FIXED: use description state (optional)
                amount: parseFloat(amount),
                category,
                groupId,
                splitType,
                splits: calculateSplits()
            };

            await api.post('/expenses', expenseData);
            toast.success("Expense added successfully!");
            onExpenseAdded();
            onClose();
        } catch (error) {
            console.error("Add expense failed", error);
            toast.error(error.response?.data?.message || "Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    // Step Renders
    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Amount Input */}
            <div className="relative">
                <label className="text-sm font-medium text-slate-400 mb-1 block">Amount</label>
                <div className="flex items-center border-b-2 border-indigo-500/50 focus-within:border-indigo-400 transition-colors pb-1">
                    <span className="text-2xl font-bold text-slate-400 mr-2">Rs.</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-4xl font-bold text-white placeholder-slate-600 focus:outline-none"
                        autoFocus
                        step="0.01"
                        min="0"
                    />
                </div>
            </div>

            {/* Title - CHANGED */}
            <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Title *</label>
                <div className="relative">
                    <Receipt className="absolute top-3.5 left-3.5 text-slate-500" size={18} />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Dinner at restaurant"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Description (Optional) - ADDED */}
            <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Description (Optional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details..."
                    rows={2}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                />
            </div>

            {/* Category Grid */}
            <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">Category *</label>
                <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${category === cat.id
                                ? `bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/50`
                                : `bg-white/5 border-transparent hover:bg-white/10`
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.bg} ${cat.color}`}>
                                <cat.icon size={16} />
                            </div>
                            <span className={`text-sm font-medium ${category === cat.id ? 'text-white' : 'text-slate-400'}`}>
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Title</span>
                    <span className="text-sm font-medium text-white">{title}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Total Amount</span>
                    <span className="text-xl font-bold text-white">Rs. {parseFloat(amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Category</span>
                    <span className="text-sm font-medium text-indigo-400 capitalize">{category}</span>
                </div>
                {selectedMembers.length > 0 && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="text-slate-400 text-sm">Per Person</span>
                        <span className="text-sm font-medium text-emerald-400">
                            Rs. {(parseFloat(amount || 0) / selectedMembers.length).toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">Split Amongst</label>
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setSelectedMembers(members.map(m => m._id))}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-2 uppercase tracking-wider"
                    >
                        Select All
                    </button>

                    {members.map(member => {
                        const isSelected = selectedMembers.includes(member._id);
                        return (
                            <div
                                key={member._id}
                                onClick={() => toggleMemberSelection(member._id)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                    ? 'bg-slate-800 border-indigo-500/50'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                                        {member.name}
                                    </span>
                                </div>
                                {isSelected && <Check size={18} className="text-indigo-400" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Payer Selection */}
            <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">Paid By</label>
                <div className="relative">
                    <CreditCard className="absolute top-3.5 left-3.5 text-slate-500" size={18} />
                    <select
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        {members.map(m => (
                            <option key={m._id} value={m._id}>
                                {m._id === user._id ? 'You' : m.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    return (
        <SidePanel
            isOpen={isOpen}
            onClose={onClose}
            title={step === 1 ? "Add New Expense" : "Split Details"}
        >
            <div className="flex flex-col h-full">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-6">
                    <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                </div>

                {/* Form Steps */}
                <div className="flex-1 overflow-y-auto">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    )}

                    {step < 2 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span>Saving...</span>
                            ) : (
                                <>
                                    <Check size={18} /> Add Expense
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </SidePanel>
    );
};

export default AddExpenseModal;
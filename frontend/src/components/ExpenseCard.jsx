import { ShoppingCart, Coffee, Utensils, Car, Zap, Home } from 'lucide-react';

const CATEGORY_ICONS = {
    food: { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    transport: { icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    utilities: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    entertainment: { icon: Coffee, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    housing: { icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    other: { icon: ShoppingCart, color: 'text-slate-400', bg: 'bg-slate-400/10' }
};

const ExpenseCard = ({ expense, currentUserId }) => {
    // Determine category styling
    const categoryKey = expense.category?.toLowerCase() || 'other';
    const style = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS.other;
    const Icon = style.icon;

    // Determine user's involvement
    const paidByMe = expense.paidBy?._id === currentUserId;
    const mySplit = expense.splitDetails.find(s => s.user === currentUserId);

    let statusText = '';
    let statusColor = '';

    if (paidByMe) {
        statusText = `You paid Rs. ${expense.amount}`;
        statusColor = 'text-emerald-400';
    } else if (mySplit) {
        statusText = `You owe Rs. ${mySplit.amount}`;
        statusColor = 'text-rose-400';
    } else {
        statusText = 'Not involved';
        statusColor = 'text-slate-500';
    }

    return (
        <div className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.bg} ${style.color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">
                        {expense.description}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-white/5">{categoryKey}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className={`font-mono font-medium ${statusColor}`}>
                    {statusText}
                </div>
                {!paidByMe && (
                    <div className="text-xs text-slate-500 mt-1">
                        Paid by {expense.paidBy?.name}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseCard;

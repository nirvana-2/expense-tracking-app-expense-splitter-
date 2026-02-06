import { useState, useEffect } from 'react';
import api from '../services/api';
import { Wallet, ArrowUpRight, ArrowDownLeft, CheckCircle } from 'lucide-react';

const SettlementPanel = ({ groupId, currentUser }) => {
    const [balances, setBalances] = useState({ owes: [], owed: [], settled: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (groupId) {
            fetchBalances();
        }
    }, [groupId]);

    const fetchBalances = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/expenses/group/${groupId}/balances`);
            setBalances(response.data.balances);
        } catch (error) {
            console.error("Failed to fetch balances", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-40 bg-white/5 animate-pulse rounded-2xl" />;

    const hasDebts = balances.owes.length > 0 || balances.owed.length > 0;

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-6 text-slate-300">
                    <Wallet size={18} />
                    <h3 className="font-bold text-white">Settlement</h3>
                </div>

                {!hasDebts ? (
                    <div className="text-center py-6 text-slate-500">
                        <CheckCircle className="mx-auto mb-2 text-emerald-500" size={32} />
                        <p>All expenses settled!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Owed TO You (Incoming) */}
                        {balances.owed.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <ArrowDownLeft size={12} /> Incoming Credits
                                </h4>
                                <div className="space-y-2">
                                    {balances.owed.map((item) => (
                                        <div key={item.user._id} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                                                    {item.user.name?.charAt(0)}
                                                </div>
                                                <span className="text-sm text-slate-300">{item.user.name}</span>
                                            </div>
                                            <span className="font-mono text-emerald-400 font-bold">
                                                +{item.balance.toFixed(0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* You Owe (Outgoing) */}
                        {balances.owes.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <ArrowUpRight size={12} /> Outgoing Debts
                                </h4>
                                <div className="space-y-2">
                                    {balances.owes.map((item) => (
                                        <div key={item.user._id} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center">
                                                    {item.user.name?.charAt(0)}
                                                </div>
                                                <span className="text-sm text-slate-300">{item.user.name}</span>
                                            </div>
                                            <span className="font-mono text-rose-400 font-bold">
                                                {Math.abs(item.balance).toFixed(0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* My Net Balance Card */}
            <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm text-slate-400 mb-1">Your Net Balance</p>
                    {(() => {
                        const myBalance = [...balances.owes, ...balances.owed, ...balances.settled]
                            .find(b => b.user._id === currentUser?._id);

                        if (!myBalance || myBalance.balance === 0) {
                            return <p className="text-2xl font-bold text-slate-200">Balanced</p>;
                        }
                        const isPositive = myBalance.balance > 0;
                        return (
                            <p className={`text-3xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : '-'} Rs. {Math.abs(myBalance.balance).toFixed(2)}
                            </p>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default SettlementPanel;

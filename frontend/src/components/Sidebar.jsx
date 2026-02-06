import { useNavigate, useLocation } from 'react-router-dom';
import { Users, History, Settings, ArrowLeft, PiggyBank } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mock navigation items since routes don't exist for History/Settings yet
    const navItems = [
        { name: 'Groups', icon: Users, path: '/groups', action: () => navigate('/') },
        { name: 'History', icon: History, path: '/history', action: () => { /* Placeholder */ } },
        { name: 'Settings', icon: Settings, path: '/settings', action: () => { /* Placeholder */ } },
    ];

    return (
        <div className="h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5">
            <div className="p-6 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <PiggyBank size={20} />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">ExpenseSplitter</span>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span className="font-medium">Back to Dashboard</span>
                </button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
                {navItems.map((item) => {
                    const active = location.pathname.includes(item.path) || (item.name === 'Groups' && location.pathname !== '/');
                    return (
                        <button
                            key={item.name}
                            onClick={item.action}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </button>
                    )
                })}
            </nav>

            <div className="p-6 border-t border-slate-200 dark:border-white/5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-600 uppercase tracking-widest text-center">
                    v2.0 Rebuild
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

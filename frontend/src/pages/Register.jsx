import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // CHANGED: phone → phoneNumber

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await register(name, email, password, phoneNumber); // CHANGED: phone → phoneNumber
        if (success) {
            navigate('/login');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="glass-card w-full max-w-md p-8 rounded-3xl animate-fade-in relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                        Create Account
                    </h1>
                    <p className="text-slate-400">Join to start splitting expenses easily</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                placeholder="Full Name (min 4 chars)"
                                required
                                minLength={4}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                placeholder="Email Address"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                            </div>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    // Only allow digits, max 10
                                    const digits = e.target.value.replace(/\D/g, '');
                                    setPhoneNumber(digits); // CHANGED: setPhone → setPhoneNumber
                                }}
                                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                placeholder="Phone (10 digits)"
                                required
                                maxLength={10}
                                pattern="[0-9]{10}"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                placeholder="Password (min 6 chars, 1 uppercase, 1 number)"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : (
                            <>
                                <UserPlus size={18} /> Sign Up
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400 relative z-10">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
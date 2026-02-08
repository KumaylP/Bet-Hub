import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const LoanPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [repayAmount, setRepayAmount] = useState<number | ''>(500);
    const [borrowAmount, setBorrowAmount] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Ensure user data is up to date
    useEffect(() => {
        refreshUser();
    }, []);

    const userLoan = user?.loan || 0;
    const userMoney = user?.money || 0;
    const userTrust = user?.trust || 0;

    // Calculate limit based on Trust Score tiers (matching backend logic)
    let loanLimitMultiplier = 0;
    if (userTrust < 50) loanLimitMultiplier = 0;
    else if (userTrust < 300) loanLimitMultiplier = 0.2;
    else if (userTrust < 500) loanLimitMultiplier = 0.5;
    else if (userTrust < 700) loanLimitMultiplier = 1.0;
    else if (userTrust < 850) loanLimitMultiplier = 1.5;
    else loanLimitMultiplier = 2.0;

    const baseLimit = 2500;
    const calculatedLimit = baseLimit * loanLimitMultiplier;
    const loanLimit = Math.min(calculatedLimit, 5000); // Strict cap at 5000

    // Interest calculations (Dynamic)
    const currentInterestRate = user?.loan_interest_rate ? (user.loan_interest_rate * 100).toFixed(1) : '5.0'; // Default 5% base
    const totalInterest = user?.loan_total_interest ? user.loan_total_interest.toFixed(0) : '0';

    // Due Date Calculation
    let dueDateString = "N/A";
    if (user?.loan_due_date && user.loan > 0) {
        const now = Date.now() / 1000;
        const diffSeconds = user.loan_due_date - now;
        const diffDays = Math.ceil(diffSeconds / 86400);

        if (diffDays > 0) {
            dueDateString = `In ${diffDays} Days`;
        } else {
            dueDateString = "Overdue";
        }
    } else {
        dueDateString = "No active loan";
    }

    const handleRepay = async () => {
        if (!user) return;
        if (!repayAmount || Number(repayAmount) <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid amount' });
            return;
        }
        if (Number(repayAmount) > userMoney) {
            setMessage({ type: 'error', text: 'Insufficient funds' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await api.repayLoan(user.email, Number(repayAmount));
            if (res.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: `Successfully repaid $${repayAmount}` });
                await refreshUser();
                setRepayAmount('');
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Repayment failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleBorrow = async () => {
        if (!user) return;
        if (!borrowAmount || Number(borrowAmount) <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid amount' });
            return;
        }
        if ((userLoan + Number(borrowAmount)) > loanLimit) {
            setMessage({ type: 'error', text: 'Loan limit exceeded' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await api.applyLoan(user.email, Number(borrowAmount));
            if (res.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: `Successfully borrowed $${borrowAmount}` });
                await refreshUser();
                setBorrowAmount('');
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Loan application failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Loan Management</h1>
                    <p className="text-text-secondary text-gray-400">Manage your borrowed virtual coins and repayment history.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-surface-darker border border-white/10 rounded-2xl p-8 relative overflow-hidden group bg-black/40">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl text-primary">account_balance_wallet</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs mb-2">Current Loan Balance</p>
                        <div className="flex items-center gap-4">
                            <span className="text-6xl font-black text-white tracking-tighter">{userLoan.toLocaleString()}</span>
                            <div className="flex flex-col">
                                <span className="text-primary font-bold text-sm">COINS</span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-6">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Trust Score</p>
                                <p className="text-xl font-bold text-primary">{userTrust}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Interest Rate</p>
                                <p className="text-xl font-bold text-white">{currentInterestRate}% / Loan</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Interest</p>
                                <p className="text-xl font-bold text-white">{totalInterest} <span className="material-symbols-outlined text-primary text-sm">monetization_on</span></p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Due Date</p>
                                <p className={`text-xl font-bold ${dueDateString === 'Overdue' ? 'text-red-500' : 'text-white'}`}>{dueDateString}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-darker border border-white/10 rounded-2xl p-8 bg-black/20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">payments</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">Repay Loan</h3>
                    </div>
                    <div className="max-w-2xl space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-tight">Amount to Repay</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Available:</span>
                                    <span className="text-white text-sm font-bold flex items-center gap-1">
                                        {userMoney.toLocaleString()} <span className="material-symbols-outlined text-primary text-xs">monetization_on</span>
                                    </span>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-primary text-2xl">monetization_on</span>
                                </div>
                                <input
                                    className="block w-full pl-14 pr-24 py-5 bg-black/50 border-2 border-white/10 rounded-xl text-white text-3xl font-black placeholder-white/20 focus:ring-primary focus:border-primary transition-all outline-none"
                                    placeholder="0"
                                    type="number"
                                    value={repayAmount}
                                    onChange={(e) => setRepayAmount(Number(e.target.value))}
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center">
                                    <button
                                        onClick={() => setRepayAmount(userMoney > userLoan ? userLoan : userMoney)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <input
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                max={userLoan}
                                min="0"
                                step="50"
                                type="range"
                                value={typeof repayAmount === 'number' ? repayAmount : 0}
                                onChange={(e) => setRepayAmount(Number(e.target.value))}
                            />
                            <div className="flex justify-between text-xs font-black text-gray-500 px-1">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleRepay}
                                disabled={loading || userLoan === 0}
                                className="w-full bg-primary hover:bg-primary-hover text-black text-lg font-black py-5 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,123,0,0.3)] transition-all flex items-center justify-center gap-3 group uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Repay Now'}
                                <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                Funds will be deducted immediately from your virtual coin balance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface-darker border border-white/10 rounded-2xl shadow-lg overflow-hidden bg-black/20">
                    <div className="p-5 border-b border-white/10 bg-white/5">
                        <h2 className="text-xs font-black text-white uppercase tracking-widest">Request New Loan</h2>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                                <label className="text-gray-400 uppercase">Amount to Borrow</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-primary text-xl">monetization_on</span>
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl text-white text-2xl font-black placeholder-white/20 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="0"
                                    type="number"
                                    value={borrowAmount}
                                    onChange={(e) => setBorrowAmount(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Maximum Limit</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Maximum Limit</span>
                                <span className="text-[10px] font-bold text-primary uppercase">Trust Based</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-black text-white">{loanLimit.toLocaleString()}</span>
                                <span className="material-symbols-outlined text-primary text-xl">monetization_on</span>
                            </div>
                            <p className="text-[9px] text-gray-500 mt-2 leading-tight">
                                Your borrowing limit is determined by your Trust Score Tier ({userTrust}/1000). Max limit is 5,000.
                            </p>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleBorrow}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-background-dark text-lg font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Request Loan'}
                                <span className="material-symbols-outlined text-2xl transition-transform group-hover:scale-110">handshake</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-darker border border-white/10 rounded-xl p-5 bg-black/20">
                    <h4 className="text-white font-bold text-sm mb-4">Loan Statistics</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Current Utilization</span>
                            <span className="text-xs font-bold text-white flex items-center gap-1">{userLoan.toLocaleString()} / {loanLimit.toLocaleString()} <span className="material-symbols-outlined text-[12px] text-primary">monetization_on</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${Math.min((userLoan / loanLimit) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-gray-400">Next Payout</span>
                            <span className="text-xs font-bold text-white">Daily at 00:00 UTC</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanPage;

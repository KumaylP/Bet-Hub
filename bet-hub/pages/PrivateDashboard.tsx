import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const PoolRow: React.FC<{ pool: any; userEmail: string; isCreator?: boolean; onUpdate?: () => void }> = ({ pool, userEmail, isCreator, onUpdate }) => {
  const outcomes = Array.isArray(pool.outcomes) ? pool.outcomes : JSON.parse(pool.outcomes || '[]');
  const participants = Array.isArray(pool.participants) ? pool.participants : JSON.parse(pool.participants || '[]');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState('');

  const userBetObj = participants.find((p: any) => p.user.toLowerCase().trim() === userEmail.toLowerCase().trim());
  const userBet = userBetObj ? userBetObj.prediction : 'No';
  const wagered = userBetObj ? userBetObj.amount : 0;

  // Simple potential return (pro-rata pool share if wins)
  let potentialReturn = 0;
  if (userBetObj) {
    const sideTotal = participants
      .filter((p: any) => p.prediction === userBet)
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    potentialReturn = sideTotal > 0 ? (userBetObj.amount / sideTotal) * pool.pool : 0;
  }

  const handleCopyCode = () => {
    if (pool.bet_code) {
      navigator.clipboard.writeText(pool.bet_code);
      alert("Bet code copied to clipboard!");
    }
  };

  const handleDeclareResult = async () => {
    if (!selectedResult) {
      alert("Please select a winning outcome");
      return;
    }

    try {
      await api.declareResult(userEmail, pool.id, selectedResult);
      alert(`Result declared: ${selectedResult}`);
      setShowResultModal(false);
      if (onUpdate) onUpdate();
    } catch (e) {
      alert("Failed to declare result");
    }
  };

  const handleCloseBet = async () => {
    if (!confirm("Are you sure you want to close this bet without declaring a result? This will refund all participants.")) {
      return;
    }

    try {
      await api.closeBet(userEmail, pool.id);
      alert("Bet closed successfully");
      if (onUpdate) onUpdate();
    } catch (e) {
      alert("Failed to close bet");
    }
  };

  return (
    <div className="group bg-background-card border border-white/5 hover:border-primary/30 rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(255,111,0,0.05)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${pool.bet_type === 'PRIVATE' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
              {pool.bet_type}
            </span>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{new Date(pool.end_time * 1000).toLocaleDateString()}</span>
          </div>
          <Link to={`/market/${pool.id}`} className="text-xl font-bold text-white group-hover:text-primary transition-colors block mb-2">{pool.title}</Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary !text-[18px]">monetization_on</span>
              <span className="text-sm font-bold text-white">{pool.pool.toFixed(0)}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase ml-1">Volume</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-gray-500 !text-[18px]">group</span>
              <span className="text-sm font-bold text-white">{participants.length}</span>
            </div>
            {isCreator && pool.bet_code && (
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Code: {pool.bet_code}</span>
                <button onClick={handleCopyCode} className="material-symbols-outlined !text-[14px] text-purple-400 hover:text-white transition-colors cursor-pointer">content_copy</button>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-64 bg-black/30 rounded-xl p-4 border border-white/5">
          {isCreator ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Creator Controls</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${pool.status === 'OPEN' ? 'text-green-500' : 'text-gray-500'}`}>{pool.status}</span>
              </div>

              {pool.status === 'OPEN' ? (
                <>
                  <button
                    onClick={() => setShowResultModal(true)}
                    className="w-full bg-primary hover:bg-primary-hover text-black font-black text-[11px] uppercase py-2 px-3 rounded-lg transition-all"
                  >
                    Declare Result
                  </button>
                  <button
                    onClick={handleCloseBet}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black text-[11px] uppercase py-2 px-3 rounded-lg transition-all border border-white/10"
                  >
                    Close Bet
                  </button>
                </>
              ) : (
                <p className="text-[10px] text-gray-500 uppercase tracking-wide text-center">Bet Concluded</p>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Prediction</span>
                <span className={`font-black text-xs ${userBet === 'No' ? 'text-red-500' : 'text-primary'}`}>{userBet}</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full mb-3 overflow-hidden">
                <div className={`h-full rounded-full ${userBet === 'No' ? 'bg-red-500/50' : 'bg-primary/50'}`} style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-gray-500 uppercase">Wagered: <span className="text-white">${wagered}</span></span>
                <span className="text-gray-500 uppercase">Return: <span className="text-primary">${potentialReturn.toFixed(2)}</span></span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Declare Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background-card border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-black text-white mb-4">Declare Winning Outcome</h3>
            <p className="text-gray-400 text-sm mb-4">Select the correct outcome for this bet:</p>

            <div className="space-y-2 mb-6">
              {outcomes.map((outcome: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedResult(outcome)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedResult === outcome
                    ? 'bg-primary text-black border-2 border-primary'
                    : 'bg-white/5 text-white border-2 border-white/10 hover:border-primary/50'
                    }`}
                >
                  {outcome}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResultModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black text-sm py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclareResult}
                disabled={!selectedResult}
                className="flex-1 bg-primary hover:bg-primary-hover text-black font-black text-sm py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PrivateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [joinedPools, setJoinedPools] = useState<any[]>([]);
  const [createdPools, setCreatedPools] = useState<any[]>([]);
  const [completedPools, setCompletedPools] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeBets: 0, totalInvested: 0 });
  const [activeTab, setActiveTab] = useState<'joined' | 'created' | 'transactions' | 'completed'>('joined');

  const [joinCode, setJoinCode] = useState('');
  const [betPreview, setBetPreview] = useState<any | null>(null);
  const [isLoadingBet, setIsLoadingBet] = useState(false);
  const [joinAmount, setJoinAmount] = useState('');
  const [joinPrediction, setJoinPrediction] = useState('');
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const fetchData = async (isInitial = false) => {
    if (!user) return;
    try {
      if (isInitial) setLoading(true);
      console.log("Fetching dashboard data for:", user.email);
      const myBets = await api.getBetsForUser(user.email);
      const myTransactions = await api.getTransactions(user.email);
      console.log("Dashboard API Response:", myBets);
      console.log("Transactions:", myTransactions);

      if (myBets.error) {
        console.error("Dashboard API error:", myBets.error);
        return;
      }

      const betsArray = Array.isArray(myBets) ? myBets : [];
      const transactionsArray = Array.isArray(myTransactions) ? myTransactions : [];
      const userEmailLower = user.email.toLowerCase().trim();

      // Separate Created vs Joined
      const created = betsArray.filter((b: any) => b.creator.toLowerCase().trim() === userEmailLower);
      const allJoined = betsArray.filter((b: any) => {
        // A bet is "joined" if you are not the creator
        return b.creator.toLowerCase().trim() !== userEmailLower;
      });

      // Separate active joined bets from completed bets
      const completed = allJoined.filter((b: any) =>
        b.status === 'RESULT_DECLARED' || b.status === 'CLOSED'
      );
      const joined = allJoined.filter((b: any) =>
        b.status !== 'RESULT_DECLARED' && b.status !== 'CLOSED'
      );

      console.log("Dashboard Filter - Created:", created.length, "Joined:", joined.length, "Completed:", completed.length);

      setCreatedPools(created);
      setJoinedPools(joined);
      setCompletedPools(completed);

      // Sort transactions by newest first (descending timestamp)
      const sortedTransactions = transactionsArray.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      setTransactions(sortedTransactions);

      // Stats - money invested in bets joined
      let totalInvested = 0;
      betsArray.forEach((b: any) => {
        const parts = Array.isArray(b.participants) ? b.participants : JSON.parse(b.participants || '[]');
        const myPart = parts.find((p: any) => p.user.toLowerCase().trim() === userEmailLower);
        if (myPart) totalInvested += myPart.amount;
      });

      setStats({
        activeBets: betsArray.filter((b: any) => b.status === 'OPEN').length,
        totalInvested: totalInvested
      });

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleFindBet = async () => {
    if (!joinCode.trim()) {
      setJoinError("Please enter a bet code");
      return;
    }

    setJoinError('');
    setIsLoadingBet(true);

    try {
      const bet = await api.getBetByCode(joinCode);

      if (bet.error || !bet.id) {
        setJoinError("Invalid bet code. Please check and try again.");
        setBetPreview(null);
      } else {
        setBetPreview(bet);
        setJoinError('');
      }
    } catch (e) {
      setJoinError("Failed to fetch bet details.");
      setBetPreview(null);
    } finally {
      setIsLoadingBet(false);
    }
  };

  const handleResetJoinFlow = () => {
    setJoinCode('');
    setBetPreview(null);
    setJoinAmount('');
    setJoinPrediction('');
    setJoinError('');
    setJoinSuccess('');
  };

  const handleJoin = async () => {
    if (!joinAmount || !joinPrediction) {
      setJoinError("Please fill in amount and select a choice");
      return;
    }
    setJoinError('');
    setJoinSuccess('');

    try {
      const res = await api.joinPrivateBet({
        email: user?.email,
        bet_code: joinCode,
        amount: parseFloat(joinAmount),
        prediction: joinPrediction
      });

      if (res.error) {
        setJoinError(res.error);
      } else {
        setJoinSuccess("Successfully joined pool!");
        handleResetJoinFlow();
        fetchData();
      }
    } catch (e) {
      setJoinError("Failed to join.");
    }
  };

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header Dashboard */}
            <div className="rounded-3xl bg-gradient-to-r from-background-card to-black border border-white/10 p-8 md:p-10 relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">Private Dashboard</h1>
                <p className="text-gray-400 max-w-lg mb-8 text-sm font-medium">Manage your exclusive bets and private pools with virtual currency.</p>

                <div className="flex flex-col lg:flex-row items-end lg:items-center gap-8">
                  <div className="w-full lg:w-auto flex-1 max-w-xl bg-white/5 p-4 rounded-xl border border-white/10">
                    <label className="block text-[10px] font-black text-primary uppercase mb-3 tracking-widest opacity-80">Join a Private Pool</label>

                    {!betPreview ? (
                      // Step 1: Code Entry
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-3 text-gray-500 material-symbols-outlined !text-[20px]">vpn_key</span>
                            <input
                              type="text"
                              placeholder="Enter Bet Code"
                              value={joinCode}
                              onChange={e => setJoinCode(e.target.value.toUpperCase())}
                              onKeyPress={e => e.key === 'Enter' && handleFindBet()}
                              className="w-full bg-black/50 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-bold uppercase"
                            />
                          </div>
                          <button
                            onClick={handleFindBet}
                            disabled={isLoadingBet}
                            className="bg-primary hover:bg-primary-hover text-black font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,111,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                          >
                            {isLoadingBet ? '...' : 'Find Bet'}
                          </button>
                        </div>
                        {joinError && <p className="text-red-500 text-[10px] font-black uppercase tracking-wide">{joinError}</p>}
                        {joinSuccess && <p className="text-green-500 text-[10px] font-black uppercase tracking-wide">{joinSuccess}</p>}
                      </div>
                    ) : (
                      // Step 2: Bet Preview & Join Form
                      <div className="space-y-4">
                        {/* Bet Preview Card */}
                        <div className="bg-black/30 border border-primary/20 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-white font-black text-sm mb-1">{betPreview.title}</h4>
                              <p className="text-gray-400 text-[11px] font-medium line-clamp-2">{betPreview.description}</p>
                            </div>
                            <button
                              onClick={handleResetJoinFlow}
                              className="ml-2 text-gray-500 hover:text-white transition-colors"
                              title="Clear and start over"
                            >
                              <span className="material-symbols-outlined !text-[18px]">close</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-[10px]">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-primary !text-[14px]">monetization_on</span>
                              <span className="text-white font-bold">{betPreview.pool?.toFixed(0) || 0}</span>
                              <span className="text-gray-500 uppercase font-bold">Pool</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-gray-500 !text-[14px]">schedule</span>
                              <span className="text-white font-bold">{new Date(betPreview.end_time * 1000).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Join Form */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={joinPrediction}
                            onChange={e => setJoinPrediction(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-bold"
                          >
                            <option value="">Select Choice</option>
                            {(Array.isArray(betPreview.outcomes) ? betPreview.outcomes : JSON.parse(betPreview.outcomes || '[]')).map((outcome: string, idx: number) => (
                              <option key={idx} value={outcome}>{outcome}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Amount ($)"
                            value={joinAmount}
                            onChange={e => setJoinAmount(e.target.value)}
                            className="w-32 bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-bold"
                          />
                          <button
                            onClick={handleJoin}
                            className="bg-primary hover:bg-primary-hover text-black font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,111,0,0.2)] min-w-[100px]"
                          >
                            Join Now
                          </button>
                        </div>
                        {joinError && <p className="text-red-500 text-[10px] font-black uppercase tracking-wide">{joinError}</p>}
                        {joinSuccess && <p className="text-green-500 text-[10px] font-black uppercase tracking-wide">{joinSuccess}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-4">
              <div className="flex p-1 bg-background-card border border-white/10 rounded-xl">
                <button
                  onClick={() => setActiveTab('joined')}
                  className={`px-5 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'joined' ? 'text-primary bg-white/5 border border-primary/20 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined !text-[16px]">how_to_reg</span>
                  Joined Bets
                </button>
                <button
                  onClick={() => setActiveTab('created')}
                  className={`px-5 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'created' ? 'text-primary bg-white/5 border border-primary/20 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined !text-[16px]">add_circle</span>
                  My Creations
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-5 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'transactions' ? 'text-primary bg-white/5 border border-primary/20 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined !text-[16px]">receipt_long</span>
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-5 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'text-primary bg-white/5 border border-primary/20 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined !text-[16px]">check_circle</span>
                  Completed
                </button>
              </div>

              {/* List */}
              <div className="space-y-4">
                {loading && joinedPools.length === 0 && createdPools.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-2">
                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Synergizing Data...</span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeTab === 'joined' ? (
                      joinedPools.length === 0 ? (
                        <div className="text-center text-gray-500 py-20 bg-background-card/50 rounded-2xl border border-dashed border-white/10">
                          <span className="material-symbols-outlined !text-[48px] mb-2 opacity-20 text-primary">hourglass_empty</span>
                          <p className="font-bold text-sm uppercase tracking-widest opacity-50">Zero active stakes detected.</p>
                        </div>
                      ) : (
                        joinedPools.map((pool, idx) => <PoolRow key={idx} pool={pool} userEmail={user?.email || ''} onUpdate={() => fetchData()} />)
                      )
                    ) : activeTab === 'created' ? (
                      createdPools.length === 0 ? (
                        <div className="text-center text-gray-500 py-20 bg-background-card/50 rounded-2xl border border-dashed border-white/10">
                          <span className="material-symbols-outlined !text-[48px] mb-2 opacity-20 text-primary">add_circle</span>
                          <p className="font-bold text-sm uppercase tracking-widest opacity-50">No markets initiated by you.</p>
                          <Link to="/create" className="text-primary hover:underline mt-4 inline-block font-black text-xs uppercase tracking-widest border-b border-primary/30">Lauch a Market ➜</Link>
                        </div>
                      ) : (
                        createdPools.map((pool, idx) => <PoolRow key={idx} pool={pool} userEmail={user?.email || ''} isCreator={true} onUpdate={() => fetchData()} />)
                      )
                    ) : activeTab === 'completed' ? (
                      completedPools.length === 0 ? (
                        <div className="text-center text-gray-500 py-20 bg-background-card/50 rounded-2xl border border-dashed border-white/10">
                          <span className="material-symbols-outlined !text-[48px] mb-2 opacity-20 text-primary">check_circle</span>
                          <p className="font-bold text-sm uppercase tracking-widest opacity-50">No completed bets.</p>
                        </div>
                      ) : (
                        completedPools.map((pool, idx) => <PoolRow key={idx} pool={pool} userEmail={user?.email || ''} onUpdate={() => fetchData()} />)
                      )
                    ) : (
                      transactions.length === 0 ? (
                        <div className="text-center text-gray-500 py-20 bg-background-card/50 rounded-2xl border border-dashed border-white/10">
                          <span className="material-symbols-outlined !text-[48px] mb-2 opacity-20 text-primary">receipt_long</span>
                          <p className="font-bold text-sm uppercase tracking-widest opacity-50">No transactions found.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transactions.map((tx: any, idx: number) => (
                            <div key={idx} className="bg-background-card border border-white/5 hover:border-primary/20 rounded-xl p-4 transition-all">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${tx.type === 'BET' ? 'bg-primary/20 text-primary' :
                                      tx.type === 'WIN' ? 'bg-green-500/20 text-green-400' :
                                        tx.type === 'REFUND' ? 'bg-blue-500/20 text-blue-400' :
                                          tx.type === 'LOAN' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-gray-500/20 text-gray-400'
                                      }`}>
                                      {tx.type}
                                    </span>
                                    <span className="text-gray-500 text-[10px] font-bold uppercase">{new Date(tx.timestamp * 1000).toLocaleString()}</span>
                                  </div>
                                  <p className="text-white text-sm font-bold">{tx.description}</p>
                                  {tx.type === 'WIN' && tx.profit !== undefined && (
                                    <div className="flex gap-2 mt-1">
                                      <span className="text-[10px] text-green-400 font-bold uppercase bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                        Profit: +${tx.profit.toFixed(2)}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-bold uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                                        Base Refunded: ${tx.initial_bet?.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className={`text-right font-black text-lg ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateDashboard;
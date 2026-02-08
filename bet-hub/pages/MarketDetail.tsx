import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Mock chart data for now
const mockChartData = [
  { time: '12 PM', value: 10 },
  { time: '2 PM', value: 12 },
  { time: '4 PM', value: 15 },
  { time: '6 PM', value: 18 },
  { time: '8 PM', value: 24 },
  { time: '10 PM', value: 28 },
  { time: '12 AM', value: 32 },
  { time: '2 AM', value: 30 },
  { time: '4 AM', value: 28 },
  { time: '6 AM', value: 26.5 },
];

const CHART_COLORS = ['#FF9800', '#2196F3', '#4CAF50', '#F44336', '#9C27B0'];


const MarketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const [bet, setBet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Betting State
  const [prediction, setPrediction] = useState<string>('');
  const [amount, setAmount] = useState<string>('50');
  const [bettingError, setBettingError] = useState('');

  const [placingBet, setPlacingBet] = useState(false);

  // Comment State
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const fetchBet = async () => {
    if (!id) return;
    try {
      const data = await api.getBet(id);
      if (data.error) {
        setError(data.error);
      } else {
        setBet(data);

      }
    } catch (err) {
      console.error("Fetch bet error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBet();
    const interval = setInterval(fetchBet, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Set default prediction when bet data is loaded
  useEffect(() => {
    if (bet && !prediction) {
      const outcomes = Array.isArray(bet.outcomes) ? bet.outcomes : JSON.parse(bet.outcomes || '[]');
      if (outcomes.length > 0) {
        setPrediction(outcomes[0]);
      }
    }
  }, [bet, prediction]);

  const handleLike = async (commentId: string) => {
    if (!user || !bet) return;

    // Optimistic Update
    const currentComments = Array.isArray(bet.comments) ? bet.comments : JSON.parse(bet.comments || '[]');
    const updatedComments = currentComments.map((c: any) => {
      if (c.id === commentId) {
        const likes = c.likes || [];
        const isLiked = likes.includes(user.email);
        const newLikes = isLiked ? likes.filter((e: string) => e !== user.email) : [...likes, user.email];
        return { ...c, likes: newLikes };
      }
      return c;
    });

    setBet((prev: any) => ({ ...prev, comments: updatedComments }));

    try {
      await api.likeComment(user.email, bet.id, commentId);
      // Background refresh to ensure consistency
      fetchBet();
    } catch (e) {
      console.error("Failed to like", e);
    }
  };

  const handlePlaceBet = async () => {
    if (!user) {
      setBettingError("Please login to place a bet.");
      return;
    }
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      setBettingError("Invalid amount.");
      return;
    }
    if (betAmount < (bet.base_price || 0)) {
      setBettingError(`Minimum bet is $${bet.base_price || 10}`);
      return;
    }
    if (user.money < betAmount) {
      setBettingError("Insufficient funds.");
      return;
    }

    setBettingError('');
    setPlacingBet(true);

    try {
      const payload = {
        bet_id: bet.id,
        email: user.email,
        amount: betAmount,
        prediction: prediction
      };
      const res = await api.joinBet(payload);
      if (res.error) {
        setBettingError(res.error);
      } else {
        setAmount('');
        refreshUser();
        // Refresh bet data to show new participant
        const updatedBet = await api.getBet(bet.id);
        setBet(updatedBet);
      }
    } catch (err) {
      setBettingError("Failed to place bet.");
    } finally {
      setPlacingBet(false);
    }
  };

  const handleDeclareResult = async (result: string) => {
    if (!user || !bet) return;
    try {
      const res = await api.declareResult(user.email, bet.id, result);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Result declared successfully!");
        const updated = await api.getBet(bet.id);
        setBet(updated);
      }
    } catch (err) {
      alert("Failed to declare result.");
    }
  };

  const handleCloseBet = async () => {
    if (!user || !bet) return;
    try {
      const res = await api.closeBet(user.email, bet.id);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Market closed successfully!");
        const updated = await api.getBet(bet.id);
        setBet(updated);
      }
    } catch (err) {
      alert("Failed to close market.");
    }
  };

  const handlePostComment = async () => {
    if (!user || !bet || !commentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await api.addComment(user.email, bet.id, commentText);
      if (res.error) {
        alert(res.error);
      } else {
        setCommentText('');
        // Refresh bet to get new comments
        const updated = await api.getBet(bet.id);
        setBet(updated);
      }
    } catch (err) {
      alert("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading market details...</div>;
  if (!bet || error) return <div className="text-center py-20 text-red-500">{error || "Market not found"}</div>;

  const participants = Array.isArray(bet.participants) ? bet.participants : JSON.parse(bet.participants || '[]');
  const outcomes = Array.isArray(bet.outcomes) ? bet.outcomes : JSON.parse(bet.outcomes || '[]');

  // Calculate stats for all outcomes based on volume (amount)
  const outcomeStats = outcomes.map((outcome: string) => {
    const totalAmount = participants
      .filter((p: any) => p.prediction === outcome)
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    const percent = bet.pool > 0 ? Math.round((totalAmount / bet.pool) * 100) : (outcomes.length > 0 ? Math.round(100 / outcomes.length) : 0);
    return { outcome, count: participants.filter((p: any) => p.prediction === outcome).length, percent, amount: totalAmount };
  });

  // If no bets yet, show 50/50 for binary or equal split
  const isInitialState = participants.length === 0;

  const primaryOutcome = outcomeStats[0] || { outcome: 'Unknown', percent: 0 };
  const hasBet = user && participants.some((p: any) => p.user === user.email);

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* Main Content */}
      <div className="lg:col-span-8 flex flex-col gap-6">

        {/* Breadcrumb & Title */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-white transition-colors cursor-pointer">Markets</Link>
              <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
              <span className="text-white font-medium">{bet.title}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-background-card border border-white/10 text-gray-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[14px]">lock</span> {bet.bet_type} POOL
                </span>
                <span className="bg-background-card border border-white/10 text-gray-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[14px]">schedule</span> Ends {new Date(bet.end_time * 1000).toLocaleDateString()}
                </span>
                <span className="bg-background-card border border-white/10 text-gray-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[14px]">bar_chart</span> ${bet.pool?.toFixed(2) || '0.00'} POOL
                </span>
                {(bet.status === 'RESULT_DECLARED' || bet.status === 'CLOSED') && (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/50 text-xs font-black px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                    <span className="material-symbols-outlined !text-[14px] font-black">lock</span> MARKET CLOSED
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {bet.title}
              </h1>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${isInitialState ? 'text-gray-400' : 'text-primary'}`}>{primaryOutcome.percent}%</span>
                <span className="text-lg font-medium text-gray-500">{primaryOutcome.outcome}</span>
              </div>
              {isInitialState && <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Initial Odds</span>}
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-background-card border border-white/10 rounded-xl p-6 relative overflow-hidden group">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-semibold">Market Volume Over Time</h3>
            </div>
          </div>

          <div className="relative h-[300px] w-full border-t border-white/5 pt-4">
            {(() => {
              // 1. Process All Bets (Sorted by timestamp)
              const allBets = participants
                .map((p: any) => ({
                  ...p,
                  timestamp: p.timestamp || bet.start_time || Date.now() / 1000 // Fallback for old bets
                }))
                .sort((a: any, b: any) => a.timestamp - b.timestamp);

              if (allBets.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <span className="material-symbols-outlined !text-[48px] opacity-20 mb-2">show_chart</span>
                    <p className="text-sm">No bets placed yet.</p>
                  </div>
                );
              }

              // 2. Build Historical Odds Data
              const chartData: any[] = [];
              const outcomeVolumes: { [key: string]: number } = {};
              let currentTotalPool = 0;

              // Initialize volumes
              outcomes.forEach((o: string) => outcomeVolumes[o] = 0);

              // Initial Point (Equal or specified initial odds)
              const initialOdds: any = { time: new Date((allBets[0].timestamp - 3600) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
              outcomes.forEach((o: string) => {
                initialOdds[o] = (100 / outcomes.length).toFixed(1);
              });
              chartData.push(initialOdds);

              allBets.forEach((participantBet: any) => {
                outcomeVolumes[participantBet.prediction] += participantBet.amount;
                currentTotalPool += participantBet.amount;

                const point: any = {
                  time: new Date(participantBet.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                outcomes.forEach((o: string) => {
                  const vol = outcomeVolumes[o];
                  const prob = currentTotalPool > 0 ? (vol / currentTotalPool) * 100 : (100 / outcomes.length);
                  point[o] = parseFloat(prob.toFixed(1));
                });

                chartData.push(point);
              });

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                      labelStyle={{ color: '#666', fontSize: '10px', marginBottom: '4px' }}
                      cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
                      formatter={(val: number) => [`${val}%`, '']}
                    />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      minTickGap={40}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickFormatter={(val) => `${val}%`}
                      width={40}
                    />
                    {outcomes.map((outcome: string, idx: number) => (
                      <Line
                        key={outcome}
                        type="stepAfter"
                        dataKey={outcome}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        animationDuration={1000}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-background-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-gray-400">info</span>
            <h3 className="text-white font-bold text-lg">Description</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-gray-400">
            <p className="mb-4">
              {bet.description || "No specific description provided."}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        {((bet.bet_type !== 'PRIVATE') || hasBet) && (
          <div className="bg-background-card border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-gray-400">forum</span>
              <h3 className="text-white font-bold text-lg">
                Comments ({(Array.isArray(bet.comments) ? bet.comments : JSON.parse(bet.comments || '[]')).length})
              </h3>
            </div>

            {/* Comment List */}
            {/* Comment List */}
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {(() => {
                let comments = Array.isArray(bet.comments) ? bet.comments : JSON.parse(bet.comments || '[]');

                // Sort: Most likes first, then newest
                comments.sort((a: any, b: any) => {
                  const likesA = (a.likes || []).length;
                  const likesB = (b.likes || []).length;
                  if (likesA !== likesB) return likesB - likesA;
                  return b.timestamp - a.timestamp;
                });

                if (comments.length === 0) {
                  return <p className="text-gray-500 text-sm italic">No comments yet.</p>;
                }



                return comments.map((c: any, idx: number) => {
                  const likes = c.likes || [];
                  const isLiked = user && likes.includes(user.email);

                  return (
                    <div key={c.id || idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-[10px] text-black font-bold">
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-white">{c.name}</span>
                          {c.user === bet.creator && (
                            <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20 uppercase font-bold">Creator</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500">{new Date(c.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">{c.text}</p>

                      {/* Like Button */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            if (c.id) handleLike(c.id);
                          }}
                          className={`flex items-center gap-1 text-xs group ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                          <span className={`material-symbols-outlined text-sm ${isLiked ? 'fill-current' : ''}`}>favorite</span>
                          <span>{likes.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  )
                });
              })()}
            </div>

            {/* Comment Input */}
            {(hasBet || (user && user.email === bet.creator)) ? (
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 min-h-[80px]"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={postingComment || !commentText.trim()}
                    className="bg-primary hover:bg-primary-hover text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {postingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-gray-500 text-xs">Only participants can post comments.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Sidebar / Quick Bet */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-background-card border border-white/10 rounded-xl shadow-lg sticky top-24 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/30">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Quick Bet</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {bet.status}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2">
              {outcomes.slice(0, 2).map((outcome: string, idx: number) => {
                const stat = outcomeStats.find(s => s.outcome === outcome);
                const isWinner = bet.status === 'RESULT_DECLARED' && bet.result === outcome;
                const isLoser = bet.status === 'RESULT_DECLARED' && bet.result !== outcome;
                const isBetOn = user && participants.some((p: any) => p.user === user.email && p.prediction === outcome);

                return (
                  <button
                    key={idx}
                    onClick={() => setPrediction(outcome)}
                    disabled={bet.status !== 'OPEN'}
                    className={`relative flex flex-col items-center justify-center py-4 px-2 rounded-lg transition-all active:scale-[0.98] border-2 ${isWinner
                      ? 'bg-green-500 text-white border-green-400'
                      : isLoser
                        ? 'bg-black/30 border-white/5 text-gray-600 opacity-50'
                        : prediction === outcome
                          ? 'bg-primary/20 text-white border-primary shadow-[0_0_15px_rgba(255,111,0,0.3)]'
                          : isBetOn
                            ? 'bg-white/5 border-primary/50 text-gray-300'
                            : 'bg-black border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                  >
                    {/* Winner Badge */}
                    {isWinner && (
                      <div className="absolute -top-2 -right-2 bg-white text-green-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                        <span className="material-symbols-outlined !text-[12px]">check_circle</span>
                        WIN
                      </div>
                    )}

                    {/* Bet On Badge */}
                    {isBetOn && !isWinner && !isLoser && (
                      <div className="absolute -top-2 -right-2 bg-primary text-black text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full shadow-lg">
                        YOUR BET
                      </div>
                    )}

                    <span className="text-xs font-extrabold uppercase mb-1 opacity-90 truncate max-w-full block tracking-wider">{outcome}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-black leading-none">{stat?.percent || 0}%</span>
                    </div>
                    {stat && stat.amount > 0 && (
                      <span className="text-[10px] text-gray-500 font-bold mt-1">${stat.amount.toFixed(0)}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {outcomes.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {outcomes.slice(2).map((outcome: string, idx: number) => {
                  const stat = outcomeStats.find(s => s.outcome === outcome);
                  const isWinner = bet.status === 'RESULT_DECLARED' && bet.result === outcome;
                  const isLoser = bet.status === 'RESULT_DECLARED' && bet.result !== outcome;
                  const isBetOn = user && participants.some((p: any) => p.user === user.email && p.prediction === outcome);

                  return (
                    <button
                      key={idx}
                      onClick={() => setPrediction(outcome)}
                      disabled={bet.status !== 'OPEN'}
                      className={`relative flex-1 min-w-[100px] px-3 py-3 rounded-lg text-sm font-bold transition-all border-2 ${isWinner
                        ? 'bg-green-500 text-white border-green-400'
                        : isLoser
                          ? 'bg-black/30 border-white/5 text-gray-600 opacity-50'
                          : prediction === outcome
                            ? 'bg-primary/20 text-white border-primary shadow-[0_0_10px_rgba(255,111,0,0.2)]'
                            : isBetOn
                              ? 'bg-white/5 border-primary/50 text-gray-300'
                              : 'bg-black border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                      {isWinner && (
                        <span className="material-symbols-outlined !text-[16px] mr-1 inline-block align-middle">check_circle</span>
                      )}

                      {isBetOn && !isWinner && !isLoser && (
                        <span className="absolute -top-2 -right-2 bg-primary text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">YOUR BET</span>
                      )}

                      <span className="truncate">{outcome}</span> ({stat?.percent || 0}%)
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-gray-500 uppercase">Coins</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Balance:</span>
                  <span className="text-white flex items-center gap-0.5">{user?.money.toFixed(2) || '0.00'} <span className="material-symbols-outlined !text-[12px] text-primary">monetization_on</span></span>
                  <button
                    onClick={() => setAmount(user ? user.money.toString() : '0')}
                    className="text-primary hover:text-primary-hover uppercase tracking-tighter ml-1">Max</button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-primary !text-[20px]">monetization_on</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-black border border-white/10 rounded-lg text-white text-2xl font-black placeholder-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {prediction && amount && parseFloat(amount) > 0 && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Est. Payout</span>
                    <span className="text-green-400 font-bold text-sm">
                      ${(() => {
                        const betAmount = parseFloat(amount);

                        const outcomeStat = outcomeStats.find(s => s.outcome === prediction);
                        const outcomePool = outcomeStat ? outcomeStat.amount : 0;
                        const totalPool = bet.pool || 0;

                        const newOutcomePool = outcomePool + betAmount;
                        const newTotalPool = totalPool + betAmount;

                        if (newOutcomePool === 0) return betAmount.toFixed(2);

                        // Parimutuel Payout = (YourStake / TotalStakeOnOutcome) * TotalPool
                        const share = betAmount / newOutcomePool;
                        const payout = share * newTotalPool;
                        return payout.toFixed(2);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Potential Profit</span>
                    <span className="text-green-500 font-black text-sm">
                      +${(() => {
                        const betAmount = parseFloat(amount);
                        const outcomeStat = outcomeStats.find(s => s.outcome === prediction);
                        const outcomePool = outcomeStat ? outcomeStat.amount : 0;
                        const totalPool = bet.pool || 0;

                        const newOutcomePool = outcomePool + betAmount;
                        const newTotalPool = totalPool + betAmount;

                        if (newOutcomePool === 0) return "0.00";

                        const share = betAmount / newOutcomePool;
                        const payout = share * newTotalPool;
                        const profit = payout - betAmount;
                        return profit.toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary !text-[14px]">info</span>
                <span className="text-[10px] text-gray-400">Minimum: <span className="text-white font-bold">${bet.base_price || 10}</span></span>
              </div>
            </div>

            {bettingError && <div className="text-red-500 text-sm">{bettingError}</div>}

            <div className="space-y-3 pt-2">
              <button
                onClick={handlePlaceBet}
                disabled={placingBet || bet.status !== 'OPEN' || !prediction || hasBet}
                className="w-full bg-primary hover:bg-primary-hover text-black text-base font-black py-4 rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(255,111,0,0.4)] transition-all flex items-center justify-center gap-2 group/btn uppercase tracking-tight disabled:opacity-50"
              >
                {placingBet ? 'Placing Bet...' : hasBet ? 'Already Bet' : bet.status === 'OPEN' ? 'Place Bet' : 'Market Closed'}
                <span className="material-symbols-outlined !text-[20px] transition-transform group-hover/btn:translate-x-1">bolt</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-background-card border border-white/10 rounded-xl p-4 flex items-center justify-between group">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Creator</span>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-gray-600"></div>
              <span className="text-xs text-white font-bold truncate">{bet.creator}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MarketDetail;
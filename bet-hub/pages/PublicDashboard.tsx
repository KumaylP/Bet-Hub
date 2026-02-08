import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface TrendingCardProps {
  category: string;
  title: string;
  endsIn: string;
  volume: string;
  participants: string;
  outcomeStats: { name: string; percent: number }[];
  icon: string;
  colorClass: string;
  linkId: string;
  result?: string;
}

const TrendingCard: React.FC<TrendingCardProps> = ({
  category,
  title,
  endsIn,
  volume,
  participants,
  outcomeStats,
  icon,
  colorClass,
  linkId,
  result
}) => (
  <Link to={`/market/${linkId}`} className="group relative bg-background-card border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-background-lighter hover:border-white/20 transition-all cursor-pointer block">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
      <div className="flex gap-6 items-start flex-1">
        <div className={`size-16 flex-shrink-0 rounded-2xl bg-opacity-10 border border-opacity-20 flex items-center justify-center ${colorClass}`}>
          <span className="material-symbols-outlined !text-4xl">{icon}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-widest ${colorClass.replace('bg-', 'text-').replace('/10', '')}`}>{category}</span>
            <span className="size-1 rounded-full bg-gray-600"></span>
            <span className="text-xs text-gray-500 font-medium">
              {(result || endsIn === 'Ended') ? <span className="text-red-500 font-black">CLOSED</span> : `Ends in ${endsIn}`}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Total Volume</span>
              <div className="flex items-center gap-1 text-white font-bold text-lg">
                <span>{volume}</span>
                <span className="material-symbols-outlined text-primary !text-[20px]">monetization_on</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Participants</span>
              <div className="flex items-center gap-1 text-white font-bold text-lg">
                <span>{participants}</span>
                <span className="material-symbols-outlined text-blue-400 !text-[20px]">group</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-96">
        {outcomeStats.slice(0, 2).map((stat, idx) => {
          const isWinner = result && stat.name === result;
          return (
            <button
              key={idx}
              className={`relative flex-1 p-4 rounded-xl border transition-all group/btn overflow-hidden ${isWinner
                ? 'bg-green-500/20 border-green-500/50'
                : idx === 0
                  ? 'bg-primary/10 border-primary/20 hover:bg-primary'
                  : 'bg-red-500/10 border-red-500/20 hover:bg-red-500'
                }`}
            >
              {isWinner && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[10px]">check_circle</span>
                  WIN
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-xs font-bold ${isWinner
                  ? 'text-green-500'
                  : idx === 0
                    ? 'text-primary'
                    : 'text-red-500'
                  } group-hover/btn:text-white uppercase`}>
                  {stat.name}
                </span>
                <span className="text-3xl font-black text-white">{stat.percent}%</span>
              </div>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full ${isWinner
                  ? 'bg-green-500'
                  : idx === 0
                    ? 'bg-primary'
                    : 'bg-red-500'
                  }`}
                style={{ width: `${stat.percent}%` }}
              ></div>
            </button>
          );
        })}
        {outcomeStats.length > 2 && (
          <div className="flex items-center justify-center p-2 text-xs text-gray-500 bg-white/5 rounded-xl border border-white/5">
            +{outcomeStats.length - 2} more
          </div>
        )}
      </div>
    </div>
  </Link>
);

const PublicDashboard: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [bets, setBets] = useState<any[]>([]);
  const [completedBets, setCompletedBets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'trending' | 'completed'>('trending');
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const data = await api.getBets();
        // Handle null/undefined responses gracefully
        const allBets = Array.isArray(data) ? data : [];

        // Separate active bets from completed bets
        const active = allBets.filter(b => b.status !== 'RESULT_DECLARED' && b.status !== 'CLOSED');
        const completed = allBets.filter(b => b.status === 'RESULT_DECLARED' || b.status === 'CLOSED');

        setBets(active);
        setCompletedBets(completed);
      } catch (err) {
        console.error("Failed to fetch bets", err);
        setBets([]);
        setCompletedBets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
    const interval = setInterval(fetchBets, 2000); // Poll every 2 seconds for real-time updates
    return () => clearInterval(interval);
  }, []);

  // Helper to format duration
  const getEndsIn = (endTimeTimestamp: number) => {
    const diff = endTimeTimestamp * 1000 - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  // Helper to calculate percentages
  const getStats = (bet: any) => {
    let participants = [];
    let outcomes = [];
    try {
      participants = Array.isArray(bet.participants) ? bet.participants : JSON.parse(bet.participants || '[]');
      outcomes = Array.isArray(bet.outcomes) ? bet.outcomes : JSON.parse(bet.outcomes || '["Yes", "No"]');
    } catch (e) {
      participants = [];
      outcomes = ["Yes", "No"];
    }

    const total = participants.length;
    if (total === 0) {
      return outcomes.map((o: string) => ({ name: o, percent: 0 }));
    }

    return outcomes.map((outcome: string) => {
      const count = participants.filter((p: any) => p.prediction === outcome).length;
      return {
        name: outcome,
        percent: Math.round((count / total) * 100)
      };
    });
  };

  // Filter bets based on search query and category
  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (bet.category === selectedCategory) || (selectedCategory === 'Sports' && !bet.category); // Default older bets to Sports
    return matchesSearch && matchesCategory;
  });

  const filteredCompletedBets = completedBets.filter(bet => {
    const matchesSearch = bet.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (bet.category === selectedCategory) || (selectedCategory === 'Sports' && !bet.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background-card to-black border border-white/5 p-6 md:p-10 text-center md:text-left">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-80 w-80 rounded-full bg-primary/10 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined !text-[14px]">public</span>
                Live Public Dashboard
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                Bet the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Shit Out.</span>
              </h1>
            </div>
            <div className="flex-shrink-0">
              <Link to="/create" className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-0.5 font-bold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95">
                <span className="absolute h-full w-full bg-gradient-to-br from-primary via-orange-500 to-yellow-500 opacity-20 group-hover:opacity-40 transition-opacity"></span>
                <span className="relative flex items-center gap-3 rounded-2xl bg-black px-8 py-4 transition-all group-hover:bg-opacity-90">
                  <span className="material-symbols-outlined text-primary !text-2xl">add_circle</span>
                  <span className="text-lg">Bet Now!</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white">
                {activeTab === 'trending' ? 'Trending Bets' : 'Completed Bets'}
              </h2>
              <p className="text-gray-500 text-sm">
                {activeTab === 'trending'
                  ? 'Real-time public sentiment across global events.'
                  : 'View results from finished betting markets.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'trending'
                  ? 'text-primary bg-white/5 border border-primary/20 shadow-sm'
                  : 'text-gray-500 hover:text-white border border-white/5'
                  }`}
              >
                <span className="material-symbols-outlined !text-[16px]">trending_up</span>
                Trending
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'completed'
                  ? 'text-primary bg-white/5 border border-primary/20 shadow-sm'
                  : 'text-gray-500 hover:text-white border border-white/5'
                  }`}
              >
                <span className="material-symbols-outlined !text-[16px]">check_circle</span>
                Completed
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${selectedCategory === 'All'
                ? 'bg-primary text-black border-primary'
                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'
                }`}
            >
              All Checks
            </button>
            {['Sports', 'Politics', 'Academics', 'Gossip'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${selectedCategory === cat
                  ? 'bg-primary/20 text-primary border-primary'
                  : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading markets...</div>
            ) : activeTab === 'trending' ? (
              filteredBets.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  {searchQuery ? 'No markets found matching your search.' : 'No active markets. Be the first to create one!'}
                </div>
              ) : (
                filteredBets.map(bet => {
                  const outcomeStats = getStats(bet);
                  const participants = Array.isArray(bet.participants) ? bet.participants : JSON.parse(bet.participants || '[]');

                  const cardProps: {
                    category: string;
                    title: string;
                    endsIn: string;
                    volume: string;
                    participants: string;
                    outcomeStats: { name: string; percent: number }[];
                    icon: string;
                    colorClass: string;
                    linkId: string;
                    result?: string;
                  } = {
                    category: bet.bet_type === 'PUBLIC' ? 'Public' : 'Private',
                    title: String(bet.title),
                    endsIn: getEndsIn(bet.end_time),
                    volume: `$${bet.pool?.toFixed(0) || 0}`,
                    participants: String(participants.length),
                    outcomeStats: outcomeStats,
                    icon: "trending_up",
                    colorClass: "bg-blue-500/10 border-blue-500/20 text-blue-500",
                    linkId: String(bet.id)
                  };

                  return (
                    <TrendingCard
                      key={bet.id}
                      category={cardProps.category}
                      title={cardProps.title}
                      endsIn={cardProps.endsIn}
                      volume={cardProps.volume}
                      participants={cardProps.participants}
                      outcomeStats={cardProps.outcomeStats}
                      icon={cardProps.icon}
                      colorClass={cardProps.colorClass}
                      linkId={cardProps.linkId}
                    />
                  );
                })
              )
            ) : (
              filteredCompletedBets.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  {searchQuery ? 'No completed markets found matching your search.' : 'No completed markets yet.'}
                </div>
              ) : (
                filteredCompletedBets.map(bet => {
                  const outcomeStats = getStats(bet);
                  const participants = Array.isArray(bet.participants) ? bet.participants : JSON.parse(bet.participants || '[]');

                  const cardProps = {
                    category: bet.bet_type.toUpperCase() || "PRIVATE",
                    title: bet.title,
                    endsIn: getEndsIn(bet.end_time),
                    volume: `${bet.pool.toFixed(2)}`,
                    participants: String(participants.length),
                    outcomeStats,
                    icon: "sports",
                    colorClass: "text-primary",
                    linkId: bet.id,
                    result: bet.result,
                  };

                  return (
                    <TrendingCard
                      key={bet.id}
                      category={cardProps.category}
                      title={cardProps.title}
                      endsIn={cardProps.endsIn}
                      volume={cardProps.volume}
                      participants={cardProps.participants}
                      outcomeStats={cardProps.outcomeStats}
                      icon={cardProps.icon}
                      colorClass={cardProps.colorClass}
                      linkId={cardProps.linkId}
                      result={cardProps.result}
                    />
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
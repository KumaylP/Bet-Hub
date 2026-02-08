import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

const CreateMarket: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('Sports');
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minBet, setMinBet] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdBet, setCreatedBet] = useState<any>(null);

  // Dynamic Outcomes
  const [outcomes, setOutcomes] = useState<string[]>(['Yes', 'No']);
  const [newOutcome, setNewOutcome] = useState('');

  const categories = [
    { name: 'Sports', icon: 'sports_basketball' },
    { name: 'Politics', icon: 'account_balance' },
    { name: 'Academics', icon: 'school' },
    { name: 'Gossip', icon: 'forum' }
  ];

  const handleAddOutcome = () => {
    if (newOutcome.trim() && !outcomes.includes(newOutcome.trim())) {
      setOutcomes([...outcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length > 2) {
      const newOutcomes = outcomes.filter((_, i) => i !== index);
      setOutcomes(newOutcomes);
    } else {
      setError("A market must have at least 2 outcomes.");
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to create a bet.");
      return;
    }
    if (outcomes.length < 2) {
      setError("Please add at least 2 outcomes.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        base_price: parseFloat(minBet) || 10,
        end_time: endDate ? new Date(endDate).getTime() / 1000 : Date.now() / 1000 + 86400,
        bet_type: isPublic ? 'PUBLIC' : 'PRIVATE',
        creator_email: user.email,
        outcomes: outcomes,
        category: category
      };

      const res = await api.createBet(payload);
      if (res.error) {
        setError(res.error);
      } else {
        setCreatedBet(res);
        setShowSuccess(true);
        refreshUser();
      }
    } catch (err) {
      setError('Failed to create bet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-background-card border border-primary/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,111,0,0.2)] text-center animate-in zoom-in duration-300">
            <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined !text-[48px] text-primary">verified</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Market Created!</h2>
            <p className="text-gray-400 mb-6">Your prediction market is now live and waiting for participants.</p>

            {createdBet?.bet_code && (
              <div className="bg-black/60 rounded-2xl p-6 border border-white/10 mb-8">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Unique Join Code</p>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-5xl font-black text-primary tracking-tighter font-mono">{createdBet.bet_code}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdBet.bet_code);
                      alert('Code copied!');
                    }}
                    className="flex items-center gap-2 text-xs text-primary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined !text-[14px]">content_copy</span>
                    Copy to clipboard
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(createdBet?.bet_type === 'PRIVATE' ? '/private' : '/')}
              className="w-full bg-primary hover:bg-primary-hover text-black font-black py-4 rounded-xl transition-all shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Create a New Bet</h1>
            <p className="text-gray-400 mt-2 text-sm">Set up your market and invite others to predict the outcome.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium bg-background-card border border-white/5 px-3 py-1.5 rounded-lg text-orange-500">
            <span className="material-symbols-outlined !text-[16px]">info</span>
            Creators cannot participate in their own bets
          </div>
        </div>

        {/* Step 1: Category */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary text-black text-[10px] font-black">1</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Select Market Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <label key={cat.name} className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  className="sr-only"
                  checked={category === cat.name}
                  onChange={() => setCategory(cat.name)}
                />
                <div className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-2 ${category === cat.name ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-white/10 bg-background-card hover:bg-background-elevated hover:border-primary/50'}`}>
                  <span className={`material-symbols-outlined !text-[32px] transition-colors ${category === cat.name ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>{cat.icon}</span>
                  <span className={`text-xs font-semibold ${category === cat.name ? 'text-white' : 'text-gray-300'}`}>{cat.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

          {/* Step 2: Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-white/10 text-white text-[10px] font-black">2</span>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Bet Details</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Bet Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-lg border-white/10 bg-background-card py-3 px-4 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
                placeholder="e.g., Will Bitcoin hit $100k by December 31st?"
              />
              <p className="text-xs text-gray-500">Make it clear and unambiguous. A Yes/No question works best.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Description & Rules</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-lg border-white/10 bg-background-card py-3 px-4 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm resize-none"
                placeholder="Provide details about how the bet will be resolved. Specify the source of truth."
              ></textarea>
            </div>

            {/* Dynamic Outcomes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Outcomes</label>
              <div className="space-y-2">
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm flex items-center justify-between">
                      <span>{outcome}</span>
                      {outcomes.length > 2 && (
                        <button onClick={() => handleRemoveOutcome(idx)} className="text-gray-500 hover:text-red-500">
                          <span className="material-symbols-outlined !text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="Add another outcome..."
                  className="flex-1 bg-background-card border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOutcome()}
                />
                <button onClick={handleAddOutcome} type="button" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold">
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Minimum Bet Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    value={minBet}
                    onChange={(e) => setMinBet(e.target.value)}
                    className="block w-full rounded-lg border-white/10 bg-background-card py-3 pl-8 pr-4 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
                    placeholder="10.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Resolution Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-lg border-white/10 bg-background-card py-3 px-4 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between rounded-xl bg-background-card border border-white/5 p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Market Visibility</span>
                  <span className="text-xs text-gray-400">Public markets appear on the homepage.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${!isPublic ? 'text-white' : 'text-gray-500'}`}>Private</span>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-primary' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-xs font-medium ${isPublic ? 'text-primary' : 'text-gray-500'}`}>Public</span>
                </div>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-black shadow-[0_0_20px_rgba(255,111,0,0.3)] transition-all hover:bg-[#FF8F00] hover:shadow-[0_0_30px_rgba(255,111,0,0.5)] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Market'}
                <span className="material-symbols-outlined !text-[20px]">rocket_launch</span>
              </button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-background-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
              <div className="group relative bg-black/50 hover:bg-background-elevated rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-start gap-3 mb-3">
                  <div className="size-8 rounded-full bg-white/5 p-1 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary !text-[18px]">pending</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm mb-2">{title || 'Bet Title...'}</div>
                    <div className="h-3 w-20 bg-white/5 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  {outcomes.slice(0, 2).map((o, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                      <span className={`text-sm font-bold ${i === 0 ? 'text-primary' : i === 1 ? 'text-accent-red' : 'text-white'}`}>{o}</span>
                      <span className="text-xs text-gray-400">0%</span>
                    </div>
                  ))}
                  {outcomes.length > 2 && <div className="text-center text-xs text-gray-500">+{outcomes.length - 2} more outcomes</div>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">This is how your bet will appear in the feed.</p>
            </div>

            <div className="rounded-xl border border-dashed border-white/10 bg-transparent p-6 text-center">
              <div className="mx-auto size-12 flex items-center justify-center rounded-full bg-background-card mb-3">
                <span className="material-symbols-outlined text-gray-500">gavel</span>
              </div>
              <h3 className="text-sm font-medium text-white">Managing your bets</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">Once the event date passes, you must declare the result within 24 hours.</p>
              <button className="w-full rounded-lg bg-background-card border border-primary/30 text-primary px-4 py-2 text-sm font-bold transition-all hover:bg-primary/10 hover:border-primary opacity-50 cursor-not-allowed" disabled>
                Declare Result
              </button>
              <p className="text-[10px] text-gray-600 mt-2">Active only on your live bets</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateMarket;
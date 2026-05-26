import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Gift, Link2, QrCode, Share2, TrendingUp, Wallet, Users, Clock, CheckCircle2, AlertTriangle, Send, Trophy } from 'lucide-react';
import { UserProfile } from '../../lib/storage';
import { affiliateEngine, WithdrawRequest } from '../../lib/affiliate';
import { realtimeBus } from '../../services/realtime';

export const AffiliateWallet: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [code, setCode] = useState('');
  const [stats, setStats] = useState({ totalEarned: 0, availableBalance: 0, pending: 0, totalReferrals: 0, conversionRate: 0, earnings: [] as any[], withdrawals: [] as WithdrawRequest[] });
  const [copied, setCopied] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [message, setMessage] = useState('');

  const referralLink = useMemo(() => `${window.location.origin}?ref=${code || 'YOUR-CODE'}`, [code]);

  const refresh = async () => {
    const affiliateCode = await affiliateEngine.getOrCreateCode(user.id, user.name);
    setCode(affiliateCode.code);
    const nextStats = await affiliateEngine.getStats(user.id);
    setStats(nextStats);
  };

  useEffect(() => {
    refresh();
    const onWalletUpdate = () => refresh();
    window.addEventListener('tsolver-wallet-updated', onWalletUpdate);
    return () => window.removeEventListener('tsolver-wallet-updated', onWalletUpdate);
  }, [user.id, user.name]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareCode = async () => {
    const text = `Join T-Solver AI with my referral code ${code}: ${referralLink}`;
    if (navigator.share) {
      await navigator.share({ title: 'T-Solver AI', text, url: referralLink });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const submitWithdraw = async () => {
    const result = await affiliateEngine.requestWithdraw({
      userId: user.id,
      amount: Number(withdrawAmount),
      paymentMethod: withdrawMethod,
      accountNumber
    });
    setMessage(result.message);
    if (result.ok) {
      realtimeBus.publish('wallet:update', { type: 'withdraw-request', request: result.request }, user.id);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setAccountNumber('');
      refresh();
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const cards = [
    { label: 'Total Earned', value: `৳${stats.totalEarned}`, icon: Wallet, accent: 'from-emerald-400 to-cyan-400' },
    { label: 'Available Balance', value: `৳${stats.availableBalance}`, icon: Gift, accent: 'from-cyan-400 to-purple-500' },
    { label: 'Pending', value: `৳${stats.pending}`, icon: Clock, accent: 'from-yellow-300 to-orange-500' },
    { label: 'Total Referrals', value: stats.totalReferrals, icon: Users, accent: 'from-pink-400 to-purple-500' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 space-y-10">
      <div className="relative overflow-hidden rounded-[48px] border border-white/10 bg-black p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,.18),transparent_40%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.35em] text-cyan-200">
              <Wallet size={14} /> Growth Engine
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white">Affiliate Wallet</h2>
            <p className="max-w-2xl text-sm font-bold leading-7 text-white/45">
              Invite friends, sell premium, earn commission, withdraw via bKash/Nagad/Rocket and track your ranking in realtime.
            </p>
          </div>
          <button
            onClick={() => setShowWithdraw(true)}
            className="h-16 px-10 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Send size={18} /> Withdraw Balance
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-bold text-cyan-100">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <motion.div key={card.label} whileHover={{ y: -6 }} className="cyber-panel p-6 overflow-hidden relative">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/25">{card.label}</p>
                <p className="mt-3 text-4xl font-black italic tracking-tighter text-white">{card.value}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/35">
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="cyber-panel p-7 md:p-9 space-y-7">
          <div className="flex items-center gap-3">
            <Link2 size={18} className="text-cyan-300" />
            <h3 className="text-xs font-black uppercase tracking-[0.35em] text-white/40">Referral Link</h3>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/25">Your Referral Code</p>
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <p className="text-3xl md:text-5xl font-black tracking-widest text-cyan-200 break-all">{code || 'GENERATING'}</p>
              <div className="flex gap-3">
                <button onClick={copyCode} className="h-12 px-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={shareCode} className="h-12 px-5 rounded-2xl border border-white/10 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
            <p className="rounded-2xl bg-black/30 border border-white/5 p-4 text-xs font-mono text-white/45 break-all">{referralLink}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['20% Commission', 'Promo Discount Ready', 'Realtime Wallet'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <CheckCircle2 size={18} className="mx-auto text-emerald-300" />
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-white/45">{item}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.35em] text-white/40">Earnings History</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{stats.earnings.length} records</span>
            </div>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {stats.earnings.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 p-10 text-center text-xs font-bold text-white/25">
                  No commission yet. Share your link to start earning.
                </div>
              ) : (
                stats.earnings.map((earning) => (
                  <div key={earning.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-white">{earning.planType} Premium Sale</p>
                      <p className="mt-1 text-[10px] font-bold text-white/30">{new Date(earning.createdAt).toLocaleString()} • {earning.status}</p>
                    </div>
                    <p className="text-xl font-black text-emerald-300">+৳{earning.commissionAmount}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="cyber-panel p-7 space-y-5">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-purple-300" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Smart Insights</h3>
            </div>
            <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-5 text-sm font-bold leading-7 text-purple-100/75">
              Your conversion rate is {stats.conversionRate}%. Share between 8-10 PM and use study groups for better premium conversion.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Conversion</p>
                <p className="text-2xl font-black text-white">{stats.conversionRate}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Rank</p>
                <p className="text-2xl font-black text-white">Starter</p>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-7 space-y-5">
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-yellow-300" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Affiliate Ranking</h3>
            </div>
            {[
              ['Bronze Affiliate', '৳1,000'],
              ['Silver Seller', '৳5,000'],
              ['Gold Partner', '৳15,000'],
              ['Diamond Ambassador', '৳50,000']
            ].map(([name, target]) => (
              <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/45">{name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{target}</span>
              </div>
            ))}
          </div>

          <div className="cyber-panel p-7 space-y-5">
            <div className="flex items-center gap-3">
              <QrCode size={18} className="text-cyan-300" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">QR Preview</h3>
            </div>
            <div className="aspect-square rounded-[32px] border border-white/10 bg-white p-8 flex items-center justify-center text-black">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 75 }).map((_, index) => (
                  <span key={index} className={`h-3 w-3 ${(index + code.length) % 3 === 0 ? 'bg-black' : 'bg-black/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} className="w-full max-w-lg rounded-[40px] border border-white/10 bg-black p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Withdraw</h3>
                <button onClick={() => setShowWithdraw(false)} className="h-11 w-11 rounded-2xl bg-white/5 text-white/50">×</button>
              </div>

              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 flex gap-3 text-xs font-bold leading-6 text-yellow-100/70">
                <AlertTriangle size={18} className="shrink-0" /> Minimum ৳100. Admin will review fraud checks before payment.
              </div>

              <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} type="number" placeholder="Amount" className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-5 text-white outline-none" />
              <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value as any)} className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-5 text-white outline-none">
                <option className="bg-black">bKash</option>
                <option className="bg-black">Nagad</option>
                <option className="bg-black">Rocket</option>
              </select>
              <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account Number" className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-5 text-white outline-none" />
              <button onClick={submitWithdraw} className="h-14 w-full rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest">Submit Request</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

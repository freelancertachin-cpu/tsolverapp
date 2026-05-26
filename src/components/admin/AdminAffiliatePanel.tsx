import React, { useEffect, useState } from 'react';
import { Check, Crown, ShieldAlert, Wallet, X } from 'lucide-react';
import { affiliateEngine, AffiliateEarning, WithdrawRequest } from '../../lib/affiliate';

const readList = <T,>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
};

export const AdminAffiliatePanel: React.FC = () => {
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);

  const refresh = () => {
    setEarnings(readList<AffiliateEarning>('tsolver_affiliate_earnings'));
    setWithdrawals(readList<WithdrawRequest>('tsolver_withdraw_requests'));
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('tsolver-wallet-updated', handler);
    return () => window.removeEventListener('tsolver-wallet-updated', handler);
  }, []);

  const approveEarning = async (id: string) => {
    await affiliateEngine.adminApproveEarning(id);
    refresh();
  };

  const updateWithdraw = async (id: string, status: 'completed' | 'rejected') => {
    const txid = status === 'completed' ? window.prompt('Payment transaction ID / note') || undefined : undefined;
    await affiliateEngine.adminUpdateWithdraw(id, status, txid);
    refresh();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="cyber-panel p-6">
          <Wallet className="text-cyan-300" />
          <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-white/25">Total Commission</p>
          <p className="text-4xl font-black text-white">৳{earnings.reduce((sum, item) => sum + item.commissionAmount, 0)}</p>
        </div>
        <div className="cyber-panel p-6">
          <Crown className="text-yellow-300" />
          <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-white/25">Pending Earnings</p>
          <p className="text-4xl font-black text-white">{earnings.filter((item) => item.status === 'pending').length}</p>
        </div>
        <div className="cyber-panel p-6">
          <ShieldAlert className="text-red-300" />
          <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-white/25">Withdraw Queue</p>
          <p className="text-4xl font-black text-white">{withdrawals.filter((item) => item.status === 'pending').length}</p>
        </div>
      </div>

      <div className="cyber-panel p-7 space-y-5">
        <h3 className="text-xs font-black uppercase tracking-[0.35em] text-white/40">Pending Withdrawals</h3>
        {withdrawals.filter((item) => item.status === 'pending').length === 0 ? (
          <p className="text-sm font-bold text-white/30">No pending withdraw requests.</p>
        ) : (
          withdrawals.filter((item) => item.status === 'pending').map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-black text-white">৳{item.amount} • {item.paymentMethod}</p>
                <p className="text-[10px] font-bold text-white/30">{item.accountNumber} • {new Date(item.requestedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => updateWithdraw(item.id, 'completed')} className="h-11 px-5 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Check size={14} /> Paid</button>
                <button onClick={() => updateWithdraw(item.id, 'rejected')} className="h-11 px-5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><X size={14} /> Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cyber-panel p-7 space-y-5">
        <h3 className="text-xs font-black uppercase tracking-[0.35em] text-white/40">Commission Approval</h3>
        {earnings.filter((item) => item.status === 'pending').length === 0 ? (
          <p className="text-sm font-bold text-white/30">No pending commission.</p>
        ) : (
          earnings.filter((item) => item.status === 'pending').map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-black text-white">৳{item.commissionAmount} • {item.planType}</p>
                <p className="text-[10px] font-bold text-white/30">Code: {item.promoCodeUsed} • Sale ৳{item.planAmount}</p>
              </div>
              <button onClick={() => approveEarning(item.id)} className="h-11 px-5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Check size={14} /> Approve</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

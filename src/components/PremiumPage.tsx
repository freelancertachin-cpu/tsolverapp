import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Crown, 
  Zap, 
  ShieldCheck, 
  PhoneCall, 
  Copy, 
  Upload,
  ArrowRight,
  Sparkles,
  Star,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, storage } from '../lib/storage';
import { useTranslation } from '../lib/useTranslation';
import { affiliateEngine } from '../lib/affiliate';
import { realtimeBus } from '../services/realtime';

export const PremiumPage: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semi' | 'yearly'>('monthly');
  const [step, setStep] = useState(1);
  const [txid, setTxid] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const plans = {
    monthly: { id: 'monthly', title: 'Monthly', price: 100, duration: '1 Month', icon: <Zap /> },
    semi: { id: 'semi', title: 'Power User', price: 250, duration: '6 Months', icon: <ShieldCheck />, bestValue: true },
    yearly: { id: 'yearly', title: 'Master Scholar', price: 400, duration: '1 Year', icon: <Crown /> }
  };

  const discount = promoApplied && promoCode.trim() ? Math.round(plans[selectedPlan].price * 0.2) : 0;
  const payableAmount = Math.max(0, plans[selectedPlan].price - discount);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    const code = await affiliateEngine.getCodeByValue(promoCode);
    setPromoApplied(Boolean(code && code.userId !== user.id));
  };

  useEffect(() => {
    const pendingReferral = localStorage.getItem('tsolver_pending_referral');
    if (pendingReferral && !promoCode) {
      setPromoCode(pendingReferral);
    }
  }, [promoCode]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('01940773721');
    // Minimal toast logic here if needed
  };

  const handleSubmitTransaction = async () => {
    if (!txid.trim()) return;
    setIsSubmitting(true);
    try {
      // Save payment request to Firebase/Local
      await storage.savePaymentRequest({
        userId: user.id,
        planId: selectedPlan,
        amount: payableAmount,
        originalAmount: plans[selectedPlan].price,
        promoCode: promoApplied ? promoCode.trim().toUpperCase() : '',
        discount,
        txid: txid,
        status: 'pending',
        timestamp: Date.now()
      });
      if (promoApplied && promoCode.trim()) {
        await affiliateEngine.createCommission({
          referredUserId: user.id,
          promoCode: promoCode.trim().toUpperCase(),
          planType: selectedPlan,
          planAmount: plans[selectedPlan].price
        });
        realtimeBus.publish('wallet:update', { type: 'commission-created', plan: selectedPlan }, user.id);
      }
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-20 pb-20">
      <div className="text-center space-y-6">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="h-20 w-20 bg-yellow-500/10 rounded-[24px] flex items-center justify-center mx-auto text-yellow-500 border border-yellow-500/20 shadow-glow"
         >
            <Crown size={40} />
         </motion.div>
         <div className="space-y-4">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter italic">Ascend to Premium</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-black/40 dark:text-white/30">Unlock the neural potential of T-Solver</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {Object.values(plans).map((plan: any) => (
           <motion.div 
              key={plan.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`cyber-panel p-10 flex flex-col justify-between space-y-10 cursor-pointer transition-all border-2 ${selectedPlan === plan.id ? 'border-yellow-500 bg-yellow-500/5' : 'border-white/5 hover:border-white/20'}`}
           >
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center ${selectedPlan === plan.id ? 'text-yellow-500' : 'text-white/20'}`}>
                       {plan.icon}
                    </div>
                    {plan.bestValue && <span className="bg-yellow-500 text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Best Value</span>}
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">{plan.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{plan.duration}</p>
                 </div>
              </div>

              <div className="space-y-1">
                 <p className="text-4xl font-black italic tracking-tighter">{plan.price} BDT</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/10">Promo + affiliate ready</p>
              </div>

              <div className="space-y-4 pt-10 border-t border-white/5">
                 {[
                   'Unlimited AI Teacher',
                   'Premium Game Access',
                   'Blue Verified Badge',
                   'Ad-Free Pipeline',
                   'Global Data Sync'
                 ].map(feature => (
                   <div key={feature} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40">
                      <Check size={14} className="text-yellow-500" /> {feature}
                   </div>
                 ))}
              </div>
           </motion.div>
         ))}
      </div>

      {/* Checkout Section */}
      <AnimatePresence mode="wait">
         {isSuccess ? (
           <motion.div 
             key="success"
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             className="cyber-panel p-20 text-center space-y-8 border-green-500/50 bg-green-500/5"
           >
              <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto text-green-500">
                 <CheckCircle2 size={64} />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter">Transmission Received</h3>
                 <p className="text-xs font-black uppercase tracking-widest text-white/40 leading-relaxed max-w-sm mx-auto">
                    Admin nodes are verifying your transaction. Access will be granted within 1-12 hours.
                 </p>
              </div>
              <button 
                onClick={() => setIsSuccess(false)}
                className="h-14 px-10 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                 Understood
              </button>
           </motion.div>
         ) : (
           <motion.div 
             key="checkout"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="grid grid-cols-1 lg:grid-cols-2 gap-8"
           >
              <div className="cyber-panel p-10 space-y-10">
                 <div className="flex items-center gap-4">
                    <PhoneCall className="text-yellow-500" size={24} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Payment Execution</h3>
                 </div>
                 
                 <div className="p-10 rounded-[32px] bg-white/5 border border-white/5 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Zap size={100} />
                    </div>
                    <div className="space-y-1 relative z-10">
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Official bKash Personal</p>
                       <p className="text-4xl font-black italic tracking-tighter">01940773721</p>
                    </div>
                    <button 
                      onClick={handleCopyNumber}
                      className="h-12 px-8 rounded-xl bg-white/10 hover:bg-white hover:text-black transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest relative z-10"
                    >
                       <Copy size={14} /> Copy Interface
                    </button>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol Guide:</p>
                    <div className="space-y-3">
                       {[
                         'Send precise amount via bKash Personal Send Money',
                         'Keep a record of your Transaction ID (TrxID)',
                         'Input TrxID in the secondary interface',
                         'Await admin signal verification'
                       ].map((step, idx) => (
                         <div key={idx} className="flex gap-4 items-start">
                            <span className="text-yellow-500 font-bold text-xs">0{idx+1}</span>
                            <p className="text-xs font-black uppercase tracking-wide text-white/40">{step}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="cyber-panel p-10 space-y-10">
                 <div className="flex items-center gap-4">
                    <Sparkles className="text-yellow-500" size={24} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Verification Node</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block ml-2">Promo / Affiliate Code</label>
                       <div className="flex gap-3">
                         <input
                           value={promoCode}
                           onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoApplied(false); }}
                           placeholder="TSOLVER-CODE"
                           className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-cyan-400/50 transition-all font-bold tracking-widest placeholder:text-white/10 uppercase"
                         />
                         <button
                           type="button"
                           onClick={validatePromoCode}
                           className="h-14 px-5 rounded-2xl bg-cyan-400 text-black text-[10px] font-black uppercase tracking-widest"
                         >
                           Apply
                         </button>
                       </div>
                       {promoApplied && <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">20% discount applied. Affiliate commission will be generated after verification.</p>}
                    </div>

                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block ml-2">Transaction ID (TrxID)</label>
                       <input 
                         value={txid}
                         onChange={(e) => setTxid(e.target.value)}
                         placeholder="Enter bKash TrxID"
                         className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-yellow-500/50 transition-all font-bold tracking-widest placeholder:text-white/10 uppercase"
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block ml-2">Payment Evidence</label>
                       <div className="h-48 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all group">
                          <Upload className="text-white/10 group-hover:text-yellow-500 transition-colors" size={32} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Link Screenshot Node</p>
                       </div>
                    </div>
                 </div>

                 <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Payable Amount</p>
                    <p className="text-4xl font-black italic tracking-tighter text-white">{payableAmount} BDT</p>
                    {discount > 0 && <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Saved {discount} BDT by promo code</p>}
                 </div>

                 <button 
                   onClick={handleSubmitTransaction}
                   disabled={!txid || isSubmitting}
                   className="h-20 w-full bg-yellow-500 text-black rounded-[32px] font-black uppercase text-sm tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(234,179,8,0.3)]"
                 >
                    {isSubmitting ? 'Verifying Protocol...' : (
                      <>Initialize Ascendance <ArrowRight size={20} /></>
                    )}
                 </button>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-10 opacity-30">
         <div className="flex items-center gap-3">
            <Star size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">SSL Secure Link</span>
         </div>
         <div className="flex items-center gap-3">
            <CheckCircle2 size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Instant Node Unlock</span>
         </div>
         <div className="flex items-center gap-3">
            <ShieldCheck size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Payment Pipeline</span>
         </div>
      </div>
    </div>
  );
};

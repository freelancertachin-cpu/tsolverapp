import { supabase, isFirebaseConfigured } from './supabase';

export type AffiliateStatus = 'pending' | 'approved' | 'paid' | 'rejected';
export type WithdrawStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface AffiliateCode {
  userId: string;
  code: string;
  createdAt: number;
}

export interface AffiliateEarning {
  id: string;
  referrerId: string;
  referredUserId?: string;
  promoCodeUsed: string;
  planType: string;
  planAmount: number;
  commissionAmount: number;
  status: AffiliateStatus;
  createdAt: number;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
  accountNumber: string;
  status: WithdrawStatus;
  transactionId?: string;
  requestedAt: number;
  processedAt?: number;
}

const CODE_KEY = 'tsolver_affiliate_codes';
const EARNING_KEY = 'tsolver_affiliate_earnings';
const WITHDRAW_KEY = 'tsolver_withdraw_requests';
const VISIT_KEY = 'tsolver_referral_visits';

const readList = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
};

const writeList = <T>(key: string, value: T[]) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('tsolver-wallet-updated'));
};

const safePrefix = (name: string) =>
  name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10) || 'TSOLVER';

const randomToken = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const affiliateEngine = {
  async getOrCreateCode(userId: string, userName: string): Promise<AffiliateCode> {
    const localCodes = readList<AffiliateCode>(CODE_KEY);
    const existing = localCodes.find((item) => item.userId === userId);
    if (existing) return existing;

    const base = safePrefix(userName);
    const taken = new Set(localCodes.map((item) => item.code));
    let code = `${base}-${randomToken()}`;
    while (taken.has(code)) code = `${base}-${randomToken()}`;

    const nextCode: AffiliateCode = { userId, code, createdAt: Date.now() };
    writeList(CODE_KEY, [...localCodes, nextCode]);

    if (isFirebaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('affiliate_codes').upsert({
            user_id: user.id,
            code,
            created_at: new Date(nextCode.createdAt).toISOString()
          });
        }
      } catch (error) {
        console.warn('Affiliate code Firebase sync failed:', error);
      }
    }

    return nextCode;
  },

  async getCodeByValue(code: string): Promise<AffiliateCode | null> {
    const normalized = code.trim().toUpperCase();
    const local = readList<AffiliateCode>(CODE_KEY).find((item) => item.code.toUpperCase() === normalized);
    if (local) return local;

    if (isFirebaseConfigured()) {
      try {
        const { data } = await supabase
          .from('affiliate_codes')
          .select('user_id, code, created_at')
          .eq('code', normalized)
          .single();
        if (data) {
          return {
            userId: data.user_id,
            code: data.code,
            createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
          };
        }
      } catch (error) {
        console.warn('Affiliate code lookup failed:', error);
      }
    }

    return null;
  },

  async trackReferralVisit(code: string) {
    if (!code.trim()) return;
    const visits = readList<any>(VISIT_KEY);
    const visit = {
      id: crypto.randomUUID(),
      referralCode: code.trim().toUpperCase(),
      userAgent: navigator.userAgent,
      createdAt: Date.now(),
      converted: false
    };
    writeList(VISIT_KEY, [visit, ...visits]);
  },

  async createCommission(input: {
    referredUserId: string;
    promoCode: string;
    planType: string;
    planAmount: number;
  }): Promise<AffiliateEarning | null> {
    if (!input.promoCode.trim()) return null;
    const code = await affiliateEngine.getCodeByValue(input.promoCode);
    if (!code || code.userId === input.referredUserId) return null;

    const earning: AffiliateEarning = {
      id: crypto.randomUUID(),
      referrerId: code.userId,
      referredUserId: input.referredUserId,
      promoCodeUsed: code.code,
      planType: input.planType,
      planAmount: input.planAmount,
      commissionAmount: Math.round(input.planAmount * 0.2),
      status: 'pending',
      createdAt: Date.now()
    };

    const earnings = readList<AffiliateEarning>(EARNING_KEY);
    writeList(EARNING_KEY, [earning, ...earnings]);

    if (isFirebaseConfigured()) {
      try {
        await supabase.from('affiliate_earnings').insert({
          id: earning.id,
          referrer_id: earning.referrerId,
          referred_user_id: earning.referredUserId,
          promo_code_used: earning.promoCodeUsed,
          plan_type: earning.planType,
          plan_amount: earning.planAmount,
          commission_amount: earning.commissionAmount,
          status: earning.status,
          created_at: new Date(earning.createdAt).toISOString()
        });
      } catch (error) {
        console.warn('Affiliate earning Firebase sync failed:', error);
      }
    }

    return earning;
  },

  async getStats(userId: string) {
    const earnings = readList<AffiliateEarning>(EARNING_KEY).filter((item) => item.referrerId === userId);
    const withdrawals = readList<WithdrawRequest>(WITHDRAW_KEY).filter((item) => item.userId === userId);
    const approved = earnings.filter((item) => item.status === 'approved' || item.status === 'paid');
    const paidWithdrawals = withdrawals.filter((item) => item.status === 'completed').reduce((sum, item) => sum + item.amount, 0);
    const pending = earnings.filter((item) => item.status === 'pending').reduce((sum, item) => sum + item.commissionAmount, 0);
    const totalEarned = approved.reduce((sum, item) => sum + item.commissionAmount, 0);

    return {
      earnings,
      withdrawals,
      totalEarned,
      availableBalance: Math.max(0, totalEarned - paidWithdrawals),
      pending,
      totalReferrals: new Set(earnings.map((item) => item.referredUserId).filter(Boolean)).size,
      conversionRate: earnings.length ? Math.min(100, Math.round((approved.length / earnings.length) * 100)) : 0
    };
  },

  async requestWithdraw(input: {
    userId: string;
    amount: number;
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
    accountNumber: string;
  }): Promise<{ ok: boolean; message: string; request?: WithdrawRequest }> {
    const stats = await affiliateEngine.getStats(input.userId);
    if (input.amount < 100) return { ok: false, message: 'Minimum withdrawal amount is ৳100.' };
    if (input.amount > stats.availableBalance) return { ok: false, message: 'Insufficient available balance.' };
    if (!/^01\d{9}$/.test(input.accountNumber.trim())) return { ok: false, message: 'Enter a valid 11 digit Bangladesh mobile number.' };

    const request: WithdrawRequest = {
      id: crypto.randomUUID(),
      userId: input.userId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      accountNumber: input.accountNumber.trim(),
      status: 'pending',
      requestedAt: Date.now()
    };

    const withdrawals = readList<WithdrawRequest>(WITHDRAW_KEY);
    writeList(WITHDRAW_KEY, [request, ...withdrawals]);

    if (isFirebaseConfigured()) {
      try {
        await supabase.from('withdraw_requests').insert({
          id: request.id,
          user_id: request.userId,
          amount: request.amount,
          payment_method: request.paymentMethod,
          account_number: request.accountNumber,
          status: request.status,
          requested_at: new Date(request.requestedAt).toISOString()
        });
      } catch (error) {
        console.warn('Withdraw request Firebase sync failed:', error);
      }
    }

    return { ok: true, message: 'Withdraw request submitted for admin review.', request };
  },

  async adminUpdateWithdraw(id: string, status: WithdrawStatus, transactionId?: string) {
    const withdrawals = readList<WithdrawRequest>(WITHDRAW_KEY).map((item) =>
      item.id === id ? { ...item, status, transactionId, processedAt: Date.now() } : item
    );
    writeList(WITHDRAW_KEY, withdrawals);

    if (isFirebaseConfigured()) {
      try {
        await supabase
          .from('withdraw_requests')
          .update({ status, transaction_id: transactionId, processed_at: new Date().toISOString() })
          .eq('id', id);
      } catch (error) {
        console.warn('Withdraw status Firebase sync failed:', error);
      }
    }
  },

  async adminApproveEarning(id: string) {
    const earnings = readList<AffiliateEarning>(EARNING_KEY).map((item) =>
      item.id === id ? { ...item, status: 'approved' as AffiliateStatus } : item
    );
    writeList(EARNING_KEY, earnings);

    if (isFirebaseConfigured()) {
      try {
        await supabase.from('affiliate_earnings').update({ status: 'approved' }).eq('id', id);
      } catch (error) {
        console.warn('Affiliate earning approval sync failed:', error);
      }
    }
  }
};

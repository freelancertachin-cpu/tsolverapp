export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export const securityEngine = {
  rateLimit(key: string, limit = 15, windowMs = 60_000): RateLimitResult {
    const now = Date.now();
    const storeKey = `tsolver_rate_${key}`;
    const bucket = JSON.parse(localStorage.getItem(storeKey) || '{"hits":0,"resetAt":0}') as { hits: number; resetAt: number };
    if (bucket.resetAt < now) {
      const next = { hits: 1, resetAt: now + windowMs };
      localStorage.setItem(storeKey, JSON.stringify(next));
      return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
    }

    if (bucket.hits >= limit) {
      return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
    }

    const next = { hits: bucket.hits + 1, resetAt: bucket.resetAt };
    localStorage.setItem(storeKey, JSON.stringify(next));
    return { allowed: true, remaining: Math.max(0, limit - next.hits), resetAt: next.resetAt };
  },

  calculateReferralRisk(input: { sameDevice?: boolean; rapidConversions?: number; repeatedNumber?: boolean }) {
    let score = 0;
    if (input.sameDevice) score += 45;
    if ((input.rapidConversions || 0) > 3) score += 35;
    if (input.repeatedNumber) score += 25;
    return {
      score: Math.min(100, score),
      label: score >= 70 ? 'high' : score >= 35 ? 'medium' : 'low'
    } as const;
  },

  sanitizeText(value: string) {
    return value.replace(/[<>]/g, '').trim().slice(0, 4000);
  }
};

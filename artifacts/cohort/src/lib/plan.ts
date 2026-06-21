const TRIAL_DAYS = 30;
const TRIAL_START_KEY = "cohort:trialStart";

export interface TrialInfo {
  planName: string;
  daysRemaining: number;
  totalDays: number;
  progress: number;
}

export function getTrialInfo(): TrialInfo {
  let start = Date.now();
  try {
    const stored = window.localStorage.getItem(TRIAL_START_KEY);
    if (stored && Number.isFinite(Number(stored))) {
      start = Number(stored);
    } else {
      window.localStorage.setItem(TRIAL_START_KEY, String(start));
    }
  } catch {
    /* ignore storage errors */
  }

  const elapsedDays = Math.floor((Date.now() - start) / 86_400_000);
  const daysRemaining = Math.max(0, TRIAL_DAYS - elapsedDays);
  const progress = Math.min(1, Math.max(0, elapsedDays / TRIAL_DAYS));

  return {
    planName: "Trial · Crescimento",
    daysRemaining,
    totalDays: TRIAL_DAYS,
    progress,
  };
}

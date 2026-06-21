const ONBOARDING_PREFIX = "cohort:onboarding:";

export function isOnboardingComplete(userId?: string | null): boolean {
  if (!userId) return true;
  try {
    return window.localStorage.getItem(ONBOARDING_PREFIX + userId) === "done";
  } catch {
    return true;
  }
}

export function completeOnboarding(userId?: string | null): void {
  if (!userId) return;
  try {
    window.localStorage.setItem(ONBOARDING_PREFIX + userId, "done");
  } catch {
    /* ignore storage errors */
  }
}

import type { Profile } from '../database/types';

export interface OnboardingAnswers {
  householdSize: string;
  cookingFrequency: string;
  shoppingFrequency: string;
}

interface OnboardingPersistence {
  saveProfile: (profile: Profile) => void | Promise<void>;
  markCompleted: () => Promise<void>;
}

export async function readOnboardingCompletion(
  readFlag: () => Promise<string | null>,
): Promise<boolean> {
  const value = await readFlag();
  if (value === 'true') return true;
  if (value === null || value === 'false') return false;
  throw new Error('Unrecognized onboarding completion flag');
}

export function hasAllAnswers(answers: OnboardingAnswers): boolean {
  return !!(
    answers.householdSize.trim() &&
    answers.cookingFrequency.trim() &&
    answers.shoppingFrequency.trim()
  );
}

// A saved profile alone is not completion. A failed completion-flag write must
// reach the caller so the screen can retain the answers and offer a retry.
export async function persistOnboardingAnswers(
  answers: OnboardingAnswers,
  persistence: OnboardingPersistence,
): Promise<boolean> {
  if (!hasAllAnswers(answers)) return false;

  await persistence.saveProfile({
    household_size: answers.householdSize,
    cooking_frequency: answers.cookingFrequency,
    shopping_frequency: answers.shoppingFrequency,
  });
  await persistence.markCompleted();
  return true;
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { persistOnboardingAnswers, readOnboardingCompletion } from '../services/onboardingPersistence.ts';

const answers = {
  householdSize: '1人',
  cookingFrequency: '週3回',
  shoppingFrequency: '週2回',
};

test('any missing or blank answer leaves both stores untouched', async () => {
  for (const key of Object.keys(answers)) {
    for (const value of ['', '  ']) {
      const result = await persistOnboardingAnswers({ ...answers, [key]: value }, {
        saveProfile: () => assert.fail('Incomplete answers must not be saved'),
        markCompleted: () => assert.fail('Incomplete answers must not be completed'),
      });
      assert.equal(result, false);
    }
  }
});

test('a profile write failure never marks onboarding completed', async () => {
  const failure = new Error('database unavailable');
  await assert.rejects(persistOnboardingAnswers(answers, {
    saveProfile: () => { throw failure; },
    markCompleted: () => assert.fail('Profile was not saved'),
  }), (error) => error === failure);
});

test('a completion flag failure is reported, and retry reuses the unchanged answers', async () => {
  const savedProfiles = [];
  let attempts = 0;
  let completed = false;
  const persistence = {
    saveProfile: (profile) => { savedProfiles.push(profile); },
    markCompleted: async () => {
      if (++attempts === 1) throw new Error('storage unavailable');
      completed = true;
    },
  };
  await assert.rejects(persistOnboardingAnswers(answers, persistence), /storage unavailable/);
  assert.equal(completed, false);
  assert.equal(savedProfiles.length, 1);
  assert.equal(await persistOnboardingAnswers(answers, persistence), true);
  assert.equal(completed, true);
  assert.equal(savedProfiles.length, 2);
  assert.deepEqual(savedProfiles[1], savedProfiles[0]);
  assert.deepEqual(savedProfiles[0], {
    household_size: '1人', cooking_frequency: '週3回', shopping_frequency: '週2回',
  });
  assert.deepEqual(answers, {
    householdSize: '1人', cookingFrequency: '週3回', shoppingFrequency: '週2回',
  });
});

test('new and existing supported flags retain their meaning', async () => {
  assert.equal(await readOnboardingCompletion(async () => null), false);
  assert.equal(await readOnboardingCompletion(async () => 'false'), false);
  assert.equal(await readOnboardingCompletion(async () => 'true'), true);
});

test('unknown old data is not silently treated as a new user', async () => {
  for (const value of ['', 'unexpected', 'TRUE']) {
    await assert.rejects(readOnboardingCompletion(async () => value), /Unrecognized/);
  }
});

test('a read failure stays unknown, and a later successful retry can recover', async () => {
  await assert.rejects(readOnboardingCompletion(async () => {
    throw new Error('read unavailable');
  }), /read unavailable/);
  assert.equal(await readOnboardingCompletion(async () => 'true'), true);
});

test('completion stays pending until the asynchronous profile write finishes', async () => {
  let finishProfile;
  let completed = false;
  const saving = persistOnboardingAnswers(answers, {
    saveProfile: () => new Promise((resolve) => { finishProfile = resolve; }),
    markCompleted: async () => { completed = true; },
  });
  assert.equal(completed, false);
  finishProfile();
  assert.equal(await saving, true);
  assert.equal(completed, true);
});

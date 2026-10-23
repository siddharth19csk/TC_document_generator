import { describe, it, expect, vi, beforeEach } from 'vitest';

// ——— Input Validator Tests ———
describe('validateFormInput', () => {
  let validateFormInput;

  beforeEach(async () => {
    const mod = await import('./validators/inputValidator.js');
    validateFormInput = mod.validateFormInput;
  });

  it('accepts valid complete input', () => {
    const result = validateFormInput({
      reportCode: 'R117',
      ticketNumber: 'CHG0057554',
      projectModule: 'Auth Module',
      preparedBy: 'John',
      updates: 'Users should be able to log in with email and password.',
      additionalContext: 'SSO not required.',
    });
    expect(result.success).toBe(true);
    expect(result.data.reportCode).toBe('R117');
  });

  it('rejects missing reportCode', () => {
    const result = validateFormInput({
      reportCode: '',
      ticketNumber: 'CHG0057554',
      projectModule: 'Auth Module',
      updates: 'Some updates here that are long enough.',
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.field === 'reportCode')).toBe(true);
  });

  it('rejects missing ticketNumber', () => {
    const result = validateFormInput({
      reportCode: 'R117',
      ticketNumber: '',
      projectModule: 'Auth Module',
      updates: 'Some updates here that are long enough.',
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.field === 'ticketNumber')).toBe(true);
  });

  it('rejects updates shorter than 10 characters', () => {
    const result = validateFormInput({
      reportCode: 'R117',
      ticketNumber: 'CHG123',
      projectModule: 'Auth',
      updates: 'Short',
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.field === 'updates')).toBe(true);
  });

  it('accepts missing optional fields', () => {
    const result = validateFormInput({
      reportCode: 'R117',
      ticketNumber: 'CHG0057554',
      projectModule: 'Module',
      updates: 'Users should be able to log in with email and password authentication.',
    });
    expect(result.success).toBe(true);
  });
});

// ——— AI Response Validator Tests ———
describe('validateAiResponse', () => {
  let validateAiResponse;

  beforeEach(async () => {
    const mod = await import('./validators/aiResponseValidator.js');
    validateAiResponse = mod.validateAiResponse;
  });

  const validResponse = {
    objective: 'Verify user authentication flows.',
    scopeAndAssumptions: 'In scope: login, logout. Assumption: email is valid.',
    testCases: [
      {
        tcId: 'TC-001',
        scenario: 'Valid login',
        preconditions: 'User is registered.',
        steps: '1. Navigate to login\n2. Enter credentials\n3. Click submit',
        testData: 'Email: test@example.com, Password: Pass@123',
        expectedResult: 'User is redirected to dashboard.',
        priority: 'High',
      },
    ],
    executionNotes: 'Run on staging environment.',
  };

  it('validates a correct AI response', () => {
    const result = validateAiResponse(validResponse);
    expect(result.success).toBe(true);
  });

  it('rejects response with empty testCases array', () => {
    const result = validateAiResponse({ ...validResponse, testCases: [] });
    expect(result.success).toBe(false);
  });

  it('rejects response missing objective', () => {
    const { objective, ...rest } = validResponse;
    const result = validateAiResponse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority value', () => {
    const bad = {
      ...validResponse,
      testCases: [{ ...validResponse.testCases[0], priority: 'Critical' }],
    };
    const result = validateAiResponse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects null/undefined response', () => {
    expect(validateAiResponse(null).success).toBe(false);
    expect(validateAiResponse(undefined).success).toBe(false);
  });
});

// ——— AI Service Tests (mocked) ———
describe('generateTestcases (mocked)', () => {
  it('throws when GEMINI_API_KEY is missing', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const { generateTestcases } = await import('./services/aiService.js');

    await expect(generateTestcases({
      reportCode: 'R1',
      ticketNumber: 'T1',
      projectModule: 'M1',
      updates: 'Some feature update description for testing.',
    })).rejects.toThrow('GEMINI_API_KEY is not set');

    process.env.GEMINI_API_KEY = originalKey;
  });
});

import { z } from 'zod';

const ChecklistItemSchema = z.object({
  sno: z.union([z.string(), z.number()]).optional(),
  parameter: z.string().min(1, 'Parameter description is required'),
  yes_mark: z.string().optional(),
  no_mark: z.string().optional(),
  na_mark: z.string().optional(),
});

const ModuleSchema = z.object({
  module_number: z.union([z.string(), z.number()]).optional(),
  module_name: z.string().min(1, 'Module name is required'),
  category_label: z.string().optional(),
  checklist: z.array(ChecklistItemSchema).min(1, 'Each module must have at least one checklist item'),
});

const TestCaseSchema = z.object({
  tcId: z.string().min(1),
  scenario: z.string().min(1),
  preconditions: z.string().optional().default(''),
  steps: z.union([z.string(), z.array(z.string())]).optional().default(''),
  testData: z.union([z.string(), z.array(z.string())]).optional().default(''),
  expectedResult: z.string().min(1),
  priority: z.enum(['High', 'Medium', 'Low']),
});

const TestCaseResponseSchema = z.object({
  objective: z.string().min(1),
  scopeAndAssumptions: z.string().optional().default(''),
  testCases: z.array(TestCaseSchema).min(1, 'AI must generate at least one test case'),
  executionNotes: z.string().optional().default(''),
});

const ModuleResponseSchema = z.object({
  docTitle: z.string().optional(),
  projectName: z.string().optional(),
  modules: z.array(ModuleSchema).min(1, 'AI must generate at least one module'),
  objective: z.string().optional(),
  executionNotes: z.string().optional(),
});

export function validateAiResponse(data) {
  if (!data || typeof data !== 'object') {
    return { success: false, errors: [{ field: 'root', message: 'Response is null or not an object' }] };
  }

  // If it has modules, parse as Module schema
  if (Array.isArray(data.modules)) {
    const res = ModuleResponseSchema.safeParse(data);
    if (res.success) return { success: true, data: res.data };
    return {
      success: false,
      errors: res.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    };
  }

  // Otherwise parse as TestCase schema
  const res = TestCaseResponseSchema.safeParse(data);
  if (res.success) return { success: true, data: res.data };
  return {
    success: false,
    errors: res.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
  };
}

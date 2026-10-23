import { z } from 'zod';

const FormSchema = z.object({
  reportCode: z.string().min(1, 'Report Code is required').max(100),
  ticketNumber: z.string().min(1, 'Ticket Number is required').max(100),
  certifiedBy: z.string().max(200).optional().default(''),
  preparedBy: z.string().max(200).optional().default(''),
  projectModule: z.string().max(200).optional().default(''),
  updates: z.string().min(10, 'Daily Raw Details must be at least 10 characters').max(50000),
  additionalContext: z.string().max(10000).optional().default(''),
  docTitle: z.string().max(200).optional().default(''),
  status: z.string().max(50).optional().default('Approved'),
}).transform((data) => ({
  ...data,
  certifiedBy: data.certifiedBy || data.preparedBy || 'QA Reviewer',
  preparedBy: data.certifiedBy || data.preparedBy || 'QA Reviewer',
  projectModule: data.projectModule || data.reportCode || 'Cube View',
}));

export function validateFormInput(body) {
  const result = FormSchema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return { success: false, errors };
}

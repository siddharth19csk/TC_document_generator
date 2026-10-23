import { Router } from 'express';
import { generateTestcases } from '../services/aiService.js';
import { generateDocument } from '../services/documentService.js';
import { validateFormInput } from '../validators/inputValidator.js';

export const generateRouter = Router();

generateRouter.post('/generate-testcases', async (req, res) => {
  try {
    // 1. Validate form input
    const validationResult = validateFormInput(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.errors,
      });
    }

    const formData = validationResult.data;

    // 2. Call Gemini AI (exact n8n prompt + enrichment logic)
    let aiResult;
    try {
      aiResult = await generateTestcases(formData);
    } catch (aiError) {
      console.error('[AI Error]', aiError.message);
      return res.status(502).json({
        error: 'AI generation failed: ' + aiError.message,
        retryable: true,
      });
    }

    // 3. Verify we got a tc_cube_view back
    if (!aiResult || !aiResult.tc_cube_view) {
      console.error('[AI Response] Missing tc_cube_view:', JSON.stringify(aiResult).slice(0, 500));
      return res.status(502).json({
        error: 'AI returned an invalid or incomplete response. Please retry.',
        retryable: true,
      });
    }

    console.log('[AI] ticket_type:', aiResult.ticket_type, '| subtype:', aiResult.cube_view_subtype,
      '| modules:', aiResult.tc_cube_view?.modules?.length);

    // 4. Generate Word documents
    let tcBuffer, tcFileName;
    try {
      const result = await generateDocument(formData, aiResult);
      tcBuffer = result.tcBuffer;
      tcFileName = result.tcFileName;
      // RC is generated but we only return TC per user requirement
    } catch (docError) {
      console.error('[Document Error]', docError.message);
      return res.status(500).json({
        error: 'Document generation failed: ' + docError.message,
      });
    }

    // 5. Return ONLY the Testcase Document (.docx)
    // Filename format matches n8n exactly: R117-PWRJOB_RPT_15_16-Testcase Document.docx
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${tcFileName}"`);
    res.setHeader('X-Document-Filename', tcFileName);
    res.send(tcBuffer);

  } catch (err) {
    console.error('[Unhandled Error]', err.message, err.stack);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

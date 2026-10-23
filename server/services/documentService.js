import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Template resolver — TC Cube View template
function resolveTCTemplate() {
  const candidates = [
    path.resolve(__dirname, '../../templates/TC_CUBEVIEW_TEMPLATE_TAGGED.docx'),
    path.resolve(__dirname, '../templates/TC_CUBEVIEW_TEMPLATE_TAGGED.docx'),
    path.resolve(process.cwd(), 'templates/TC_CUBEVIEW_TEMPLATE_TAGGED.docx'),
    path.resolve(process.cwd(), '../templates/TC_CUBEVIEW_TEMPLATE_TAGGED.docx'),
    'C:/Users/siddharth.chandran/Downloads/TC_CUBEVIEW_TEMPLATE_TAGGED (4).docx',
    'C:/Users/siddharth.chandran/OneDrive - Quanta Services Management Partnership, L.P/Documents/Automation/TC_CUBEVIEW_TEMPLATE_TAGGED (4).docx',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('TC template not found. Ensure TC_CUBEVIEW_TEMPLATE_TAGGED.docx is in the templates/ folder.');
}

// Template resolver — Release Certificate template
function resolveRCTemplate() {
  const candidates = [
    path.resolve(__dirname, '../../templates/RC_TEMPLATE_TAGGED.docx'),
    path.resolve(__dirname, '../templates/RC_TEMPLATE_TAGGED.docx'),
    path.resolve(process.cwd(), 'templates/RC_TEMPLATE_TAGGED.docx'),
    path.resolve(process.cwd(), '../templates/RC_TEMPLATE_TAGGED.docx'),
    'C:/Users/siddharth.chandran/Downloads/RC_TEMPLATE_TAGGED.docx',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null; // RC is optional — TC-only mode if not found
}

function renderDocx(templatePath, data) {
  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
    errorLogging: false,
  });
  doc.render(data);
  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

/**
 * generateDocument
 *
 * Returns { tcBuffer, tcFileName, rcBuffer, rcFileName }
 * rcBuffer may be null if RC template is not available.
 *
 * Filename format mirrors n8n exactly:
 *   TC: <reportCode>-<report_name>-Testcase Document.docx
 *   RC: <reportCode>-<report_name>-Release Certificate.docx
 */
export async function generateDocument(formData, aiData) {
  const reportCode = (formData.reportCode || 'RXXX').trim();
  const reportName = (aiData.rc && aiData.rc.report_name)
    || (aiData.tc_cube_view && aiData.tc_cube_view.modules && aiData.tc_cube_view.modules[0]
        ? aiData.tc_cube_view.modules[0].module_name
        : formData.reportCode || 'Report');

  // ── Testcase Document ──────────────────────────────────────────────────────
  const tcTemplatePath = resolveTCTemplate();
  const tcData = aiData.tc_cube_view || {};

  // Ensure module_number is present (template may need it)
  if (Array.isArray(tcData.modules)) {
    tcData.modules = tcData.modules.map((m, i) => ({
      ...m,
      module_number: m.module_number || String(i + 1),
    }));
  }

  const tcBuffer = renderDocx(tcTemplatePath, tcData);
  const tcFileName = `${reportCode}-${reportName}-Testcase Document.docx`;

  // ── Release Certificate ────────────────────────────────────────────────────
  let rcBuffer = null;
  let rcFileName = null;
  const rcTemplatePath = resolveRCTemplate();

  if (rcTemplatePath && aiData.rc) {
    try {
      rcBuffer = renderDocx(rcTemplatePath, aiData.rc);
      rcFileName = `${reportCode}-${reportName}-Release Certificate.docx`;
    } catch (e) {
      console.warn('[documentService] RC render failed (non-fatal):', e.message);
    }
  }

  return { tcBuffer, tcFileName, rcBuffer, rcFileName };
}

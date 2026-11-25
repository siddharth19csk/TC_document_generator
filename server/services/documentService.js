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

// Template resolver — TC Dashboard template
function resolveDashboardTemplate() {
  const candidates = [
    path.resolve(__dirname, '../../templates/TC_DASHBOARD_TEMPLATE_TAGGED.docx'),
    path.resolve(__dirname, '../templates/TC_DASHBOARD_TEMPLATE_TAGGED.docx'),
    path.resolve(process.cwd(), 'templates/TC_DASHBOARD_TEMPLATE_TAGGED.docx'),
    path.resolve(process.cwd(), '../templates/TC_DASHBOARD_TEMPLATE_TAGGED.docx'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null; // Fall back to cube view template if not found
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

const SEVERITY_RULES = {
  BOOK: {
    1: 'High',
    2: 'Medium',
    3: 'High',
    4: 'Critical',
    5: 'High',
    6: 'High',
    7: 'Medium',
    8: 'High',
    9: 'High',
  },
  PARAMETER_CHANGE: {
    1: 'High',
    2: 'High',
    3: 'High',
    4: 'Critical',
  },
  CUBE_VIEW: {
    1: 'High',
    2: 'Medium',
    3: 'High',
    4: 'High',
    5: 'High',
    6: 'Medium',
    7: 'High',
    8: 'Medium',
    9: 'High',
  },
  DASHBOARD: {
    1: 'Critical',
    2: 'Medium',
    3: 'High',
    4: 'High',
    5: 'High',
    6: 'High',
    7: 'Medium',
    8: 'High',
    9: 'High',
    10: 'Medium',
    11: 'High',
    12: 'Medium',
  },
};

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

  // Post-process XML for Severity cell shading & text color
  let docXml = doc.getZip().file('word/document.xml').asText();
  if (docXml.includes('SEV_SHD_PLACEHOLDER')) {
    const tcRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
    docXml = docXml.replace(tcRegex, (match) => {
      if (!match.includes('SEV_SHD_PLACEHOLDER')) return match;
      if (/Critical/i.test(match)) {
        return match
          .replace(/SEV_SHD_PLACEHOLDER/g, 'FFC7CE') // Light Red
          .replace(/SEV_COLOR_PLACEHOLDER/g, '000000'); // Black text
      } else if (/High/i.test(match)) {
        return match
          .replace(/SEV_SHD_PLACEHOLDER/g, 'FFC7CE') // Light Red
          .replace(/SEV_COLOR_PLACEHOLDER/g, '000000'); // Black text
      } else if (/Medium/i.test(match)) {
        return match
          .replace(/SEV_SHD_PLACEHOLDER/g, 'F8EE7E') // Light Yellow (matching user's image)
          .replace(/SEV_COLOR_PLACEHOLDER/g, '000000'); // Black text
      } else if (/Low/i.test(match)) {
        return match
          .replace(/SEV_SHD_PLACEHOLDER/g, 'C6EFCE') // Light Green
          .replace(/SEV_COLOR_PLACEHOLDER/g, '000000'); // Black text
      } else {
        return match
          .replace(/SEV_SHD_PLACEHOLDER/g, 'FFFFFF')
          .replace(/SEV_COLOR_PLACEHOLDER/g, '000000');
      }
    });
    doc.getZip().file('word/document.xml', docXml);
  }

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
  const ticketType = aiData.ticket_type || 'CUBE_VIEW';

  // Choose template based on ticket type
  let tcTemplatePath;
  if (ticketType === 'DASHBOARD') {
    tcTemplatePath = resolveDashboardTemplate() || resolveTCTemplate();
  } else {
    tcTemplatePath = resolveTCTemplate();
  }

  const tcData = aiData.tc_cube_view || {};

  // Ensure summary table labels and counts are NEVER empty
  const typeTotalLabels = { BOOK: 'Total Books', PARAMETER_CHANGE: 'Total Parameters', CUBE_VIEW: 'Total Reports', DASHBOARD: 'Total Dashboards' };
  const typePerLabels = { BOOK: 'Testcases per Book', PARAMETER_CHANGE: 'Testcases per Parameter', CUBE_VIEW: 'Testcases per Report', DASHBOARD: 'Testcases per dashboard' };

  tcData.total_label = tcData.total_label || typeTotalLabels[ticketType] || 'Total Reports';
  tcData.tc_per_label = tcData.tc_per_label || typePerLabels[ticketType] || 'Testcases per Report';

  const modCount = Array.isArray(tcData.modules) ? tcData.modules.length : 0;
  const firstModChecklistCount = (modCount > 0 && Array.isArray(tcData.modules[0].checklist))
    ? tcData.modules[0].checklist.length
    : 0;

  const perReport = Number(tcData.tc_per_report) || firstModChecklistCount || (ticketType === 'CUBE_VIEW' ? 9 : 8);
  const totalReports = Number(tcData.total_reports) || (modCount > 0 ? modCount : 2);
  const totalTestcase = Number(tcData.total_testcase) || (totalReports * perReport);

  tcData.total_reports = totalReports;
  tcData.tc_per_report = perReport;
  tcData.total_testcase = totalTestcase;

  // Ensure module_number and severity are present (template needs both)
  if (Array.isArray(tcData.modules)) {
    const ruleMap = SEVERITY_RULES[ticketType] || SEVERITY_RULES.CUBE_VIEW;
    tcData.modules = tcData.modules.map((m, i) => {
      const checklist = Array.isArray(m.checklist)
        ? m.checklist.map((item, idx) => {
            const snoNum = Number(item.sno) || (idx + 1);
            let sev = item.severity || ruleMap[snoNum] || 'High';
            if (/cric?tical/i.test(sev)) sev = 'Critical';
            else if (/high/i.test(sev)) sev = 'High';
            else if (/med/i.test(sev)) sev = 'Medium';
            else if (/low/i.test(sev)) sev = 'Low';
            return {
              ...item,
              severity: sev,
            };
          })
        : [];
      return {
        ...m,
        module_number: m.module_number || String(i + 1),
        checklist,
      };
    });
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

// build_readme_docx.js
// Generates documentation/README.docx matching the style of:
//   "readme template/Process Flow & Technical Document - PRMARKDELETE_AUTOMATION 1.docx"
// Template style: Aptos font, Heading1=48pt bold, Heading2=36pt bold, Heading3 bold,
//                 Consolas for code, spacing before/after on headings

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, ShadingType, HeadingLevel,
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'documentation', 'README.docx');

// ── Style constants (matching template) ──────────────────────────────────────
const FONT      = 'Aptos';
const FONT_CODE = 'Consolas';
const BRAND     = '1F4E79'; // dark navy blue (matches Aptos doc heading colour)
const ACCENT    = '2E74B5'; // h2 blue

// ── Helper functions ─────────────────────────────────────────────────────────

/** Heading 1 — size 48 (24pt), bold, Aptos, navy */
function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 48, font: FONT, color: BRAND })],
    spacing: { before: 322, after: 322 },
  });
}

/** Title line — same as H1 but extra large */
function title(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 48, font: FONT, color: BRAND })],
    spacing: { before: 322, after: 322 },
  });
}

/** Title code part (Consolas bold) */
function titleCode(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 48, font: FONT_CODE })],
    spacing: { before: 0, after: 160 },
  });
}

/** Heading 2 — size 36 (18pt), bold */
function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 36, font: FONT, color: ACCENT })],
    spacing: { before: 299, after: 299 },
  });
}

/** Heading 3 — size 28, bold */
function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, font: FONT, color: ACCENT })],
    spacing: { before: 281, after: 281 },
  });
}

/** Heading 4 — size 24, bold */
function h4(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: FONT })],
    spacing: { before: 240, after: 120 },
  });
}

/** Normal body paragraph */
function body(text, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24, font: FONT, bold })],
    spacing: { before: 120, after: 120 },
  });
}

/** Mixed body: label bold + rest normal */
function bodyMixed(label, rest) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, size: 24, font: FONT, bold: true }),
      new TextRun({ text: rest, size: 24, font: FONT }),
    ],
    spacing: { before: 100, after: 100 },
  });
}

/** Bullet point */
function bullet(text, boldLabel = '') {
  const children = boldLabel
    ? [
        new TextRun({ text: boldLabel, bold: true, size: 24, font: FONT }),
        new TextRun({ text, size: 24, font: FONT }),
      ]
    : [new TextRun({ text, size: 24, font: FONT })];
  return new Paragraph({ children, bullet: { level: 0 }, spacing: { before: 60, after: 60 } });
}

/** Numbered list item */
function numbered(text, boldLabel = '') {
  const children = boldLabel
    ? [
        new TextRun({ text: boldLabel, bold: true, size: 24, font: FONT }),
        new TextRun({ text, size: 24, font: FONT }),
      ]
    : [new TextRun({ text, size: 24, font: FONT })];
  return new Paragraph({
    children,
    numbering: { reference: 'default-num', level: 0 },
    spacing: { before: 60, after: 60 },
  });
}

/** Code line — Consolas, gray bg */
function codeLine(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font: FONT_CODE })],
    shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
    spacing: { before: 0, after: 0 },
    indent: { left: 360 },
  });
}

function blank() {
  return new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 60, after: 60 } });
}

// ── Table helpers ──────────────────────────────────────────────────────────
function makeTable(headers, rows) {
  const colW = Math.floor(9360 / headers.length);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: BRAND },
      width: { size: colW, type: WidthType.DXA },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22, font: FONT })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
      })],
    })),
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map(cell => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? 'FFFFFF' : 'EEF4FB' },
      children: [new Paragraph({
        children: [new TextRun({ text: cell, size: 22, font: FONT })],
        spacing: { before: 60, after: 60 },
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════════════════
const children = [];

// ── TITLE BLOCK ────────────────────────────────────────────────────────────
children.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'Process Flow & Technical Document — ', bold: true, size: 48, font: FONT, color: BRAND }),
      new TextRun({ text: 'TC_DOCUMENT_GENERATOR', bold: true, size: 48, font: FONT_CODE }),
    ],
    spacing: { before: 322, after: 160 },
  }),
  bodyMixed('Purpose: ', 'Converts raw OneStream ticket activity notes into standardized corporate-ready Microsoft Word (.docx) testcase review documents, using AI-driven classification and dynamic Word template routing.'),
  blank()
);

// ── SECTION 1: Overview ───────────────────────────────────────────────────
children.push(h4('Overview'));
children.push(body('The Testcase Document Generator accepts raw ServiceNow change/incident notes and automatically:'));
children.push(bullet('Classifies the ticket type (Cube View, Flash Report, Parameter, Book, or Dashboard).'));
children.push(bullet('Selects and populates the matching corporate Word template.'));
children.push(bullet('Returns a ready-to-download .docx file named <ReportCode>-<ReportName>-Testcase Document.docx.'));
children.push(blank());

children.push(h4('Process Steps and Functions'));
children.push(numbered('User fills the web form: Testcase Raw Details, Report Code, Developer Name, Ticket Number, and document type tab.'));
children.push(numbered('Client calls POST /api/generate-testcases with JSON body.'));
children.push(numbered('Server validates all required fields via inputValidator.js (Zod).'));
children.push(numbered('aiService.js sends a structured prompt to Gemini; response JSON contains report details and checklist answers.'));
children.push(numbered('aiResponseValidator.js validates the AI JSON structure.'));
children.push(numbered('documentService.js routes to the correct Word template, injects variables, expands checklist loops.'));
children.push(numbered('Server streams the finished .docx binary with Content-Disposition: attachment.'));
children.push(numbered('Browser triggers an automatic file download.'));
children.push(blank());

// ── SECTION 2: Technical Details ──────────────────────────────────────────
children.push(h1('2 — Technical Details'));

children.push(h2('Components Used'));
children.push(makeTable(
  ['Component', 'Technology', 'Purpose'],
  [
    ['Frontend',        'React + Vite',          'Web UI form, progress states, file download'],
    ['Backend',         'Node.js + Express',      'REST API, file serving, middleware'],
    ['AI Engine',       'Google Gemini API',      'Ticket classification and testcase generation'],
    ['Template Engine', 'Docxtemplater',          'Word template variable injection & loop expansion'],
    ['Validation',      'Zod',                    'Input and AI-response schema validation'],
    ['Styling',         'CSS (OneStream Design)', 'Corporate brand colours and responsive layout'],
  ]
));
children.push(blank());

children.push(h2('Folder Structure'));
const tree = [
  'daily-document-generator/',
  '├── client/                     # React + Vite Frontend',
  '│   ├── public/',
  '│   └── src/',
  '│       ├── services/apiService.js   # Axios HTTP client',
  '│       ├── App.jsx                  # Main component & Help modal',
  '│       ├── index.css                # Corporate design system',
  '│       └── main.jsx                 # App entry point',
  '├── server/                     # Express Backend',
  '│   ├── routes/generate.js          # POST /api/generate-testcases',
  '│   ├── routes/health.js            # GET /api/health',
  '│   ├── services/aiService.js       # Gemini integration & fallbacks',
  '│   ├── services/documentService.js # Template routing & rendering',
  '│   ├── validators/                 # Zod validators (input, AI, config)',
  '│   └── index.js                    # Express entry point',
  '├── templates/                  # Tagged Word templates (.docx)',
  '├── documentation/              # Project documentation files',
  '└── README.md                   # This document',
];
tree.forEach(l => children.push(codeLine(l)));
children.push(blank());

children.push(h2('File Purpose Reference'));

children.push(h3('Root Files'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['package.json', 'Root orchestrator scripts (install:all, dev, build, start)'],
    ['README.md',    'Full project documentation and developer guide'],
    ['run.bat',      'Windows batch shortcut to start local dev environment'],
    ['run.ps1',      'PowerShell shortcut for local development startup'],
  ]
));
children.push(blank());

children.push(h3('Client Files (client/src/)'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['App.jsx',              'Main React component: form UI, progress, download, Help modal'],
    ['index.css',            'OneStream corporate design system — colours, fonts, animations'],
    ['main.jsx',             'Vite React application entry point'],
    ['services/apiService.js', 'Axios HTTP client for POST /api/generate-testcases'],
  ]
));
children.push(blank());

children.push(h3('Server Files (server/)'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['index.js',                    'Express entry point: routes, static serving, PDF/DOCX endpoints'],
    ['routes/generate.js',          'POST route: validates, calls AI, streams .docx'],
    ['routes/health.js',            'GET /api/health: server + Gemini status'],
    ['services/aiService.js',       'Gemini integration: classification prompt, multi-model fallback chain'],
    ['services/documentService.js', 'Docxtemplater rendering: template resolver, injection, loop expansion'],
    ['validators/aiResponseValidator.js', 'Zod schema validating AI JSON output'],
    ['validators/configValidator.js',     'Validates env vars at startup'],
    ['validators/inputValidator.js',      'Validates user form fields'],
    ['build_help_guide_docx.js',    'Generates Help_Document.docx'],
    ['build_help_guide_pdf.js',     'Generates User_Help_Guide.pdf'],
  ]
));
children.push(blank());

children.push(h3('Templates (templates/)'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['TC_CUBEVIEW_TEMPLATE_TAGGED.docx',  'Template for Cube View, Flash Report, Parameter, Book testcases'],
    ['TC_DASHBOARD_TEMPLATE_TAGGED.docx', 'Template for Dashboard testcases (12-item checklist)'],
  ]
));
children.push(blank());

// ── SECTION 3: AI Classification & Fallback Architecture ──────────────────
children.push(h1('3 — AI Classification & Fallback Architecture'));

children.push(h2('Fallback Chain'));
children.push(body('To guarantee 99.9% availability during Google Cloud demand spikes, aiService.js implements a multi-model fallback chain:'));
children.push(blank());
children.push(numbered('Try: gemini-2.5-flash (primary model)'));
children.push(numbered('503 / timeout → Wait 1.5 s, retry same model'));
children.push(numbered('Still failing → Fallback: gemini-flash-latest'));
children.push(numbered('Still failing → Fallback: gemini-2.5-flash-lite'));
children.push(numbered('Still failing → Fallback: gemini-2.5-pro'));
children.push(numbered('All fail → Show clear user alert with retry prompt'));
children.push(blank());

children.push(h2('Classification Logic'));
children.push(body('The AI prompt instructs Gemini to output a structured JSON object containing:'));
children.push(bullet('Ticket type: CUBE_VIEW | FLASH_REPORT | PARAMETER_CHANGE | BOOK | DASHBOARD'));
children.push(bullet('Report code and report name'));
children.push(bullet('All checklist question answers (yes/no/na per item)'));
children.push(bullet('Summary counts (total_reports, tc_per_report, total_testcase)'));
children.push(blank());

// ── SECTION 4: Use Cases ──────────────────────────────────────────────────
children.push(h1('4 — Use Cases'));

// 4.1
children.push(h1('4.1 Use Case: Cube View / Flash Report'));
children.push(blank());

children.push(h3('Purpose of the Case'));
children.push(body('Handles tickets that describe changes to Cube View reports, Flash reports, or new report builds. Generates an 8-item testcase checklist document.'));
children.push(blank());

children.push(h3('Keywords that trigger this Case'));
children.push(bullet('Cube View, CubeView, flash report, RPT_, R1xx, PWRJOB_RPT'));
children.push(bullet('Ticket description mentions row/column changes, margins, formatting'));
children.push(blank());

children.push(h3('Fields Required in SNOW Description'));
children.push(codeLine('Ticket: <CHG/INC number>'));
children.push(codeLine('Requirement: <one-line description>'));
children.push(codeLine('Changes Implemented: <numbered list of changes>'));
children.push(blank());

children.push(h3('Automation Behavior'));
children.push(bullet('Routes to TC_CUBEVIEW_TEMPLATE_TAGGED.docx'));
children.push(bullet('Populates 8-item Cube View checklist'));
children.push(bullet('Sets doc_title = "ONESTREAM CUBE VIEW TASK REVIEW CHECKLIST"'));
children.push(blank());

// 4.2
children.push(h1('4.2 Use Case: Dashboard'));
children.push(blank());

children.push(h3('Purpose of the Case'));
children.push(body('Handles tickets related to OneStream Dashboards (workflow group dashboards, planning dashboards, reporting dashboards). Generates a 12-item checklist document.'));
children.push(blank());

children.push(h3('Keywords that trigger this Case'));
children.push(bullet('Dashboard, RptgGrp_, workflow group, planning dashboard'));
children.push(bullet('Ticket description mentions dashboard components or layout'));
children.push(blank());

children.push(h3('Fields Required in SNOW Description'));
children.push(codeLine('Ticket: <CHG/INC number>'));
children.push(codeLine('Requirement: <one-line description>'));
children.push(codeLine('Changes Implemented: <numbered list of changes>'));
children.push(blank());

children.push(h3('Dashboard Automation Behavior'));
children.push(bullet('Routes to TC_DASHBOARD_TEMPLATE_TAGGED.docx'));
children.push(bullet('Populates 12-item Dashboard checklist'));
children.push(bullet('Sets doc_title = "ONESTREAM DASHBOARD TASK REVIEW CHECKLIST"'));
children.push(blank());

// 4.3
children.push(h1('4.3 Use Case: Parameter / Book'));
children.push(blank());

children.push(h3('Purpose of the Case'));
children.push(body('Handles tickets for workflow parameter changes or .xlBook file updates. Routes to the Cube View template with appropriate checklist mapping.'));
children.push(blank());

children.push(h3('Keywords that trigger this Case'));
children.push(bullet('Parameter, param, .xlBook, book directory'));
children.push(blank());

children.push(h3('Parameter / Book Automation Behavior'));
children.push(bullet('Routes to TC_CUBEVIEW_TEMPLATE_TAGGED.docx'));
children.push(bullet('Type set to PARAMETER_CHANGE or BOOK respectively'));
children.push(blank());

// ── SECTION 5: Word Template System ───────────────────────────────────────
children.push(h1('5 — Word Template System'));

children.push(h2('Template Variable Reference'));
children.push(body('Templates use docxtemplater delimiter syntax: {variable} for single values, {#loop}...{/loop} for repeated rows.'));
children.push(blank());

children.push(h3('Summary Table Variables'));
children.push(makeTable(
  ['Placeholder', 'Description', 'Example Value'],
  [
    ['{doc_title}',      'Document header',                'ONESTREAM DASHBOARD TASK REVIEW CHECKLIST'],
    ['{project_name}',   'Project name',                   'Quanta - OneStream'],
    ['{reviewer_name}',  'Developer / reviewer name',      'Siddharth Chandran'],
    ['{review_date}',    'Formatted date',                 '10/29/2026'],
    ['{status}',         'Approval state',                 'Approved'],
    ['{total_label}',    'Summary column label',           'Total Dashboards'],
    ['{tc_per_label}',   'Per-item label',                 'Testcases per dashboard'],
    ['{total_reports}',  'Total report/dashboard count',   '1'],
    ['{tc_per_report}',  'Testcases per item',             '12'],
    ['{total_testcase}', 'Total testcase count',           '12'],
  ]
));
children.push(blank());

children.push(h3('Checklist Looping Variables'));
children.push(makeTable(
  ['Tag', 'Description'],
  [
    ['{#modules}',            'Iterates over each distinct report/dashboard'],
    ['{#checklist}{sno}',     'S. No. for each checklist question (Cell 1)'],
    ['{parameter}',           'Checklist question description (Cell 2)'],
    ['{yes_mark}',            '☑ (Cell 3)'],
    ['{no_mark}',             '☐ (Cell 4)'],
    ['{na_mark}{/checklist}', '☐ (Cell 5, closes row loop)'],
  ]
));
children.push(blank());

// ── SECTION 6: Local Setup & Development ──────────────────────────────────
children.push(h1('6 — Local Setup & Development'));

children.push(h2('Prerequisites'));
children.push(bullet('Node.js v18.0.0 or higher'));
children.push(bullet('npm v8.0.0 or higher'));
children.push(bullet('Google Gemini API Key — from https://aistudio.google.com/app/apikey'));
children.push(blank());

children.push(h2('Environment Setup'));
children.push(body('Create server/.env:'));
children.push(codeLine('PORT=3000'));
children.push(codeLine('GEMINI_API_KEY=your_gemini_api_key_here'));
children.push(codeLine('GEMINI_MODEL=gemini-2.5-flash'));
children.push(codeLine('CORS_ORIGIN=http://localhost:5173'));
children.push(blank());

children.push(h2('Installation & Running'));
children.push(codeLine('# Install all dependencies'));
children.push(codeLine('npm run install:all'));
children.push(blank());
children.push(codeLine('# Start dev server (frontend + backend concurrently)'));
children.push(codeLine('npm run dev'));
children.push(blank());
children.push(bullet('Frontend: http://localhost:5173'));
children.push(bullet('Backend API: http://localhost:3000'));
children.push(blank());

// ── SECTION 7: API Reference ───────────────────────────────────────────────
children.push(h1('7 — API Reference'));

children.push(h2('GET /api/health'));
children.push(body('Returns server status and Gemini configuration flag.'));
children.push(codeLine('Response:'));
children.push(codeLine('{'));
children.push(codeLine('  "status": "ok",'));
children.push(codeLine('  "timestamp": "2026-10-29T09:28:35.000Z",'));
children.push(codeLine('  "service": "daily-document-generator-server",'));
children.push(codeLine('  "geminiConfigured": true'));
children.push(codeLine('}'));
children.push(blank());

children.push(h2('POST /api/generate-testcases'));
children.push(body('Accepts JSON, calls Gemini, returns a .docx binary stream.'));
children.push(codeLine('Content-Type: application/json'));
children.push(blank());
children.push(body('Request Body:', true));
children.push(codeLine('{'));
children.push(codeLine('  "updates": "CHG0058275 Forecast reports in workflow (RptgGrp_Dashboard)",'));
children.push(codeLine('  "reportCode": "R168",'));
children.push(codeLine('  "ticketNumber": "CHG0058275",'));
children.push(codeLine('  "certifiedBy": "Siddharth Chandran"'));
children.push(codeLine('}'));
children.push(blank());
children.push(body('Response Headers:', true));
children.push(codeLine('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
children.push(codeLine('Content-Disposition: attachment; filename="R168-RptgGrp_Dashboard-Testcase Document.docx"'));
children.push(blank());

// ── SECTION 8: Deployment ─────────────────────────────────────────────────
children.push(h1('8 — Deployment'));

children.push(h2('Render (Production)'));
children.push(bullet('Platform: Render Web Service'));
children.push(bullet('Build Command: npm run build'));
children.push(bullet('Start Command: npm start'));
children.push(bullet('Environment Variable: GEMINI_API_KEY (set in Render Dashboard)'));
children.push(bullet('Production URL: https://tc-document-generator.onrender.com'));
children.push(blank());

children.push(h2('GitHub Repository'));
children.push(bullet('Repo: https://github.com/siddharth19csk/TC_document_generator'));
children.push(bullet('Branch: main'));
children.push(bullet('Auto-deploy: Render auto-deploys on every push to main'));
children.push(blank());

// ═══════════════════════════════════════════════════════════════════════════
//  BUILD
// ═══════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [{
      reference: 'default-num',
      levels: [{
        level: 0,
        format: 'decimal',
        text: '%1.',
        alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } },
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('✅ README.docx written to:', OUT);
}).catch(err => {
  console.error('❌', err);
  process.exit(1);
});

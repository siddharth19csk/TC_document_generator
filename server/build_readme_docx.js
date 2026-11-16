// build_readme_docx.js — Generates documentation/README.docx from README.md content
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, ShadingType,
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'documentation', 'README.docx');

// ── helpers ──────────────────────────────────────────────────────────────────
const BRAND = '002D62';
const LIGHT  = 'D6E4F7';
const MONO   = 'Courier New';

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: BRAND, size: 36, font: 'Calibri' })],
    spacing: { before: 360, after: 120 },
  });
}
function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: BRAND, size: 26, font: 'Calibri' })],
    spacing: { before: 240, after: 80 },
  });
}
function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: BRAND, size: 22, font: 'Calibri' })],
    spacing: { before: 180, after: 60 },
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: 'Calibri', ...opts })],
    spacing: { before: 60, after: 60 },
  });
}
function bullet(text, boldPart = '') {
  const children = [];
  if (boldPart) {
    children.push(new TextRun({ text: boldPart, bold: true, size: 22, font: 'Calibri' }));
    children.push(new TextRun({ text, size: 22, font: 'Calibri' }));
  } else {
    children.push(new TextRun({ text, size: 22, font: 'Calibri' }));
  }
  return new Paragraph({
    children,
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
  });
}
function numbered(text, boldPart = '') {
  const children = [];
  if (boldPart) {
    children.push(new TextRun({ text: boldPart, bold: true, size: 22, font: 'Calibri' }));
    children.push(new TextRun({ text, size: 22, font: 'Calibri' }));
  } else {
    children.push(new TextRun({ text, size: 22, font: 'Calibri' }));
  }
  return new Paragraph({
    children,
    numbering: { reference: 'default-numbering', level: 0 },
    spacing: { before: 40, after: 40 },
  });
}
function codeLine(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 18, font: MONO, color: '333333' })],
    shading: { type: ShadingType.CLEAR, fill: 'F3F3F3' },
    spacing: { before: 20, after: 20 },
    indent: { left: 360 },
  });
}
function hr() {
  return new Paragraph({
    children: [new TextRun({ text: '─'.repeat(80), color: 'CCCCCC', size: 16, font: 'Calibri' })],
    spacing: { before: 120, after: 120 },
  });
}
function blank() {
  return new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 40, after: 40 } });
}
function tableHeader(labels) {
  return new TableRow({
    tableHeader: true,
    children: labels.map(label => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: BRAND },
      children: [new Paragraph({
        children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 20, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
      })],
      width: { size: Math.floor(10000 / labels.length), type: WidthType.DXA },
    })),
  });
}
function tableRow(cells) {
  return new TableRow({
    children: cells.map(cell => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: cell, size: 20, font: 'Calibri' })],
      })],
    })),
  });
}
function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeader(headers), ...rows.map(r => tableRow(r))],
  });
}

// ── document sections ─────────────────────────────────────────────────────────
const children = [];

// Title
children.push(
  new Paragraph({
    children: [new TextRun({ text: 'Testcase Document Generator', bold: true, size: 52, color: BRAND, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'OneStream Task Review Studio — Automated Test Case Document Generator', size: 24, color: '555555', font: 'Calibri', italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '🔗 Live Application: https://tc-document-generator.onrender.com', size: 22, font: 'Calibri', color: BRAND })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 120 },
  }),
  hr()
);

// Table of Contents
children.push(h1('Table of Contents'));
const tocItems = [
  '1. Overview',
  '2. Folder Structure',
  '3. File Purpose Reference',
  '4. End-to-End Workflow',
  '5. AI Classification & Fallback Architecture',
  '6. Word Template System',
  '7. Local Setup & Development',
  '8. API Reference',
  '9. Deployment',
];
tocItems.forEach(item => children.push(body(item)));
children.push(hr());

// Section 1 — Overview
children.push(h1('1. Overview'));
children.push(body('The Testcase Document Generator converts raw OneStream ticket activity notes (e.g. from ServiceNow changes, JIRA, or email handoffs) into standardized, corporate-ready Microsoft Word (.docx) testcase review documents.'));
children.push(blank());
children.push(h2('Key Capabilities'));
children.push(bullet('Automatically determines whether a ticket is a CUBE_VIEW (Normal, Flash, or New Build), PARAMETER_CHANGE, BOOK, or DASHBOARD.', 'Intelligent Ticket Classification: '));
children.push(bullet('Routes requests to the appropriate tagged Word template (TC_DASHBOARD_TEMPLATE_TAGGED.docx for dashboards, TC_CUBEVIEW_TEMPLATE_TAGGED.docx for cube views/parameters/books).', 'Dynamic Template Routing: '));
children.push(bullet('Populates exact standard checklist questions (8 items for Cube Views, 12 items for Dashboards, etc.) with pre-filled checkboxes.', 'Mandatory Corporate Checklists: '));
children.push(bullet('Features multi-model automatic failover (gemini-2.5-flash → gemini-flash-latest → gemini-2.5-flash-lite → gemini-2.5-pro) with exponential backoff against API spikes.', 'High-Availability AI Engine: '));
children.push(bullet('Delivers standardized .docx files formatted as <ReportCode>-<ReportName>-Testcase Document.docx.', 'Direct Word Download: '));
children.push(hr());

// Section 2 — Folder Structure
children.push(h1('2. Folder Structure'));
const folderTree = [
  'daily-document-generator/',
  '│',
  '├── client/                           # React + Vite Frontend',
  '│   ├── public/',
  '│   │   └── favicon.svg               # Application favicon',
  '│   ├── src/',
  '│   │   ├── services/',
  '│   │   │   └── apiService.js         # Axios HTTP client',
  '│   │   ├── App.jsx                   # Main React component',
  '│   │   ├── index.css                 # Corporate design system & styling',
  '│   │   └── main.jsx                  # Vite React entry point',
  '│   ├── index.html                    # HTML template shell',
  '│   ├── package.json                  # Client dependencies & scripts',
  '│   └── vite.config.js                # Vite build & dev proxy configuration',
  '│',
  '├── server/                           # Express Node.js Backend',
  '│   ├── generated/                    # Working directory for temp files',
  '│   ├── routes/',
  '│   │   ├── generate.js               # POST /api/generate-testcases',
  '│   │   └── health.js                 # GET /api/health endpoint',
  '│   ├── services/',
  '│   │   ├── aiService.js              # Gemini integration & fallbacks',
  '│   │   └── documentService.js        # Docxtemplater rendering engine',
  '│   ├── validators/',
  '│   │   ├── aiResponseValidator.js    # Zod schema for AI JSON output',
  '│   │   ├── configValidator.js        # Startup env var validation',
  '│   │   └── inputValidator.js         # Zod user form input validation',
  '│   ├── .env                          # Server environment variables (local)',
  '│   ├── .env.example                  # Template for environment variables',
  '│   └── index.js                      # Express entry point & middleware',
  '│',
  '├── templates/                        # Word template files (.docx)',
  '├── documentation/                    # Project documentation files',
  '├── package.json                      # Root orchestrator scripts',
  '├── README.md                         # Project documentation',
  '├── run.bat                           # Windows local run shortcut',
  '└── run.ps1                           # PowerShell local run shortcut',
];
folderTree.forEach(line => children.push(codeLine(line)));
children.push(hr());

// Section 3 — File Purpose Reference
children.push(h1('3. File Purpose Reference'));

children.push(h2('Root Files'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['package.json', 'Root orchestrator scripts (install:all, dev, build, start)'],
    ['README.md', 'Full project documentation and developer guide'],
    ['run.bat', 'Windows batch shortcut to start local dev environment'],
    ['run.ps1', 'PowerShell shortcut for local development startup'],
  ]
));
children.push(blank());

children.push(h2('Client Files (client/src/)'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['App.jsx', 'Main React component: form UI, progress states, download trigger, Help modal'],
    ['index.css', 'OneStream corporate design system — colors, fonts, button styles, animations'],
    ['main.jsx', 'Vite React application entry point'],
    ['services/apiService.js', 'Axios HTTP client that calls POST /api/generate-testcases and handles binary download'],
  ]
));
children.push(blank());

children.push(h2('Server Files (server/)'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['index.js', 'Express app entry point: registers routes, serves static client/dist, PDF/DOCX routes'],
    ['routes/generate.js', 'POST /api/generate-testcases route: validates input, calls AI, streams .docx'],
    ['routes/health.js', 'GET /api/health: returns server status and Gemini config flag'],
    ['services/aiService.js', 'Google Gemini integration: classification prompt, multi-model fallback chain'],
    ['services/documentService.js', 'Docxtemplater Word rendering: template resolver, variable injection, loop expansion'],
    ['validators/aiResponseValidator.js', 'Zod schema that validates the AI JSON output structure before template injection'],
    ['validators/configValidator.js', 'Validates required environment variables at startup; exits cleanly if missing'],
    ['validators/inputValidator.js', 'Validates user form input fields (updates, reportCode, certifiedBy, ticketNumber)'],
    ['build_help_guide_docx.js', 'Generates Help_Document.docx using the docx npm library'],
    ['build_help_guide_pdf.js', 'Generates User_Help_Guide.pdf using pdfkit'],
  ]
));
children.push(blank());

children.push(h2('Templates (templates/)'));
children.push(makeTable(
  ['File', 'Purpose'],
  [
    ['TC_CUBEVIEW_TEMPLATE_TAGGED.docx', 'Word template for Cube View, Flash Report, Parameter, and Book testcases'],
    ['TC_DASHBOARD_TEMPLATE_TAGGED.docx', 'Word template for Dashboard testcases with 12-item checklist'],
  ]
));
children.push(hr());

// Section 4 — End-to-End Workflow
children.push(h1('4. End-to-End Workflow'));
children.push(body('The following steps describe the full request lifecycle from user input to document download:'));
children.push(blank());
children.push(numbered('User fills the form: Testcase Raw Details, Report Code, Developer Name, Ticket Number, and selects the document type tab (Cube View, Flash Reports, Parameters, Books, Dashboard).\n'));
children.push(numbered('Client (App.jsx) calls apiService.js → POST /api/generate-testcases with JSON body.\n'));
children.push(numbered('Server inputValidator.js validates all required fields; returns 400 error if validation fails.\n'));
children.push(numbered('aiService.js sends a structured classification prompt to Gemini. The model returns a JSON object with report details, checklist answers, and summary counts.\n'));
children.push(numbered('aiResponseValidator.js validates the JSON response structure using a Zod schema.\n'));
children.push(numbered('documentService.js resolves the correct Word template based on ticket type, injects all variables and loops, and assembles the final .docx buffer.\n'));
children.push(numbered('Server streams the .docx binary with Content-Disposition: attachment header.\n'));
children.push(numbered('Browser triggers an automatic file download with the filename pattern: <ReportCode>-<ReportName>-Testcase Document.docx.\n'));
children.push(hr());

// Section 5 — AI Classification & Fallback Architecture
children.push(h1('5. AI Classification & Fallback Architecture'));
children.push(body('To guarantee 99.9% availability even during Google Cloud demand spikes, aiService.js implements a resilient multi-model fallback chain:'));
children.push(blank());
children.push(h2('Fallback Chain'));
children.push(numbered('Try: gemini-2.5-flash (primary model)\n'));
children.push(numbered('On 503 / timeout → Wait 1.5s and retry same model\n'));
children.push(numbered('Still failing → Fallback: gemini-flash-latest\n'));
children.push(numbered('Still failing → Fallback: gemini-2.5-flash-lite\n'));
children.push(numbered('Still failing → Fallback: gemini-2.5-pro\n'));
children.push(numbered('All fail → Show clear user alert with retry prompt\n'));
children.push(blank());
children.push(body('On any successful response, the JSON is parsed, enriched with server-side data (current date, remediation filename), and passed to the template engine.'));
children.push(hr());

// Section 6 — Word Template System
children.push(h1('6. Word Template System'));
children.push(body('Templates use docxtemplater delimiter syntax ({variable}, {#loop}...{/loop}) with validated OpenXML tags.'));
children.push(blank());

children.push(h2('Summary Table Variables'));
children.push(makeTable(
  ['Placeholder', 'Description', 'Example'],
  [
    ['{doc_title}',      'Document header',              'ONESTREAM DASHBOARD TASK REVIEW CHECKLIST'],
    ['{project_name}',   'Project name',                 'Quanta - OneStream'],
    ['{reviewer_name}',  'Name of developer/reviewer',   'Siddharth Chandran'],
    ['{review_date}',    'Formatted date',               '10/29/2026'],
    ['{status}',         'Approval state',               'Approved'],
    ['{total_label}',    'Summary column label',         'Total Dashboards'],
    ['{tc_per_label}',   'Per-item label',               'Testcases per dashboard'],
    ['{total_reports}',  'Total report/dashboard count', '1'],
    ['{tc_per_report}',  'Testcases per item',           '12'],
    ['{total_testcase}', 'Total testcase count',         '12'],
  ]
));
children.push(blank());

children.push(h2('Checklist Table Looping Variables'));
children.push(makeTable(
  ['Tag', 'Description'],
  [
    ['{#modules}',                 'Iterates over each distinct report/dashboard'],
    ['{#checklist}{sno}',          'S. No. for each checklist question (Cell 1)'],
    ['{parameter}',                'Checklist question description (Cell 2)'],
    ['{yes_mark}',                 '☑ (Cell 3)'],
    ['{no_mark}',                  '☐ (Cell 4)'],
    ['{na_mark}{/checklist}',      '☐ (Cell 5, closes row loop)'],
  ]
));
children.push(hr());

// Section 7 — Local Setup & Development
children.push(h1('7. Local Setup & Development'));

children.push(h2('Prerequisites'));
children.push(bullet('Node.js: v18.0.0 or higher'));
children.push(bullet('npm: v8.0.0 or higher'));
children.push(bullet('Google Gemini API Key: From https://aistudio.google.com/app/apikey'));
children.push(blank());

children.push(h2('Environment Setup'));
children.push(body('Create server/.env with your API credentials:'));
const envLines = ['PORT=3000', 'GEMINI_API_KEY=your_gemini_api_key_here', 'GEMINI_MODEL=gemini-2.5-flash', 'CORS_ORIGIN=http://localhost:5173'];
envLines.forEach(l => children.push(codeLine(l)));
children.push(blank());

children.push(h2('Installation'));
children.push(body('From the root directory, install all dependencies:'));
children.push(codeLine('npm run install:all'));
children.push(blank());

children.push(h2('Running Locally'));
children.push(body('Run both backend and frontend concurrently:'));
children.push(codeLine('npm run dev'));
children.push(blank());
children.push(bullet('Frontend: http://localhost:5173'));
children.push(bullet('Backend API: http://localhost:3000'));
children.push(hr());

// Section 8 — API Reference
children.push(h1('8. API Reference'));

children.push(h2('Health Check'));
children.push(codeLine('GET /api/health'));
children.push(body('Response:'));
const healthResp = [
  '{',
  '  "status": "ok",',
  '  "timestamp": "2026-10-29T09:28:35.000Z",',
  '  "service": "daily-document-generator-server",',
  '  "geminiConfigured": true',
  '}',
];
healthResp.forEach(l => children.push(codeLine(l)));
children.push(blank());

children.push(h2('Generate Document'));
children.push(codeLine('POST /api/generate-testcases'));
children.push(codeLine('Content-Type: application/json'));
children.push(blank());
children.push(body('Request Body:'));
const reqBody = [
  '{',
  '  "updates": "CHG0058275 Forecast reports in workflow (RptgGrp_Dashboard)",',
  '  "reportCode": "R168",',
  '  "ticketNumber": "CHG0058275",',
  '  "certifiedBy": "Siddharth Chandran"',
  '}',
];
reqBody.forEach(l => children.push(codeLine(l)));
children.push(blank());
children.push(body('Response: Binary .docx stream with headers:'));
children.push(codeLine('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
children.push(codeLine('Content-Disposition: attachment; filename="R168-RptgGrp_Dashboard-Testcase Document.docx"'));
children.push(hr());

// Section 9 — Deployment
children.push(h1('9. Deployment'));
children.push(body('The application is deployed on Render as a full-stack Web Service:'));
children.push(blank());
children.push(bullet('Build Command: npm run build  (installs dependencies and builds Vite client into client/dist)'));
children.push(bullet('Start Command: npm start  (starts server/index.js which serves both API and static UI)'));
children.push(bullet('Environment Variables: Set GEMINI_API_KEY in the Render Dashboard Environment settings'));
children.push(bullet('Production URL: https://tc-document-generator.onrender.com'));

// ── build ─────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: 'default-numbering',
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
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    children,
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT, buffer);
  console.log('✅ README.docx written to:', OUT);
}).catch(err => {
  console.error('❌ Error generating README.docx:', err);
  process.exit(1);
});

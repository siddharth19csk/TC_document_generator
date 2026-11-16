// build_readme_docx.js
// Generates documentation/README.docx matching the template style of:
//   "readme template/Process Flow & Technical Document - PRMARKDELETE_AUTOMATION 1.docx"
// Features: Aptos font, clean spacing between lines, simple explanations, clear flow.

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, ShadingType, BorderStyle,
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'documentation', 'README.docx');

// ── Typography & Colors ──────────────────────────────────────────────────────
const FONT      = 'Aptos';
const FONT_CODE = 'Consolas';
const BRAND     = '1F4E79'; // Deep Navy Blue
const ACCENT    = '2E74B5'; // Professional Steel Blue
const TEXT_DARK = '262626'; // Soft charcoal for high readability
const LINE_SPACING = 340;   // ~1.4x line spacing for comfortable reading

// ── Helper functions for clean formatting ────────────────────────────────────

function title() {
  return new Paragraph({
    children: [
      new TextRun({ text: 'Process Flow & Technical Document — ', bold: true, size: 46, font: FONT, color: BRAND }),
      new TextRun({ text: 'TC_DOCUMENT_GENERATOR', bold: true, size: 46, font: FONT_CODE, color: ACCENT }),
    ],
    spacing: { before: 360, after: 180, line: LINE_SPACING },
  });
}

function subtitle(text) {
  return new Paragraph({
    children: [
      new TextRun({ text, size: 24, font: FONT, color: '595959', italics: true }),
    ],
    spacing: { before: 0, after: 240, line: LINE_SPACING },
  });
}

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 40, font: FONT, color: BRAND })],
    spacing: { before: 400, after: 200, line: LINE_SPACING },
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 30, font: FONT, color: ACCENT })],
    spacing: { before: 320, after: 160, line: LINE_SPACING },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: FONT, color: BRAND })],
    spacing: { before: 260, after: 120, line: LINE_SPACING },
  });
}

function body(text, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: FONT, bold, color: TEXT_DARK })],
    spacing: { before: 100, after: 120, line: LINE_SPACING },
  });
}

function bodyMixed(label, rest) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, size: 22, font: FONT, bold: true, color: BRAND }),
      new TextRun({ text: rest, size: 22, font: FONT, color: TEXT_DARK }),
    ],
    spacing: { before: 100, after: 120, line: LINE_SPACING },
  });
}

function noteBox(label, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: label + ' ', bold: true, size: 21, font: FONT, color: BRAND }),
      new TextRun({ text, size: 21, font: FONT, color: TEXT_DARK }),
    ],
    shading: { type: ShadingType.CLEAR, fill: 'F0F4F9' },
    spacing: { before: 140, after: 140, line: LINE_SPACING },
    indent: { left: 300, right: 300 },
  });
}

function bullet(text, boldLabel = '') {
  const children = boldLabel
    ? [
        new TextRun({ text: boldLabel, bold: true, size: 22, font: FONT, color: BRAND }),
        new TextRun({ text, size: 22, font: FONT, color: TEXT_DARK }),
      ]
    : [new TextRun({ text, size: 22, font: FONT, color: TEXT_DARK })];
  return new Paragraph({
    children,
    bullet: { level: 0 },
    spacing: { before: 60, after: 80, line: LINE_SPACING },
  });
}

function numbered(text, boldLabel = '') {
  const children = boldLabel
    ? [
        new TextRun({ text: boldLabel, bold: true, size: 22, font: FONT, color: BRAND }),
        new TextRun({ text, size: 22, font: FONT, color: TEXT_DARK }),
      ]
    : [new TextRun({ text, size: 22, font: FONT, color: TEXT_DARK })];
  return new Paragraph({
    children,
    numbering: { reference: 'readable-num', level: 0 },
    spacing: { before: 80, after: 100, line: LINE_SPACING },
  });
}

function codeLine(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 19, font: FONT_CODE, color: '1A1A1A' })],
    shading: { type: ShadingType.CLEAR, fill: 'F5F7FA' },
    spacing: { before: 30, after: 30, line: 260 },
    indent: { left: 360 },
  });
}

function blank() {
  return new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 80, after: 80 } });
}

// ── Table Builder with pleasant spacing & alternating rows ──────────────────
function makeTable(headers, rows, customWidths = null) {
  const colCount = headers.length;
  const colW = customWidths || headers.map(() => Math.floor(9360 / colCount));

  const border = {
    top: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: BRAND },
      width: { size: colW[i], type: WidthType.DXA },
      borders: border,
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 21, font: FONT })],
        alignment: AlignmentType.START,
        spacing: { before: 120, after: 120, line: 280 },
        indent: { left: 120 },
      })],
    })),
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cellText, ci) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? 'FFFFFF' : 'F9FBFE' },
      width: { size: colW[ci], type: WidthType.DXA },
      borders: border,
      children: [new Paragraph({
        children: [new TextRun({ text: cellText, size: 20, font: FONT, color: TEXT_DARK })],
        spacing: { before: 100, after: 100, line: 280 },
        indent: { left: 120 },
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  DOCUMENT BODY
// ═════════════════════════════════════════════════════════════════════════════
const children = [];

// Header / Title Block
children.push(title());
children.push(subtitle('OneStream Task Review Studio — Automated Test Case Documentation System'));

children.push(bodyMixed(
  'Quick Summary: ',
  'This application automates the creation of official OneStream Test Case Review Documents (.docx). Instead of developers manually copying ticket details and filling out 8 to 12 checklist questions by hand, this tool takes raw ServiceNow notes, lets Google Gemini AI analyze the requirements, and instantly generates an audit-ready Word document.'
));

children.push(noteBox(
  '📍 Live Web Link:',
  'https://tc-document-generator.onrender.com'
));

children.push(blank());

// ── 1. Overview & Business Value ──────────────────────────────────────────
children.push(h1('1 — Overview & What This Tool Does'));

children.push(body(
  'In day-to-day OneStream financial system maintenance, developers modify reports, dashboards, parameters, and cube views. Before changes can move to production, corporate governance requires a completed and certified Test Case Review Document.'
));

children.push(body(
  'Doing this manually takes 20 to 30 minutes per ticket: opening the template, finding the ticket number, typing developer notes, formatting dates, ticking checklist boxes, and renaming files. The Testcase Document Generator reduces this whole process to under 5 seconds.'
));

children.push(h2('Key Benefits & Highlights'));

children.push(bullet(
  'Just paste the ServiceNow description. The system detects whether your change is a Cube View, Flash Report, Dashboard, Parameter, or Book.',
  'Automatic Ticket Understanding: '
));

children.push(bullet(
  'Dashboards need a special 12-item checklist; Cube Views need an 8-item checklist. The application automatically selects the correct template and fills the exact questions.',
  'Right Template Every Time: '
));

children.push(bullet(
  'If Google Cloud experiences a temporary slowdown or rate spike, the backend automatically retries with three backup AI models in sequence so your request never gets stuck.',
  'High Reliability with Backup AI Models: '
));

children.push(bullet(
  'The resulting file is formatted with the standard corporate naming rule: <ReportCode>-<ReportName>-Testcase Document.docx.',
  'Clean, Audit-Ready Word Documents: '
));

children.push(blank());

// ── 2. Simple End-to-End Workflow ─────────────────────────────────────────
children.push(h1('2 — Simple End-to-End Workflow (How It Works)'));

children.push(body(
  'Here is the step-by-step process of what happens from the moment you paste your ticket notes to downloading the finished Word document:'
));

children.push(numbered(
  'The user pastes the ServiceNow ticket description into the web form and fills in the Report Code, Developer Name, and Ticket Number.',
  'Step 1 — Input: '
));

children.push(numbered(
  'The web client checks that all 4 mandatory fields are provided. If any required information is missing, it highlights the field clearly.',
  'Step 2 — Client Validation: '
));

children.push(numbered(
  'The backend server receives the request, securely checks the inputs using Zod validation, and prepares a clear prompt for Google Gemini.',
  'Step 3 — Server Preparation: '
));

children.push(numbered(
  'Gemini AI reads the ticket notes, figures out which OneStream objects were touched, and prepares the answers for the audit checklist.',
  'Step 4 — AI Analysis: '
));

children.push(numbered(
  'The server adds exact real-world data that AI should not guess (such as today’s formatted date, standard project name, and remediation workbook names).',
  'Step 5 — Data Enrichment: '
));

children.push(numbered(
  'The document engine (Docxtemplater) injects all values into the official tagged Word template, repeating checklist rows with neat checkboxes (☑ / ☐).',
  'Step 6 — Word Document Assembly: '
));

children.push(numbered(
  'The finished file is sent directly to the user’s browser and automatically downloads to their computer.',
  'Step 7 — Instant Download: '
));

children.push(blank());

// ── 3. Application Components & Architecture ──────────────────────────────
children.push(h1('3 — Architecture & Components'));

children.push(body(
  'The project is split into clean, modular layers so that anyone can maintain or upgrade individual parts without breaking others:'
));

children.push(makeTable(
  ['Layer / Component', 'Technology', 'What It Does in Simple Words'],
  [
    ['Frontend User Interface', 'React + Vite + Modern CSS', 'Clean web screen with responsive inputs, progress spinners, Help modal, and direct file download trigger.'],
    ['Backend API Server', 'Node.js + Express', 'Receives web requests, validates inputs, hosts static help documents, and handles file generation.'],
    ['Artificial Intelligence', 'Google Gemini Flash API', 'Extracts key details, identifies ticket category, and fills audit checklist answers based on the ticket description.'],
    ['Document Builder', 'Docxtemplater + PizZip', 'Reads pre-formatted Word templates, replaces text tags like {reviewer_name}, and loops over checklist items.'],
    ['Data Validation', 'Zod', 'Enforces strict schemas to make sure bad or empty inputs are stopped before reaching the AI or template engine.'],
  ],
  [2300, 2100, 4960]
));

children.push(blank());

// ── 4. Project Folder & File Guide ────────────────────────────────────────
children.push(h1('4 — Project Files & Folder Structure'));

children.push(body(
  'Below is a visual layout of the project, followed by a simple reference table explaining where key logic lives:'
));

const treeLines = [
  'daily-document-generator/',
  '├── client/                          # Everything you see in the web browser',
  '│   ├── src/App.jsx                  # Main web page (form, tabs, modal, download)',
  '│   ├── src/services/apiService.js   # Sends form data to the backend server',
  '│   └── src/index.css                # Professional OneStream styling & colors',
  '├── server/                          # Backend business logic',
  '│   ├── routes/generate.js           # The main document generation endpoint',
  '│   ├── routes/health.js             # Server health check endpoint',
  '│   ├── services/aiService.js        # Gemini AI calls & automatic backup failover',
  '│   ├── services/documentService.js  # Word template selector and tag injector',
  '│   ├── validators/                  # Zod validation schemas (inputs & AI output)',
  '│   └── index.js                     # Express app setup and route registration',
  '├── templates/                       # Official corporate Word templates (.docx)',
  '│   ├── TC_CUBEVIEW_TEMPLATE_TAGGED.docx',
  '│   └── TC_DASHBOARD_TEMPLATE_TAGGED.docx',
  '└── documentation/                   # Documentation and user help guides',
];
treeLines.forEach(l => children.push(codeLine(l)));

children.push(blank());
children.push(h2('File Purpose Quick Reference'));

children.push(makeTable(
  ['File Name', 'Location', 'Purpose & Responsibility'],
  [
    ['App.jsx', 'client/src/', 'Handles user interaction: renders tabs, validates required fields, shows progress bar, and triggers download.'],
    ['apiService.js', 'client/src/services/', 'Makes the POST request to the backend with a 60-second timeout and handles the incoming file blob.'],
    ['generate.js', 'server/routes/', 'Coordinates the entire generation process: validates inputs -> calls AI -> builds document -> sends file.'],
    ['aiService.js', 'server/services/', 'Crafts the AI prompt, calls Google Gemini, and automatically retries with backup models if needed.'],
    ['documentService.js', 'server/services/', 'Picks the right Word template (Dashboard vs Cube View) and populates all summary and checklist tags.'],
    ['inputValidator.js', 'server/validators/', 'Ensures ticket description, report code, developer name, and ticket number are valid before processing.'],
    ['TC_DASHBOARD_TEMPLATE_TAGGED.docx', 'templates/', 'Corporate Word template for Dashboards featuring a 12-item review checklist.'],
    ['TC_CUBEVIEW_TEMPLATE_TAGGED.docx', 'templates/', 'Corporate Word template for Cube Views, Flash Reports, Parameters, and Books.'],
  ],
  [2600, 2100, 4660]
));

children.push(blank());

// ── 5. Use Cases Explained Simply ─────────────────────────────────────────
children.push(h1('5 — Common Use Cases'));

children.push(body(
  'The tool handles several distinct OneStream change scenarios. Here is how it behaves for each one:'
));

// 5.1
children.push(h2('5.1 Cube Views & Flash Reports'));
children.push(bodyMixed(
  'What it is: ',
  'Changes to existing report queries, row/column definitions, formatting, margins, or new report builds (e.g. R117, PWRJOB_RPT_15, RPT_FORECAST).'
));
children.push(bullet('Detected when notes mention "Cube View", "Flash Report", or report codes like R1xx.', 'Trigger: '));
children.push(bullet('Uses TC_CUBEVIEW_TEMPLATE_TAGGED.docx with an 8-item checklist.', 'Template: '));
children.push(bullet('Sets document title to "ONESTREAM CUBE VIEW TASK REVIEW CHECKLIST".', 'Header: '));

children.push(blank());

// 5.2
children.push(h2('5.2 Dashboards'));
children.push(bodyMixed(
  'What it is: ',
  'Changes to OneStream visual dashboards, workflow group dashboards, or planning components (e.g. RptgGrp_Dashboard).'
));
children.push(bullet('Detected when notes mention "Dashboard", "workflow group", or "RptgGrp".', 'Trigger: '));
children.push(bullet('Uses TC_DASHBOARD_TEMPLATE_TAGGED.docx with a comprehensive 12-item checklist.', 'Template: '));
children.push(bullet('Sets document title to "ONESTREAM DASHBOARD TASK REVIEW CHECKLIST".', 'Header: '));

children.push(blank());

// 5.3
children.push(h2('5.3 Parameter Changes & Books'));
children.push(bodyMixed(
  'What it is: ',
  'Updates to OneStream workflow parameters, parameter bounds, or Excel workbook (.xlBook) batch reports.'
));
children.push(bullet('Detected when notes reference parameter names, bounds, or .xlBook files.', 'Trigger: '));
children.push(bullet('Uses the standard Cube View template with checklist items adjusted for parameters/books.', 'Template: '));

children.push(blank());

// ── 6. AI Failover Architecture ───────────────────────────────────────────
children.push(h1('6 — AI Reliability & Backup Failover Architecture'));

children.push(body(
  'Cloud AI services can occasionally experience brief rate limits or service spikes. To make sure developers are never blocked, the backend uses a multi-tier fallback system:'
));

children.push(numbered(
  'The server first sends the prompt to gemini-2.5-flash for maximum speed and quality.',
  'Tier 1 (Fast Primary): '
));

children.push(numbered(
  'If Google returns a temporary 503 Service Unavailable, the server waits 1.5 seconds and tries the primary model once more.',
  'Tier 2 (Automatic Retry): '
));

children.push(numbered(
  'If the primary model is still busy, the system immediately switches to gemini-flash-latest.',
  'Tier 3 (First Backup): '
));

children.push(numbered(
  'If needed, it cascades to gemini-2.5-flash-lite, followed by gemini-2.5-pro.',
  'Tier 4 (Secondary Backups): '
));

children.push(numbered(
  'Only if every single tier fails will the user see an error message asking them to try again in 10 seconds.',
  'Tier 5 (Clean Error Handling): '
));

children.push(blank());

// ── 7. Word Template Tags Reference ───────────────────────────────────────
children.push(h1('7 — Word Template Tag Reference'));

children.push(body(
  'The Word documents use standard Docxtemplater tags. When the document is created, these tags are replaced with real data:'
));

children.push(makeTable(
  ['Tag in Word Template', 'What It Represents', 'Example Output in Word'],
  [
    ['{doc_title}', 'Top title of the review document', 'ONESTREAM DASHBOARD TASK REVIEW CHECKLIST'],
    ['{project_name}', 'Corporate project name', 'Quanta - OneStream'],
    ['{reviewer_name}', 'Developer or certifier name', 'Siddharth Chandran'],
    ['{review_date}', 'Date the document was generated', '11/16/2026'],
    ['{status}', 'Review approval status', 'Approved'],
    ['{total_reports}', 'Total number of modified objects', '1'],
    ['{tc_per_report}', 'Number of checklist questions', '12 (for Dashboards) or 8 (for Cube Views)'],
    ['{total_testcase}', 'Total checklist items verified', '12'],
    ['{#checklist}{sno}', 'Row number in the checklist table', '1, 2, 3...'],
    ['{parameter}', 'The exact checklist question text', 'Verify report output matches staging data'],
    ['{yes_mark}', 'Pass checkbox indicator', '☑'],
    ['{no_mark}', 'Fail checkbox indicator', '☐'],
  ],
  [2500, 3600, 3260]
));

children.push(blank());

// ── 8. How to Run & Deploy ────────────────────────────────────────────────
children.push(h1('8 — How to Run Locally & Production Deployment'));

children.push(h2('Running Locally on Your Computer'));
children.push(body('To run the project on your machine, follow these three simple steps:'));

children.push(numbered(
  'Clone the repository and open a terminal in the project folder.',
  'Step 1: '
));

children.push(numbered(
  'Run `npm run install:all` to install all dependencies for both frontend and backend.',
  'Step 2: '
));

children.push(numbered(
  'Add your Google Gemini API key to `server/.env`, then run `npm run dev` to start both the website (localhost:5173) and backend (localhost:3000).',
  'Step 3: '
));

children.push(blank());

children.push(h2('Production Deployment (Render)'));
children.push(bullet('Hosted as a full-stack Web Service on Render cloud platform.', 'Platform: '));
children.push(bullet('`npm run build` — installs all packages and compiles the React app into `client/dist`.', 'Build Command: '));
children.push(bullet('`npm start` — starts the Express server, which serves both the API and the React frontend.', 'Start Command: '));
children.push(bullet('Every time code is pushed to the `main` branch on GitHub, Render automatically rebuilds and deploys the update.', 'Auto-Deploy: '));
children.push(bullet('https://tc-document-generator.onrender.com', 'Live URL: '));

// ═════════════════════════════════════════════════════════════════════════════
//  PACK & WRITE DOCUMENT
// ═════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [{
      reference: 'readable-num',
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
      page: {
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('✅ README.docx successfully written to:', OUT);
}).catch(err => {
  console.error('❌ Error generating document:', err);
  process.exit(1);
});

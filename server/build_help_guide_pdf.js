import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docDir = path.resolve(__dirname, '../documentation');
const publicDir = path.resolve(__dirname, '../client/public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const img1Base64 = fs.readFileSync(path.resolve(docDir, 'step1_landing_overview.png')).toString('base64');
const img2Base64 = fs.readFileSync(path.resolve(docDir, 'step2_neat_prompt_filled.png')).toString('base64');
const img3Base64 = fs.readFileSync(path.resolve(docDir, 'step3_success_download.png')).toString('base64');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OneStream Testcase Generator - User Help & Prompt Guide</title>
  <style>
    @page {
      margin: 1.8cm 1.5cm;
      size: A4 portrait;
      @bottom-right {
        content: counter(page);
        font-family: Calibri, sans-serif;
        font-size: 9pt;
        color: #666;
      }
    }
    body {
      font-family: 'Segoe UI', Calibri, -apple-system, Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.55;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }
    .header-banner {
      border-bottom: 2px solid #002D62;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title {
      font-size: 18pt;
      font-weight: 700;
      color: #002D62;
      margin: 0;
      line-height: 1.2;
    }
    .header-subtitle {
      font-size: 10pt;
      color: #555;
      margin-top: 4px;
      font-weight: 500;
    }
    .header-badge {
      font-size: 8.5pt;
      background: #E8F4FD;
      color: #0072CE;
      border: 1px solid #B8DCF8;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 600;
    }
    h2 {
      font-size: 13pt;
      color: #002D62;
      border-bottom: 1px solid #E1E4E8;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      color: #0072CE;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 10px 0;
    }
    ul, ol {
      margin: 0 0 12px 0;
      padding-left: 22px;
    }
    li {
      margin-bottom: 5px;
    }
    .screenshot-card {
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      overflow: hidden;
      margin: 14px 0 18px 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      page-break-inside: avoid;
    }
    .screenshot-card img {
      width: 100%;
      height: auto;
      display: block;
    }
    .screenshot-caption {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 6px 12px;
      font-size: 8.5pt;
      color: #475569;
      font-style: italic;
    }
    .code-box {
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-left: 4px solid #0072CE;
      border-radius: 4px;
      padding: 10px 14px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9pt;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 10px 0 16px 0;
      page-break-inside: avoid;
    }
    .note-box {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 9.5pt;
      color: #1E3A8A;
      margin: 12px 0;
      page-break-inside: avoid;
    }
    .table-clean {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    .table-clean th {
      background: #F1F5F9;
      color: #0F172A;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #CBD5E1;
    }
    .table-clean td {
      padding: 8px 10px;
      border: 1px solid #E2E8F0;
      vertical-align: top;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- Banner Header -->
  <div class="header-banner">
    <div>
      <h1 class="header-title">OneStream Testcase Review Studio</h1>
      <div class="header-subtitle">User Guide, Form Navigation & Prompt Crafting Manual</div>
    </div>
    <div class="header-badge">OneStream XF Ready</div>
  </div>

  <h2>1. Overview & Purpose</h2>
  <p>
    The <strong>Testcase Document Generator</strong> is a specialized automation tool designed for OneStream development teams, reviewers, and business analysts. It converts ServiceNow tickets, daily activity notes, or developer logs into an officially formatted Word testcase review checklist (.docx) compliant with corporate governance requirements.
  </p>
  <p>
    <strong>Website URL:</strong> <code>https://tc-document-generator.onrender.com</code>
  </p>

  <h2>2. Navigating the Interface</h2>
  <p>
    The interface is streamlined to collect minimal required metadata while allowing complete flexibility in your input description.
  </p>

  <div class="screenshot-card">
    <img src="data:image/png;base64,${img1Base64}" alt="Step 1: Landing Interface Overview" />
    <div class="screenshot-caption">Figure 1: Application homepage showing required and optional input fields.</div>
  </div>

  <h3>Field Descriptions:</h3>
  <ul>
    <li><strong>Testcase Raw Details (Required):</strong> Paste the complete ServiceNow change/incident description, developer notes, or prompt detailing modified OneStream artifacts and workflow changes. Minimum 10 characters.</li>
    <li><strong>Report Code (Required):</strong> Enter the primary report or artifact code (e.g. <code>R117</code>, <code>PWRJOB_RPT_15</code>, or <code>RPT_FORECAST</code>).</li>
    <li><strong>Certified By (Optional):</strong> Developer or reviewer name (defaults to <code>Sid</code> / reviewer name if provided).</li>
    <li><strong>Ticket Number (Required):</strong> ServiceNow tracking ticket (e.g. <code>CHG0058275</code>, <code>INC0158214</code>, or <code>RITM0098421</code>).</li>
  </ul>

  <div class="page-break"></div>

  <h2>3. Crafting a "Neat Prompt"</h2>
  <p>
    The AI model determines the appropriate document checklist format based on the keywords in your text:
  </p>
  <ul>
    <li><strong>Dashboard Checklist (12 Items):</strong> Triggered when the prompt mentions <code>Dashboard</code> or <code>RptgGrp_Dashboard</code>.</li>
    <li><strong>Cube View Checklist (8 Items):</strong> Triggered when reports or cube views (e.g. <code>PWRJOB_RPT_*</code>) are specified without a dashboard workflow.</li>
  </ul>

  <div class="screenshot-card">
    <img src="data:image/png;base64,${img2Base64}" alt="Step 2: Neat Prompt Example" />
    <div class="screenshot-caption">Figure 2: Form populated with a structured Neat Prompt for a Dashboard change request.</div>
  </div>

  <h3>Standard Prompt Anatomy</h3>
  <div class="code-box">[Ticket Number] - [Brief Title]

Requirement:
[One-sentence description of the change request and validation status]

Workflow Context:
[Workflow group name, e.g., Forecast reports in workflow (RptgGrp_Dashboard)]

Artifacts Modified:
- [Artifact Type]: [Artifact Name]

Changes Made in Detail:
1. Created backup of existing artifact as _ORG.
2. [Specific query, column, margin, or layout adjustment].
3. Validated and tested in QA; ready for PROD release.</div>

  <h2>4. Ready-to-Use Prompt Templates</h2>

  <h3>Template A: Dashboard Changes (Routes to 12-Item Checklist)</h3>
  <div class="code-box">CHG0058275 - Update Executive Forecast Dashboard

Requirement:
As part of the new requirements, we completed all required changes and successfully validated data in QA. We are now releasing the new version to PROD.

Workflow Context:
Forecast reports in workflow (RptgGrp_Dashboard)

Artifacts Modified:
- Dashboard: Planning Dashboard - RPO Jobs
- Component: Grid_Forecast_Summary
- Data Adapter: DA_Forecast_JobDetails

Changes Made in Detail:
1. Created backup of Planning Dashboard as Planning_Dashboard_ORG.
2. Updated SQL query in DA_Forecast_JobDetails to include revised cost center mappings.
3. Adjusted grid margins, column widths, and label alignments in Grid_Forecast_Summary.
4. Validated dashboard navigation and verified zero drill-down errors in QA.</div>

  <div class="page-break"></div>

  <h3>Template B: Cube View Modifications (Routes to 8-Item Checklist)</h3>
  <div class="code-box">CHG0059102 - Revenue Summary Cube View Adjustment

Requirement:
Updated column definitions and row formatting styles for monthly executive reporting. Successfully validated against general ledger in QA.

Artifacts Modified:
- Cube View: PWRJOB_RPT_15 (Revenue Summary by Business Unit)

Changes Made in Detail:
1. Created backup of cube view as PWRJOB_RPT_15_ORG.
2. Modified Column POV definition to dynamically select current month and Prior Year actuals.
3. Adjusted row formatting style to display negative balances in red parentheses.
4. Confirmed report render time is under 2 seconds during QA performance testing.</div>

  <h3>Template C: Flash Reports & Parameters</h3>
  <div class="code-box">CHG0060411 - Flash Balance Sheet & Metric Parameters

Requirement:
Updated Balance Sheet Flash Report layout and refreshed custom date parameters for the Q4 reporting cycle.

Artifacts Modified:
- Flash Report: FLH_BalanceSheet_Summary
- Parameter: Param_ReportQuarter_End

Changes Made in Detail:
1. Created backup of Flash Report as FLH_BalanceSheet_Summary_ORG.
2. Updated parameter query string to default dynamically to current fiscal period.
3. Validated visual alignment and export to PDF in QA.</div>

  <h2>5. Generating & Downloading</h2>
  <div class="screenshot-card">
    <img src="data:image/png;base64,${img3Base64}" alt="Step 3: Document Generation Success" />
    <div class="screenshot-caption">Figure 3: Generation complete screen with instant download action.</div>
  </div>

  <ol>
    <li>Click <strong>Generate OneStream Document</strong>.</li>
    <li>Wait 3-5 seconds while the document is synthesized and structured into tables.</li>
    <li>Click <strong>Download Document</strong> to receive your standard corporate Word file (.docx).</li>
  </ol>

  <h2>6. Troubleshooting & FAQ</h2>
  <table class="table-clean">
    <thead>
      <tr>
        <th style="width: 30%;">Issue</th>
        <th style="width: 35%;">Probable Cause</th>
        <th style="width: 35%;">Recommended Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cube View checklist generated instead of Dashboard</strong></td>
        <td>The prompt omitted the word "Dashboard" or workflow tag.</td>
        <td>Add <code>(RptgGrp_Dashboard)</code> or explicitly name the dashboard object.</td>
      </tr>
      <tr>
        <td><strong>503 Service Unavailable / Spikes in demand</strong></td>
        <td>Temporary cloud API rate limit on Google Gemini.</td>
        <td>Wait 10-15 seconds and re-click Generate.</td>
      </tr>
      <tr>
        <td><strong>Reviewer name missing</strong></td>
        <td>"Certified By" input field was left blank.</td>
        <td>Specify your name in the "Certified By" field prior to generation.</td>
      </tr>
    </tbody>
  </table>

  <div class="note-box">
    <strong>Need Assistance?</strong> For questions or custom template tags, contact the OneStream CoE or System Administrator.
  </div>

</body>
</html>`;

const tempHtmlPath = path.resolve(docDir, 'Help_Document.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

const outputDocPdf = path.resolve(docDir, 'Help_Document.pdf');
const publicDocPdf = path.resolve(publicDir, 'Help_Document.pdf');
const userHelpDocPdf = path.resolve(docDir, 'User_Help_Guide.pdf');

// Also copy Help_Document.docx to client/public
const sourceDocx = path.resolve(docDir, 'Help_Document.docx');
const publicDocx = path.resolve(publicDir, 'Help_Document.docx');
if (fs.existsSync(sourceDocx)) {
  fs.copyFileSync(sourceDocx, publicDocx);
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outputDocPdf}" --no-pdf-header-footer "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;

console.log('Generating Help_Document.pdf via Edge headless...');
try {
  execSync(cmd, { stdio: 'pipe' });
  console.log('Generated:', outputDocPdf, 'Size:', fs.statSync(outputDocPdf).size);
  
  // Copy to public directory
  fs.copyFileSync(outputDocPdf, publicDocPdf);
  fs.copyFileSync(outputDocPdf, userHelpDocPdf);
  console.log('Copied to client/public/Help_Document.pdf');
} catch (err) {
  console.error('PDF Generation failed:', err.message);
  process.exit(1);
}


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
  <title>OneStream Testcase Generator - User Help Guide</title>
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
      <div class="header-subtitle">User Guide & Form Navigation Manual</div>
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
    <div class="screenshot-caption">Figure 1: Application homepage showing required input fields.</div>
  </div>

  <h3>Field Descriptions:</h3>
  <ul>
    <li><strong>Testcase Raw Details (Required):</strong> Paste the complete ServiceNow change/incident description, developer notes, or prompt detailing modified OneStream artifacts and workflow changes. Minimum 10 characters.</li>
    <li><strong>Report Code (Required):</strong> Enter the primary report or artifact code (e.g. <code>R117</code>, <code>PWRJOB_RPT_15</code>, or <code>RPT_FORECAST</code>).</li>
    <li><strong>Certified By (Required):</strong> Developer name (e.g. Siddharth Chandran). Mandatory – stamped on the certification block of the generated document.</li>
    <li><strong>Ticket Number (Required):</strong> ServiceNow tracking ticket (e.g. <code>CHG0058275</code>, <code>INC0158214</code>, or <code>RITM0098421</code>).</li>
  </ul>

  <div class="screenshot-card">
    <img src="data:image/png;base64,${img2Base64}" alt="Step 2: Form Populated Example" />
    <div class="screenshot-caption">Figure 2: Form populated with ticket details and certified reviewer information.</div>
  </div>

  <div class="page-break"></div>

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

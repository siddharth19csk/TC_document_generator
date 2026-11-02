import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  LevelFormat
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docDir = path.resolve(__dirname, "../documentation");
const imagePath = path.resolve(docDir, "homepage_screenshot.png");
const outputDocx = path.resolve(docDir, "documentation.docx");
const altOutputDocx = path.resolve(docDir, "docmentation.docx");

// Helper function to create black text runs
function t(text, options = {}) {
  const { bold = false, italics = false, size = 22 } = options;
  return new TextRun({
    text,
    font: "Calibri",
    color: "000000",
    size, // 22 = 11pt
    bold,
    italics
  });
}

// Helper function to create normal paragraphs
function p(textOrRuns, options = {}) {
  const {
    align = AlignmentType.LEFT,
    spacingBefore = 80,
    spacingAfter = 140,
    lineSpacing = 276
  } = options;

  let children = [];
  if (typeof textOrRuns === "string") {
    children = [t(textOrRuns)];
  } else if (Array.isArray(textOrRuns)) {
    children = textOrRuns;
  } else {
    children = [textOrRuns];
  }

  return new Paragraph({
    alignment: align,
    spacing: { before: spacingBefore, after: spacingAfter, line: lineSpacing },
    children
  });
}

// Helper for headings - strictly black
function h1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({
        text: title,
        font: "Calibri",
        size: 32, // 16pt
        bold: true,
        color: "000000"
      })
    ]
  });
}

function h2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text: title,
        font: "Calibri",
        size: 26, // 13pt
        bold: true,
        color: "000000"
      })
    ]
  });
}

function h3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: "Calibri",
        size: 23, // 11.5pt
        bold: true,
        color: "000000"
      })
    ]
  });
}

function bullet(boldPrefix, normalText) {
  return new Paragraph({
    spacing: { before: 60, after: 80, line: 260 },
    indent: { left: 400 },
    children: [
      t("•  ", { bold: true }),
      t(boldPrefix, { bold: true }),
      t(" " + normalText)
    ]
  });
}

function numbered(num, boldPrefix, normalText) {
  return new Paragraph({
    spacing: { before: 60, after: 80, line: 260 },
    indent: { left: 400 },
    children: [
      t(`${num}. `, { bold: true }),
      t(boldPrefix, { bold: true }),
      t(" " + normalText)
    ]
  });
}

async function generate() {
  console.log("Reading screenshot image from:", imagePath);
  const imageBuffer = fs.readFileSync(imagePath);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            color: "000000",
            size: 22
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          // Document Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "OneStream Testcase Document Generator",
                font: "Calibri",
                size: 40, // 20pt
                bold: true,
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: "Complete Project Technical Documentation and Architecture Guide",
                font: "Calibri",
                size: 24, // 12pt
                italics: true,
                color: "000000"
              })
            ]
          }),

          // Metadata block
          p([
            t("Author: ", { bold: true }),
            t("Siddharth Chandran  |  "),
            t("Platform: ", { bold: true }),
            t("OneStream Financial Platform Automation  |  "),
            t("Date: ", { bold: true }),
            t("October 2026")
          ]),
          p([
            t("Production URL: ", { bold: true }),
            t("https://tc-document-generator.onrender.com")
          ]),

          // SECTION 1
          h1("1. Executive Summary and Motivation"),
          p(
            "In our enterprise OneStream financial platform environment, developers and administrators deploy regular enhancements across Cube Views, Flash Reports, Parameters, Books, and Dashboards. Prior to this automation initiative, certifying a single change required a team member to manually open a corporate review template in Microsoft Word, look up the ticket details in ServiceNow, type the report codes, manually copy-paste standard checklist verification items, toggle checkboxes between Yes and No, calculate summary totals, format remediation filenames, and verify formatting."
          ),
          p(
            "This manual review procedure took between 30 to 45 minutes per change request and was vulnerable to human error. Common issues included missed verification questions, miscalculated summary metrics, incorrect ticket classification, and inconsistent formatting. To solve this, we set out to build an end-to-end automated system that ingests unstructured daily ticket notes, automatically classifies the change type using artificial intelligence, maps the required corporate checklist, and immediately generates a fully formatted, compliant Microsoft Word document ready for release audit sign-off."
          ),

          // SECTION 2
          h1("2. Project Screenshot and User Interface"),
          p(
            "Below is a live screenshot of the web application as deployed in production, demonstrating the single-screen design, the ticket category selectors, the raw details input area, and the document generation trigger."
          ),

          // Embedded Screenshot
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 100 },
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 580,
                  height: 410
                }
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 240 },
            children: [
              t("Figure 1: Production User Interface of the Testcase Document Generator (https://tc-document-generator.onrender.com)", {
                italics: true,
                size: 19
              })
            ]
          }),

          p(
            "The user interface was purposefully built with simplicity in mind. An engineer simply inputs the raw ServiceNow activity notes, specifies the Report Code (such as R117 or R168), provides their name for certification tracking, enters the Ticket Number, and clicks Generate. The system provides real-time animated feedback as it parses the input, queries the AI engine, and builds the Word document on the fly."
          ),

          // SECTION 3
          h1("3. Technologies Used and Architectural Rationale"),
          p(
            "When designing the software stack, we selected technologies that maximized development velocity, long-term maintainability, zero-dependency deployment, and flawless OpenXML document generation without requiring Microsoft Office desktop software on the server."
          ),

          h2("Frontend Technology: React 18 and Vite"),
          bullet("React 18 Component Architecture:", "Allows clean state isolation between form input states, multi-stage loading progress bars, error alerts, and direct document download triggers."),
          bullet("Vite Build Tool:", "Provides near-instant local development hot module reloading and produces an optimized production bundle with tiny asset footprint for cloud hosting."),
          bullet("Vanilla CSS Design System:", "Rather than loading bloated external UI frameworks, we wrote custom, focused CSS aligned with corporate design standards, responsive typography, and clear visual hierarchy."),
          bullet("Axios with Binary Blob Stream Support:", "Handles multipart and JSON payloads, intercepts stream responses, extracts sanitized filenames from HTTP headers, and triggers instant browser downloads."),

          h2("Backend Technology: Node.js and Express"),
          bullet("Node.js Runtime (v20):", "Offers non-blocking asynchronous I/O ideal for handling AI API calls, buffer generation, and streaming binary files simultaneously."),
          bullet("Express Framework:", "Serves as the lightweight REST API engine, providing routing, middleware for security headers via Helmet, cross-origin resource sharing via CORS, and request rate limiting."),
          bullet("Zod Schema Validation:", "Validates incoming form payloads and outgoing AI JSON responses at runtime, guaranteeing that corrupt or malformed inputs are rejected before processing."),

          h2("Artificial Intelligence Engine: Google Generative AI (Gemini)"),
          bullet("Google Gemini 2.5 Flash:", "Selected as the primary engine due to its exceptional reasoning speed, high token context window, structured JSON adherence, and low latency."),
          bullet("Multi-Model Fallback Chain:", "To ensure high availability against cloud API demand spikes, we implemented an automated failover hierarchy incorporating gemini-2.5-flash, gemini-flash-latest, gemini-2.5-flash-lite, and gemini-2.5-pro."),

          h2("Document Engine: Docxtemplater, PizZip, and OpenXML"),
          bullet("Docxtemplater & PizZip:", "Allows editing and populating native Microsoft Word files (.docx) directly in memory by parsing internal document XML without needing Word or COM automation on the server."),
          bullet("Tagged Corporate Templates:", "We converted approved corporate review documents into dynamic templates utilizing tag placeholders like {doc_title}, {total_label}, and {#checklist}{sno} loops."),

          h2("Cloud Infrastructure: Render"),
          bullet("Unified Web Service Deployment:", "Hosts the Express API and serves the compiled Vite frontend from a single service, eliminating cross-domain latency and simplifying DNS management."),
          bullet("Continuous Deployment from GitHub:", "Every commit pushed to the main branch automatically triggers tests, builds the frontend, and deploys the backend container within two minutes."),

          // SECTION 4
          h1("4. Step-by-Step Implementation: How We Built Everything"),
          p(
            "The project was built through a systematic engineering workflow over several focused milestones, starting from legacy workflow analysis to full production release."
          ),

          h2("Step 1: Deconstructing the Manual Review Workflow"),
          p(
            "We began by gathering real-world review documents from past deployments across Cube Views, Flash Reports, Parameters, Books, and Dashboards. We analyzed the recurring checklist parameters, the summary table metrics, and the certification requirements. We found that each artifact type required a distinct, non-negotiable verification checklist established by corporate release compliance."
          ),

          h2("Step 2: AI Prompt Design and Ticket Classification Rules"),
          p(
            "We engineered a specialized prompt for Google Gemini that acts as a precise integration mapping agent. The prompt performs classification across five major categories:"
          ),
          numbered("1", "DASHBOARD:", "Classified when notes mention 'Dashboard', 'dashboard updation', 'planning dashboard', or workflow groups like 'RptgGrp_Dashboard'. Requires a 12-item dashboard verification checklist."),
          numbered("2", "CUBE_VIEW - Normal:", "The default for existing cube views undergoing margin adjustments, formatting updates, or data fixes. Uses an 8-item Cube View configuration checklist."),
          numbered("3", "CUBE_VIEW - Flash Reports:", "Triggered when report names start with 'FLH' or notes explicitly reference Flash cube views. Uses the specialized Flash verification checklist."),
          numbered("4", "CUBE_VIEW - New Build:", "Classified when reports are built from scratch, referencing new business rules, profile groups, or names ending in '_DATA'. Uses a 9-item build verification checklist."),
          numbered("5", "PARAMETER_CHANGE & BOOK:", "Classified when modifying OneStream parameter boundaries or compiling '.xlBook' deliverables, applying their respective corporate checklist questions."),

          h2("Step 3: Engineering the Tagged Word Template System"),
          p(
            "Rather than generating Word documents from scratch, which often causes subtle corporate style discrepancies, we took the official OneStream review documents and converted them into docxtemplater tagged templates:"
          ),
          bullet("TC_CUBEVIEW_TEMPLATE_TAGGED.docx:", "Dedicated template for Cube Views, Parameters, Books, and Flash reports."),
          bullet("TC_DASHBOARD_TEMPLATE_TAGGED.docx:", "Dedicated template tailored for Dashboard reviews, featuring customized summary headers ('Total Dashboards', 'Testcases per dashboard') and the full 12-item checklist."),

          h2("Step 4: Developing the Server and Document Generation Pipeline"),
          p(
            "In 'documentService.js', we created the core document assembly logic. When a request arrives, the service inspects the AI's classified ticket type, selects the appropriate template file from the 'templates/' folder, resolves all placeholder tokens, iterates through the dynamic checklist rows, calculates summary totals, and exports a clean binary buffer."
          ),

          h2("Step 5: Frontend Design and User Experience"),
          p(
            "We built the React user interface to provide an effortless, responsive experience. Features include input validation with instant feedback, clear category pills indicating supported artifact types, an animated 3-step progress sequence during generation, error alert banners, and automatic browser download triggering."
          ),

          // SECTION 5
          h1("5. Critical Engineering Roadblocks and How We Solved Them"),
          p(
            "During development and quality testing, we encountered several difficult technical hurdles. Documenting how we identified and resolved each issue ensures complete transparency and future maintainability."
          ),

          h2("Roadblock 1: Word OpenXML Table Corruption in the Dashboard Template"),
          p(
            "Problem: When testing the newly created Dashboard template, Microsoft Word failed to open the generated file, displaying a generic error: 'Word experienced an error trying to open the file. Check file permissions or disk space.' While it appeared to be a system permissions error, deep inspection revealed malformed OpenXML."
          ),
          p(
            "Root Cause: In our tagging script, a regular expression designed to match text nodes unintentionally matched table cell tags, stripping opening '<w:tc>', '<w:p>', and '<w:r>' tags from table rows. When Microsoft Word's parser encountered mismatched table row tags, it refused to load the file."
          ),
          p(
            "Resolution: We completely rebuilt 'tag_dashboard_template.js' to respect exact OpenXML schemas. Each cell structure was preserved with its full width, borders, and paragraph formatting, placing docxtemplater loop tags neatly inside cell boundaries. We then added automated verification using Windows Word COM automation to confirm that Word opened generated files with zero errors."
          ),

          h2("Roadblock 2: AI High-Demand Spikes (503 Service Unavailable)"),
          p(
            "Problem: During peak usage hours, Google Cloud's API occasionally returned '503 Service Unavailable: This model is currently experiencing high demand'. This caused document generation to fail abruptly for the end user."
          ),
          p(
            "Resolution: We implemented a dual-layer resiliency system in 'aiService.js'. First, when a 503 is detected, the engine pauses for 1.5 seconds and executes an automatic retry. Second, if the primary model continues to fail, the system seamlessly transitions down an automated fallback chain: gemini-2.5-flash -> gemini-flash-latest -> gemini-2.5-flash-lite -> gemini-2.5-pro. As a result, momentary cloud demand spikes no longer affect the user."
          ),

          h2("Roadblock 3: Ambiguous Workflow Group Classification"),
          p(
            "Problem: When a user submitted notes like 'CHG0058275 Forecast reports in workflow (RptgGrp_Dashboard)', the initial prompt logic saw the word 'workflow' and treated it as a regular cube view report, generating an 8-item checklist instead of the required 12-item dashboard checklist."
          ),
          p(
            "Resolution: We refined the classification logic in 'aiService.js' to specifically recognize dashboard workflow groups such as 'RptgGrp_Dashboard'. The prompt now strictly classifies any ticket containing 'Dashboard' or '(RptgGrp_Dashboard)' as a DASHBOARD ticket unless specific individual cube views (such as PWRJOB_RPT_15) are explicitly isolated."
          ),

          h2("Roadblock 4: Template Styling and Visual Polishing"),
          p(
            "Problem: An earlier revision of the dashboard template contained an extra blue-shaded module heading row that cluttered the table layout."
          ),
          p(
            "Resolution: We updated the template tagging logic to remove the blue module header row entirely. The table now flows directly from the column headers ('S. No.', 'Checklist Item', 'Yes', 'No', 'N/A') straight into the category banner and the 12 verification items, perfectly matching corporate styling standards."
          ),

          // SECTION 6
          h1("6. Security, Performance, and Operational Readiness"),
          p(
            "The platform was engineered to satisfy corporate IT security and data privacy mandates:"
          ),
          bullet("API Credential Confidentiality:", "The Google Gemini API key resides solely in server environment variables and is never exposed to client-side code or browser network inspectors."),
          bullet("Zero Data Persistence Policy:", "The application processes ticket details entirely in transient server memory. No activity notes, usernames, or generated documents are saved to permanent server databases, ensuring compliance with data confidentiality rules."),
          bullet("Input Sanitization and Defensive Headers:", "All user inputs are validated against strict Zod schemas, HTTP response headers are hardened via Helmet, and rate limiting restricts excessive burst requests."),
          bullet("Sub-3-Second Performance:", "From the moment an engineer clicks Generate, complete document parsing, AI classification, docxtemplater variable injection, and browser download completes within 2.5 to 3.5 seconds."),

          // SECTION 7
          h1("7. Conclusion and Future Roadmap"),
          p(
            "The Testcase Document Generator has successfully replaced a tedious, error-prone manual task with an instant, intelligent, automated workflow. By uniting modern web technologies with Google Gemini's reasoning capabilities and native OpenXML document synthesis, our team has established a reliable automation standard for OneStream release documentation."
          ),
          p(
            "Planned future enhancements include supporting automated attachment uploads directly back to ServiceNow via REST APIs, multi-ticket batch processing for large monthly maintenance windows, and expanded checklist support for OneStream Business Rules and Extensible Documents."
          )
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputDocx, buffer);
  console.log("SUCCESS! Created:", outputDocx);

  // Also save a copy with the literal name docmentation.docx
  fs.writeFileSync(altOutputDocx, buffer);
  console.log("SUCCESS! Created alternate copy:", altOutputDocx);
}

generate().catch(console.error);

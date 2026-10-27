import { GoogleGenerativeAI } from '@google/generative-ai';

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 16384,
      // Do NOT set responseMimeType here — the n8n workflow parses plain text JSON
    },
  });
}

// ============================================================
// EXACT n8n prompt — copied verbatim from "Basic LLM Chain"
// ============================================================
function buildPrompt(formData) {
  return `You are a precise system integration agent mapping raw OneStream ticket
notes into two structured JSON objects for a corporate Word document
template engine. Do not invent facts not present or reasonably inferable
from the notes below.

Raw Activity Notes:
${formData.updates}

STEP 1 - CLASSIFY THE TICKET TYPE
- CUBE_VIEW: notes mention cube view names, report formatting, margins,
  data changes, or any OneStream CubeView configuration change.
- PARAMETER_CHANGE: notes mention OneStream parameter names, workflow
  rule settings, or business-rule parameter values being changed.
- BOOK: notes mention creating/updating a Book (.xlBook, .xfDoc.xlBook
  files), "Book folder", or "Fixed Assets Review Book" style deliverables.
  This is NOT a cube view, even if it references cube views internally -
  if the notes say "Book" or the file extension is .xlBook, classify BOOK.
- DASHBOARD: notes explicitly mention "Dashboard", "dashboard updation",
  "planning dashboard", or "dashboard configuration". This is distinct from
  cube views even if dashboards contain cube views.
If none fit clearly, default to CUBE_VIEW.

STEP 2 - IF CUBE_VIEW, CLASSIFY THE SUB-TYPE (this determines which fixed
checklist to use - read carefully, this matters):
- FLASH: the report/cube view name starts with "FLH" or the notes
  explicitly say "Flash report"/"Flash cube view".
- NEW_BUILD: the notes describe CREATING a brand new cube view and/or a
  new Business Rule from scratch (not updating an existing one) - look for
  words like "created", "new cube view", "new business rule", "profile
  group", "UD8 members", or report names ending in "_DATA"/"_DATA1"
  (these indicate a newly-built source/data cube view pair).
- NORMAL: everything else - updating margins, formatting, data, or
  content on an EXISTING report/cube view. This is the default and most
  common case.

STEP 3 - BUILD THE "rc" OBJECT (always populate this, regardless of ticket_type)
{
  "version": "[patch-increment style version, e.g. 0.2.3, or N/A if not mentioned]",
  "project": "OneStream",
  "environment": "[DEV / QA / PROD - infer from notes, default QA]",
  "build": "[build/version identifier mentioned, or N/A]",
  "date": "N/A",
  "status": "[Approved / Rejected / Conditionally Approved - default Approved]",
  "testing_type": "[Smoke / BAT / Regression / Hotfix - infer from notes, default Smoke]",
  "ticket_id": "[the ticket ID mentioned, e.g. INC0158214]",
  "report_name": "[a clean, underscore-separated report/cube-view name suitable for a filename, e.g. HCMHR_PWR_Weekly_ManHours_PY - use the main report name from the notes]",
  "remarks": "[one crisp sentence summarizing what this release does]",
  "changes_summary": ["short bullet describing each distinct change made - one array entry per change"]
}

STEP 4 - IF ticket_type IS CUBE_VIEW, BUILD "tc_cube_view" USING THE
CHECKLIST THAT MATCHES THE SUB-TYPE YOU DETECTED IN STEP 2:

--- IF SUB-TYPE = NORMAL, use these exact 8 questions per module: ---
{"sno":"1","parameter":"Check the backup of the cube view is created as _ORG"}
{"sno":"2","parameter":"Validate that the changes made are reflected in the cube view"}
{"sno":"3","parameter":"Verify that both PDF and Excel format of the report execute properly"}
{"sno":"4","parameter":"Validate that both rows and columns foot correctly"}
{"sno":"5","parameter":"Validate that the requested change item has updated correctly by comparing it with the before one"}
{"sno":"6","parameter":"Verify that there is no error occur while running the cube view"}
{"sno":"7","parameter":"Validate all the customers are added by checking the sample QV"}
{"sno":"8","parameter":"Check Remediation files are created with all the screenshots of changes made"}

--- IF SUB-TYPE = FLASH, use these exact 8 questions per module: ---
{"sno":"1","parameter":"Verify that there is no error occur while running the cube view"}
{"sno":"2","parameter":"Validate that all the header, footer and total row format aligns properly in the report"}
{"sno":"3","parameter":"Verify that both PDF and Excel format of the report execute properly"}
{"sno":"4","parameter":"Validate that both rows and columns foot correctly"}
{"sno":"5","parameter":"Validate that the requested change item has updated correctly by comparing it with the before one"}
{"sno":"6","parameter":"For Flash Reports, Verify that the Report fits in one page in PDF Format"}
{"sno":"7","parameter":"Check that backup of the cube view is created as _ORG"}
{"sno":"8","parameter":"Check Remediation files are created with all the screenshots of changes made"}

--- IF SUB-TYPE = NEW_BUILD, use these exact 9 questions per module: ---
{"sno":"1","parameter":"Verify that the new Cube view profile group is created"}
{"sno":"2","parameter":"Validated cube view name and description matches with the sample spec provided"}
{"sno":"3","parameter":"Validate both the source cube views (DATA) are pulling the correct job and data"}
{"sno":"4","parameter":"Verify the Business Rule works without any syntax error"}
{"sno":"5","parameter":"Validated the Data Cube view created are working correctly and pulling the correct data"}
{"sno":"6","parameter":"Validate the main cube view executes correctly with the help of DATA cube views"}
{"sno":"7","parameter":"Check the rows and columns foots and displays correct jobs"}
{"sno":"8","parameter":"Validate the Excel and PDF format of the report"}
{"sno":"9","parameter":"Validate that the test file is created with all check"}

Full "tc_cube_view" shape (this same object shape is used for CUBE_VIEW,
PARAMETER_CHANGE, and BOOK ticket types - only doc_title, category_label,
and the checklist content change):
{
  "doc_title": "[see the exact title strings below - pick the one matching the classified type]",
  "project_name": "Quanta - OneStream",
  "reviewer_name": "[reviewer name from notes, else same as certified_by]",
  "review_date": "N/A",
  "status": "[same as rc.status]",
  "remediation_file_name": "[a sensible .xlsx file name for the remediation/test file, or 'N/A']",
  "modules": [
    {
      "module_name": "[cube view / report / parameter / book name mentioned]",
      "category_label": "[see below]",
      "checklist": [ ...the matching fixed list below, with yes_mark/no_mark/na_mark added to each item... ]
    }
  ]
}

For each checklist item, add "yes_mark", "no_mark", "na_mark" fields:
exactly one should be \\u2611 (checked), the other two \\u2610. Default to
Yes/checked unless the notes explicitly describe that specific check
failing or not applying.

--- IF ticket_type = CUBE_VIEW, sub-type = NORMAL ---
doc_title: "ONESTREAM CUBEVIEW TASK REVIEW CHECKLIST"
category_label: "Cube View Configurations"
8 questions per module (use exact wording above)

--- IF ticket_type = CUBE_VIEW, sub-type = FLASH ---
doc_title: "ONESTREAM FLASH CUBEVIEW TASK REVIEW CHECKLIST"
category_label: "Flash Cube View Configurations"
8 questions per module (use exact wording above)

--- IF ticket_type = CUBE_VIEW, sub-type = NEW_BUILD ---
doc_title: "ONESTREAM CUBEVIEW TASK REVIEW CHECKLIST"
category_label: "Cube View Configurations"
9 questions per module (use exact wording above)

--- IF ticket_type = PARAMETER_CHANGE ---
doc_title: "ONESTREAM PARAMETER TASK REVIEW CHECKLIST"
category_label: "Parameter Configurations"
module_name = the parameter name changed (one module per parameter)
4 questions per module:
{"sno":"1","parameter":"Verify that the requested parameter is created and appeared in QPM Parameter list in Workspace."}
{"sno":"2","parameter":"Validate that the parameter update done correctly and saved properly"}
{"sno":"3","parameter":"Verify that the parameter works correctly across any sample reports"}
{"sno":"4","parameter":"Validate that the Default value of parameter is set based on the requirement"}

--- IF ticket_type = BOOK ---
doc_title: "ONESTREAM BOOK TASK REVIEW CHECKLIST"
category_label: "Book Configurations"
module_name = the book file name changed (one module per book)
9 questions per module:
{"sno":"1","parameter":"Verify that a user has access for Book and File explorer"}
{"sno":"2","parameter":"Validate the Loop, change parameter used for the respective book created/updated"}
{"sno":"3","parameter":"Verify whether all the needed parameters used in the Cube view are included in the book"}
{"sno":"4","parameter":"Verify whether the Cube View component used is correct"}
{"sno":"5","parameter":"Verify the Books got saved under the respective Book folder with correct format(pdf, xl, zip)"}
{"sno":"6","parameter":"Validate the Output name for Excel formatted book by running it."}
{"sno":"7","parameter":"Validate the Report Header/Footer of the PDF format book by checking the Entity/Region name"}
{"sno":"8","parameter":"Validate the Flash Books PDF format to fit into one page"}
{"sno":"9","parameter":"Verify whether the Maintenance group is set to Administrators. If not, check with the security group access"}

--- IF ticket_type = DASHBOARD ---
doc_title: "ONESTREAM DASHBOARD TASK REVIEW CHECKLIST"
category_label: "Dashboard Updation"
module_name = the dashboard name mentioned (one module per dashboard)
12 questions per module:
{"sno":"1","parameter":"Verify that the dashboard is accessible and loads without errors"}
{"sno":"2","parameter":"Validate that the dashboard layout and design match the requirements"}
{"sno":"3","parameter":"Verify that all widgets/components on the dashboard display correct data"}
{"sno":"4","parameter":"Validate that the dashboard filters and parameters work correctly"}
{"sno":"5","parameter":"Verify that the dashboard data refreshes properly when parameters are changed"}
{"sno":"6","parameter":"Validate that all cube views embedded in the dashboard execute without errors"}
{"sno":"7","parameter":"Verify that the dashboard is accessible to the correct user groups/roles"}
{"sno":"8","parameter":"Validate that the requested change has been correctly implemented and matches the requirement"}
{"sno":"9","parameter":"Verify that the backup of the original dashboard is created as _ORG"}
{"sno":"10","parameter":"Validate that the dashboard performs correctly across different time periods/scenarios"}
{"sno":"11","parameter":"Verify there are no broken links or missing components on the dashboard"}
{"sno":"12","parameter":"Check that Remediation files are created with all screenshots of changes made"}

These are fixed, mandatory corporate checklists for every type - use the
exact wording and order shown. Do not reword, skip, or reorder them.
Create one "modules" entry - with ALL of that type's questions - for each
distinct item (report/parameter/book/dashboard) the notes mention.

OUTPUT FORMAT
Return ONLY a single raw JSON object with this exact top-level shape:
{
  "rc": { ...as built in step 3... },
  "ticket_type": "CUBE_VIEW, PARAMETER_CHANGE, BOOK, or DASHBOARD",
  "cube_view_subtype": "NORMAL, FLASH, or NEW_BUILD (only if ticket_type is CUBE_VIEW, else omit)",
  "tc_cube_view": { ...as built in step 4, populated for whichever type applies... }
}
Do not add markdown code fences, backticks, or any explanatory text before
or after the JSON. Output must be valid, parseable JSON.`;
}

// ============================================================
// Parser — mirrors "Code in JavaScript2" from n8n exactly
// ============================================================
function parseAndEnrich(rawText, formData) {
  const cleaned = rawText.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Could not parse AI output as JSON. Raw text was: ' + rawText.slice(0, 500));
  }

  // Today's real date — AI cannot reliably know this
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  const todayStr = `${mm}/${dd}/${yyyy}`;

  if (parsed.rc) {
    parsed.rc.reviewed_by = formData.certifiedBy || 'N/A';
    parsed.rc.review_reviewed_by = formData.certifiedBy || 'N/A';

    // Template version — always this fixed value
    parsed.rc.version = '0.2.2';

    if (!parsed.rc.build || parsed.rc.build.toUpperCase() === 'N/A') {
      parsed.rc.build = '--';
    }

    parsed.rc.date = todayStr;
    parsed.rc.build_date = todayStr;
    parsed.rc.build_no = parsed.rc.build_no || '0.1';
    parsed.rc.build_remarks = parsed.rc.build_remarks || 'Completed';
    parsed.rc.defects_identified = parsed.rc.defects_identified || 0;
    parsed.rc.bugs_fixed = parsed.rc.bugs_fixed || 0;

    // Certified By / Developer Name from the form (not AI)
    const certifier = formData.certifiedBy || parsed.rc.certified_by || 'N/A';
    parsed.rc.certified_by = certifier;
    parsed.rc.developer_name = certifier;

    // Ticket Number from the form
    parsed.rc.ticket_id = formData.ticketNumber || parsed.rc.ticket_id || 'N/A';

    const env = (parsed.rc.environment || 'QA').toUpperCase();
    parsed.rc.env_is_dev = env === 'DEV';
    parsed.rc.env_is_qa = env === 'QA';
    parsed.rc.env_is_prod = env === 'PROD';
    parsed.rc.review_module = env;
    parsed.rc.checkin_modules = env;

    const status = (parsed.rc.status || 'Approved').toLowerCase();
    parsed.rc.status_is_approved = status === 'approved';
    parsed.rc.status_is_rejected = status === 'rejected';
    parsed.rc.status_is_conditional = status.includes('conditional');

    const testing = (parsed.rc.testing_type || 'Smoke').toLowerCase();
    parsed.rc.testing_is_smoke = testing === 'smoke';
    parsed.rc.testing_is_bat = testing === 'bat';
    parsed.rc.testing_is_regression = testing === 'regression';
    parsed.rc.testing_is_hotfix = testing === 'hotfix';

    // Compute real test case counts
    let executed = 0, passed = 0, failed = 0;
    if (parsed.tc_cube_view && Array.isArray(parsed.tc_cube_view.modules)) {
      for (const mod of parsed.tc_cube_view.modules) {
        if (!Array.isArray(mod.checklist)) continue;
        for (const item of mod.checklist) {
          executed++;
          if (item.yes_mark === '\u2611') passed++;
          else if (item.no_mark === '\u2611') failed++;
        }
      }
    }
    parsed.rc.tc_executed = executed;
    parsed.rc.tc_passed = passed;
    parsed.rc.tc_failed = failed;
    parsed.rc.review_tc_count = executed;
  }

  if (parsed.tc_cube_view) {
    parsed.tc_cube_view.review_date = todayStr;
    parsed.tc_cube_view.reviewer_name = formData.certifiedBy || parsed.tc_cube_view.reviewer_name || 'N/A';

    // Combine module names cleanly for 2 or more reports (e.g. PWRJOB_RPT_15 & PWRJOB_RPT_16 -> PWRJOB_RPT_15_16)
    const modules = parsed.tc_cube_view.modules;
    let rName = (parsed.rc && parsed.rc.report_name) || 'Report';
    if (Array.isArray(modules) && modules.length > 0) {
      const rawNames = modules.map(m => (m.module_name || '').trim()).filter(Boolean);
      const names = [...new Set(rawNames)];
      if (names.length === 1) {
        rName = names[0];
      } else if (names.length > 1) {
        const splits = names.map(n => {
          const lastUnder = n.lastIndexOf('_');
          return lastUnder !== -1 ? { prefix: n.slice(0, lastUnder + 1), suffix: n.slice(lastUnder + 1) } : null;
        });
        if (splits.every(s => s && s.prefix === splits[0].prefix)) {
          rName = splits[0].prefix + splits.map(s => s.suffix).join('_');
        } else {
          rName = names.join('_');
        }
      }
    }

    if (parsed.rc) {
      parsed.rc.report_name = rName;
    }

    // Remediation filename: <CombinedReportName>_Remediation_MM-DD-YYYY.xlsx
    const dashDate = todayStr.replace(/\//g, '-');
    parsed.tc_cube_view.remediation_file_name = `${rName}_Remediation_${dashDate}.xlsx`;

    // Testcase Summary table labels
    const typeLabels = { BOOK: 'Total Books', PARAMETER_CHANGE: 'Total Parameters', CUBE_VIEW: 'Total Reports', DASHBOARD: 'Total Dashboards' };
    const typePerLabels = { BOOK: 'Testcases per Book', PARAMETER_CHANGE: 'Testcases per Parameter', CUBE_VIEW: 'Testcases per Report', DASHBOARD: 'Testcases per dashboard' };
    parsed.tc_cube_view.total_label = typeLabels[parsed.ticket_type] || 'Total Reports';
    parsed.tc_cube_view.tc_per_label = typePerLabels[parsed.ticket_type] || 'Testcases per Report';

    // Summary table numbers
    const modCount = Array.isArray(parsed.tc_cube_view.modules) ? parsed.tc_cube_view.modules.length : 0;
    const perReport = (modCount > 0 && Array.isArray(parsed.tc_cube_view.modules[0].checklist) && parsed.tc_cube_view.modules[0].checklist.length > 0)
      ? parsed.tc_cube_view.modules[0].checklist.length
      : 8;
    parsed.tc_cube_view.total_reports = modCount || 2;
    parsed.tc_cube_view.tc_per_report = perReport;
    parsed.tc_cube_view.total_testcase = parsed.tc_cube_view.total_reports * perReport;
  }

  return parsed;
}

export async function generateTestcases(formData) {
  const model = getModel();
  const prompt = buildPrompt(formData);

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('AI returned an empty response.');
    }

    return parseAndEnrich(rawText, formData);
  } catch (err) {
    if (err.message.includes('API_KEY') || err.message.includes('PERMISSION_DENIED')) {
      throw new Error('Invalid Gemini API key. Check your GEMINI_API_KEY configuration.');
    }
    if (err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please wait and retry.');
    }
    if (err.message.includes('DEADLINE_EXCEEDED') || err.message.includes('timeout')) {
      throw new Error('AI request timed out. Please retry with shorter input.');
    }
    throw err;
  }
}

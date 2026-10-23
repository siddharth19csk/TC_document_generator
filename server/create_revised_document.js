import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';

const basePath = 'c:/Users/siddharth.chandran/OneDrive - Quanta Services Management Partnership, L.P/Documents/Automation/R117-001-CubeView-Review.docx';
const outPath = 'c:/Users/siddharth.chandran/OneDrive - Quanta Services Management Partnership, L.P/Documents/Automation/CHG0057554_CubeView_TestCase_Review_Revised.docx';

const content = fs.readFileSync(basePath);
const zip = new PizZip(content);

// Helper XML builders
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function p(text, opts = {}) {
  const { bold = false, size = 22, color = '000000', align = 'left', spaceAfter = 120, italic = false } = opts;
  const jc = align !== 'left' ? `<w:jc w:val="${align}"/>` : '';
  const b = bold ? '<w:b/><w:bCs/>' : '';
  const it = italic ? '<w:i/><w:iCs/>' : '';
  const c = color ? `<w:color w:val="${color}"/>` : '';
  return `<w:p>
    <w:pPr>
      <w:spacing w:after="${spaceAfter}" w:line="240" w:lineRule="auto"/>
      ${jc}
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        ${b}${it}${c}
        <w:sz w:val="${size}"/>
        <w:szCs w:val="${size}"/>
      </w:rPr>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        ${b}${it}${c}
        <w:sz w:val="${size}"/>
        <w:szCs w:val="${size}"/>
      </w:rPr>
      <w:t xml:space="preserve">${esc(text)}</w:t>
    </w:r>
  </w:p>`;
}

function calloutBox(title, bodyLines) {
  const linesXml = bodyLines.map(line => `
    <w:p>
      <w:pPr>
        <w:spacing w:after="80" w:line="240" w:lineRule="auto"/>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
          <w:color w:val="2B2B2B"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
          <w:color w:val="2B2B2B"/>
        </w:rPr>
        <w:t xml:space="preserve">${esc(line)}</w:t>
      </w:r>
    </w:p>
  `).join('');

  return `
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="10254" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="12" w:space="0" w:color="D97706"/>
        <w:left w:val="single" w:sz="24" w:space="0" w:color="D97706"/>
        <w:bottom w:val="single" w:sz="12" w:space="0" w:color="D97706"/>
        <w:right w:val="single" w:sz="12" w:space="0" w:color="D97706"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="140" w:type="dxa"/>
        <w:left w:w="180" w:type="dxa"/>
        <w:bottom w:w="140" w:type="dxa"/>
        <w:right w:w="180" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="10254" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="FFFBEB"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:after="100"/>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
              <w:b/><w:bCs/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
              <w:color w:val="92400E"/>
            </w:rPr>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
              <w:b/><w:bCs/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
              <w:color w:val="92400E"/>
            </w:rPr>
            <w:t xml:space="preserve">${esc(title)}</w:t>
          </w:r>
        </w:p>
        ${linesXml}
      </w:tc>
    </w:tr>
  </w:tbl>
  <w:p><w:pPr><w:spacing w:after="140"/></w:pPr></w:p>`;
}

// Table cell builder
function tc(text, width, opts = {}) {
  const { bold = false, align = 'left', fill = null, italic = false, sz = 20, colSpan = 1 } = opts;
  const jc = align !== 'left' ? `<w:jc w:val="${align}"/>` : '';
  const b = bold ? '<w:b/><w:bCs/>' : '';
  const it = italic ? '<w:i/><w:iCs/>' : '';
  const shd = fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : '';
  const span = colSpan > 1 ? `<w:gridSpan w:val="${colSpan}"/>` : '';

  // Handle multi-line text separated by \n
  const paragraphs = String(text).split('\n').map((line, idx) => `
    <w:p>
      <w:pPr>
        <w:spacing w:after="${idx === String(text).split('\n').length - 1 ? '60' : '40'}" w:line="240" w:lineRule="auto"/>
        ${jc}
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
          ${b}${it}
          <w:sz w:val="${sz}"/>
          <w:szCs w:val="${sz}"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
          ${b}${it}
          <w:sz w:val="${sz}"/>
          <w:szCs w:val="${sz}"/>
        </w:rPr>
        <w:t xml:space="preserve">${esc(line)}</w:t>
      </w:r>
    </w:p>
  `).join('');

  return `<w:tc>
    <w:tcPr>
      <w:tcW w:w="${width}" w:type="dxa"/>
      ${span}
      <w:tcBorders>
        <w:top w:val="single" w:color="D1D5DB" w:sz="4" w:space="0"/>
        <w:left w:val="single" w:color="D1D5DB" w:sz="4" w:space="0"/>
        <w:bottom w:val="single" w:color="D1D5DB" w:sz="4" w:space="0"/>
        <w:right w:val="single" w:color="D1D5DB" w:sz="4" w:space="0"/>
      </w:tcBorders>
      <w:tcMar>
        <w:top w:w="80" w:type="dxa"/>
        <w:left w:w="120" w:type="dxa"/>
        <w:bottom w:w="80" w:type="dxa"/>
        <w:right w:w="120" w:type="dxa"/>
      </w:tcMar>
      ${shd}
    </w:tcPr>
    ${paragraphs}
  </w:tc>`;
}

// Checklist Table Generator
function buildChecklistTable(moduleNumber, moduleName, categoryLabel, items) {
  let rows = '';

  // Header Row
  rows += `<w:tr>
    <w:trPr><w:tblHeader/></w:trPr>
    ${tc('S. No.', 928, { bold: true, align: 'center', fill: 'F3F4F6', sz: 20 })}
    ${tc('Parameter / Test Focus', 6222, { bold: true, fill: 'F3F4F6', sz: 20 })}
    ${tc('Yes', 953, { bold: true, align: 'center', fill: 'F3F4F6', sz: 20 })}
    ${tc('No', 1043, { bold: true, align: 'center', fill: 'F3F4F6', sz: 20 })}
    ${tc('N/A', 1108, { bold: true, align: 'center', fill: 'F3F4F6', sz: 20 })}
  </w:tr>`;

  // Category Subheading Row
  rows += `<w:tr>
    ${tc('A', 928, { bold: true, align: 'center', fill: 'E5E7EB', sz: 20 })}
    ${tc(categoryLabel, 6222, { bold: true, fill: 'E5E7EB', sz: 20 })}
    ${tc('', 953, { fill: 'E5E7EB' })}
    ${tc('', 1043, { fill: 'E5E7EB' })}
    ${tc('', 1108, { fill: 'E5E7EB' })}
  </w:tr>`;

  // Item rows
  items.forEach((item, idx) => {
    rows += `<w:tr>
      ${tc(String(idx + 1), 928, { bold: true, align: 'center', sz: 20 })}
      ${tc(item.parameter + (item.note ? `\n[Scope: ${item.note}]` : ''), 6222, { sz: 20 })}
      ${tc(item.yes || '[ ]', 953, { align: 'center', sz: 18 })}
      ${tc(item.no || '[ ]', 1043, { align: 'center', sz: 18 })}
      ${tc(item.na || '[ ]', 1108, { align: 'center', sz: 18 })}
    </w:tr>`;
  });

  return `
  ${p(`${moduleNumber}. ${moduleName}`, { bold: true, size: 24, spaceAfter: 80 })}
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="10254" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:left w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:bottom w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:right w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
      </w:tblBorders>
    </w:tblPr>
    ${rows}
  </w:tbl>
  <w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`;
}

// Build Traceable Test Cases Table
function buildTraceableTestCasesTable(testCases) {
  let rows = '';

  // Header Row
  rows += `<w:tr>
    <w:trPr><w:tblHeader/></w:trPr>
    ${tc('TC ID', 1400, { bold: true, align: 'center', fill: '1E3A8A', color: 'FFFFFF', sz: 18 })}
    ${tc('Report / View', 1400, { bold: true, align: 'center', fill: '1E3A8A', color: 'FFFFFF', sz: 18 })}
    ${tc('Test Scenario & Detailed Steps', 4454, { bold: true, fill: '1E3A8A', color: 'FFFFFF', sz: 18 })}
    ${tc('Expected vs Actual Result', 2000, { bold: true, fill: '1E3A8A', color: 'FFFFFF', sz: 18 })}
    ${tc('Status', 1000, { bold: true, align: 'center', fill: '1E3A8A', color: 'FFFFFF', sz: 18 })}
  </w:tr>`;

  testCases.forEach((tcItem, idx) => {
    const fill = idx % 2 === 1 ? 'F9FAFB' : 'FFFFFF';
    const statusFill = tcItem.status.includes('Pending') ? 'FEF3C7' : 'FFFFFF';
    
    const scenarioContent = `Scenario: ${tcItem.scenario}\n` +
      `Preconditions: ${tcItem.preconditions}\n` +
      `Steps:\n${tcItem.steps}\n` +
      `Test Data/POV: ${tcItem.testData}\n` +
      `Priority: ${tcItem.priority} | CR: ${tcItem.crId}`;

    const resultsContent = `Expected: ${tcItem.expectedResult}\n\n` +
      `Actual: ${tcItem.actualResult}\n` +
      `Evidence: ${tcItem.evidence}`;

    rows += `<w:tr>
      ${tc(tcItem.id, 1400, { bold: true, align: 'center', fill, sz: 18 })}
      ${tc(tcItem.report, 1400, { bold: true, fill, sz: 18 })}
      ${tc(scenarioContent, 4454, { fill, sz: 17 })}
      ${tc(resultsContent, 2000, { fill, sz: 17 })}
      ${tc(tcItem.status, 1000, { bold: true, align: 'center', fill: statusFill, sz: 17 })}
    </w:tr>`;
  });

  return `
  ${p('4. Actionable & Traceable Test Case Specifications (CHG0057554)', { bold: true, size: 24, spaceAfter: 80 })}
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="10254" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:left w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:bottom w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:right w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
      </w:tblBorders>
    </w:tblPr>
    ${rows}
  </w:tbl>
  <w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`;
}

console.log('Building document body...');

// Data definitions
const checklistModule1 = [
  { parameter: 'Verify displayed data values match the approved data source (ERP/General Ledger) across confirmed reporting periods.', note: 'PWRJOB_RPT_15 & PWRJOB_RPT_16' },
  { parameter: 'Confirm Point of View (POV) selections (Entity, Scenario, Time, Currency) resolve to correct member intersections.', note: 'Applies to all valid POV dimensions' },
  { parameter: 'Validate calculation rules, custom member formulas, and hierarchical rollups produce exact mathematical totals.', note: 'Parent-child aggregation check' },
  { parameter: 'Test handling of boundary conditions: zero values, negative numbers, missing periods, and large currency values.', note: 'Boundary testing' },
  { parameter: 'Validate drill-through capability from summarized cube view cells to underlying transactional detail records.', note: 'Drill-through integrity' },
  { parameter: 'Verify that requested changes to PWRJOB_RPT_15 and PWRJOB_RPT_16 do NOT cause regressions in unrelated Cube Views.', note: 'Regression verification' }
];

const checklistModule2 = [
  { parameter: 'Confirm correct display of all dimension headers, row members, column expansions, and member aliases.', note: 'Layout & Hierarchy display' },
  { parameter: 'Verify Point of View (POV) user prompt controls dynamically update the displayed member set without UI clipping.', note: 'POV dynamic behavior' },
  { parameter: 'Validate formatting rules: decimal precision (2 decimal places), thousands separators, and currency symbols.', note: 'Number and currency formatting' },
  { parameter: 'Verify zero and missing-data suppression rules hide inactive/no-data rows while preserving active rows.', note: 'Suppression threshold' },
  { parameter: 'Verify header branding, column title alignment, report date timestamps, and pagination formatting.', note: 'Visual styling & consistency' },
  { parameter: 'Confirm layout changes do not introduce overlapping text, clipped table cells, or distorted column widths.', note: 'UI geometry check' }
];

const checklistModule3 = [
  { parameter: 'Assess report load, data retrieval, and refresh execution times across standard and large data volumes.', note: 'Benchmark: Refresh < 10s' },
  { parameter: 'Validate Excel export fidelity: verify formulas, formatting, numbers, and layout match on-screen Cube View.', note: 'Excel export verification' },
  { parameter: 'Validate PDF export: ensure printable layout fits within portrait/landscape bounds without truncated columns.', note: 'PDF export verification' },
  { parameter: 'Confirm user role permissions restrict access to sensitive financial metrics according to security matrix.', note: 'Security & Access control' }
];

const traceableTestCases = [
  // --- Category A: Data Accuracy & Calculations ---
  {
    id: 'TC-CHG0057554-001',
    crId: 'CHG0057554',
    report: 'PWRJOB_RPT_15',
    scenario: 'Source Reconciliation & Data Intersection Accuracy for PWRJOB_RPT_15',
    preconditions: 'Cube View PWRJOB_RPT_15 deployed to UAT/Staging environment; source data loaded.',
    steps: '1. Launch OneStream and open Cube View PWRJOB_RPT_15.\n2. Set POV to standard baseline period (e.g., 2026M10, Actual, Local).\n3. Extract data values for sample accounts.\n4. Compare values against General Ledger source query.',
    testData: 'POV: Entity: Consolidated; Scenario: Actual; Time: 2026M10; Accounts: Revenue, Labor, Material.',
    expectedResult: 'All displayed values match source GL balances with zero variance.',
    actualResult: 'Pending Execution (Awaiting deployment to UAT environment).',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending tester run log & reconciliation sheet.'
  },
  {
    id: 'TC-CHG0057554-002',
    crId: 'CHG0057554',
    report: 'PWRJOB_RPT_16',
    scenario: 'Source Reconciliation & Data Intersection Accuracy for PWRJOB_RPT_16',
    preconditions: 'Cube View PWRJOB_RPT_16 deployed to UAT/Staging environment with active data.',
    steps: '1. Open Cube View PWRJOB_RPT_16.\n2. Select target operating entity and current reporting month.\n3. Verify job costing and margin balances against staging ledger.\n4. Confirm zero discrepancies across base members.',
    testData: 'POV: Entity: Operating Entity; Scenario: Actual; Time: 2026M10; Metric: Job Margin.',
    expectedResult: 'Job margin and cost metrics reconcile exactly to source staging tables.',
    actualResult: 'Pending Execution (Awaiting test environment deployment).',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending GL reconciliation export.'
  },
  {
    id: 'TC-CHG0057554-003',
    crId: 'CHG0057554',
    report: 'PWRJOB_RPT_15',
    scenario: 'Aggregation & Dynamic Parent Rollup Calculations',
    preconditions: 'Hierarchical account dimensions configured with parent rollups.',
    steps: '1. In PWRJOB_RPT_15, expand Parent Accounts to reveal Base level children.\n2. Sum base children manually or via Excel.\n3. Validate parent summary row equals sum of base children.\n4. Repeat for multi-period quarterly/YTD aggregations.',
    testData: 'Parent Account: Total Direct Costs; Children: Labor, Equipment, Subcontractor.',
    expectedResult: 'Parent total matches sum of children across all periods without rounding errors.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending calculation audit trace.'
  },
  {
    id: 'TC-CHG0057554-004',
    crId: 'CHG0057554',
    report: 'PWRJOB_RPT_16',
    scenario: 'Boundary Conditions, Zero Values & #MISSING Cell Handling',
    preconditions: 'Data intersections containing zeros, nulls, and negative cost adjustments available.',
    steps: '1. Set POV to a newly created job code with no transactions.\n2. Verify cells display designated default (blank or 0.00) without throwing #MISSING or script errors.\n3. Input test credit adjustment (negative value) and verify negative formatting.',
    testData: 'POV: New Inactive Job; Adjustments: Negative cost credit ($ -1,250.00).',
    expectedResult: 'No script exceptions; unpopulated cells handle nulls gracefully; negatives show in parentheses.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'Medium',
    evidence: 'Pending screenshot of zero/negative rows.'
  },
  {
    id: 'TC-CHG0057554-005',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Drill-Through Transactional Audit Validation',
    preconditions: 'Drill-through rule enabled on Cube View data cells.',
    steps: '1. Right-click on a summarized revenue/cost cell in PWRJOB_RPT_15 and PWRJOB_RPT_16.\n2. Select "Drill Through to Source".\n3. Verify transaction drill grid opens and lists underlying journal entries.',
    testData: 'Data Cell: Current Month Operating Expenses.',
    expectedResult: 'Drill table displays individual journal lines summing to cell amount.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'Medium',
    evidence: 'Pending drill-through grid export.'
  },
  {
    id: 'TC-CHG0057554-006',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Regression Check on Non-Modified Cube Views',
    preconditions: 'Baseline reports (e.g., PWRJOB_RPT_01 through 14) accessible in same workspace.',
    steps: '1. Run standard regression queries on adjacent Cube Views.\n2. Verify shared dimensions, global member formulas, or common rule sets were not impacted by CHG0057554 changes.\n3. Validate baseline totals match prior month signed-off snapshots.',
    testData: 'Reference Reports: PWRJOB_RPT_01, PWRALL_KEY_03.',
    expectedResult: 'Zero variance in non-modified Cube Views; no collateral calculation changes.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending regression comparison log.'
  },

  // --- Category B: Layout, Formatting & Suppression ---
  {
    id: 'TC-CHG0057554-007',
    crId: 'CHG0057554',
    report: 'PWRJOB_RPT_15',
    scenario: 'Dimension Member Display, Column Layout & Header Validation',
    preconditions: 'Updated layout definition deployed for PWRJOB_RPT_15.',
    steps: '1. Open PWRJOB_RPT_15 and inspect column headers, widths, and row labels.\n2. Confirm requested layout changes (margins, column widths, member descriptions) display correctly.\n3. Verify column headers remain aligned above data columns.',
    testData: 'Standard desktop screen resolution (1920x1080) and 100% DPI.',
    expectedResult: 'Layout renders cleanly with proper column alignment and no text truncation.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending layout capture screenshot.'
  },
  {
    id: 'TC-CHG0057554-008',
    crId: 'CHG0057554',
    report: 'PWRJOB_RPT_16',
    scenario: 'Dimension Member Display, Column Layout & Header Validation',
    preconditions: 'Updated layout definition deployed for PWRJOB_RPT_16.',
    steps: '1. Open PWRJOB_RPT_16 and verify column headers, row descriptions, and margin alignments.\n2. Verify that updated column specifications match the change design specification.',
    testData: 'Standard desktop screen resolution (1920x1080).',
    expectedResult: 'All columns match design specification; member headers clearly visible.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending layout capture screenshot.'
  },
  {
    id: 'TC-CHG0057554-009',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Dynamic Point of View (POV) Selection & Parameter Responsiveness',
    preconditions: 'POV drop-down selectors active on both Cube Views.',
    steps: '1. Change Time POV from 2026M09 to 2026M10.\n2. Change Entity POV between different active branches.\n3. Confirm Cube View refreshes immediately and displays data for selected POV.',
    testData: 'POV Switch: Entity A -> Entity B; Time 2026M09 -> 2026M10.',
    expectedResult: 'POV change triggers automated refresh with correct filtered data.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'Medium',
    evidence: 'Pending POV test recording.'
  },
  {
    id: 'TC-CHG0057554-010',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Number Formatting, Decimals, Currency Symbols & Alignment Rules',
    preconditions: 'Formatting profile assigned to Cube View columns.',
    steps: '1. Inspect financial metric columns (Revenue, Margin, Cost).\n2. Verify numbers display 2 decimal places, comma thousands separators, and correct currency symbols.\n3. Verify percentage columns display with % sign and 1 decimal place.\n4. Check numbers are right-aligned and text is left-aligned.',
    testData: 'Sample values: $ 1,425,890.50; Margin %: 18.5%.',
    expectedResult: 'All numbers format consistently according to corporate presentation standards.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'Medium',
    evidence: 'Pending formatting review capture.'
  },
  {
    id: 'TC-CHG0057554-011',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Zero & Missing Data Suppression Rule Verification',
    preconditions: 'Row suppression enabled for zero and empty records.',
    steps: '1. Navigate to a reporting period containing inactive job codes with zero transactions.\n2. Verify inactive job rows are automatically suppressed.\n3. Toggle suppression off (if user parameter available) to verify underlying structure remains intact.\n4. Ensure rows with valid non-zero data remain visible.',
    testData: 'Filter condition: Suppress Zero and No Data Rows.',
    expectedResult: 'Zero/empty rows are suppressed cleanly; active rows remain fully intact.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'Medium',
    evidence: 'Pending suppression test log.'
  },
  {
    id: 'TC-CHG0057554-012',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Report Headers, Branding, Date Timestamps & Pagination',
    preconditions: 'Cube View headers configured with standard dynamic variables.',
    steps: '1. Inspect the top header block of PWRJOB_RPT_15 and PWRJOB_RPT_16.\n2. Verify report title, company name, generation timestamp, and user ID are populated.\n3. Validate page numbering (e.g. Page 1 of 3) across multiple pages.',
    testData: 'Variables: |WFEntity|, |WFTime|, |CurrentUser|.',
    expectedResult: 'Header variables resolve accurately; layout matches official corporate branding.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'Low',
    evidence: 'Pending header snapshot.'
  },

  // --- Category C: Performance & Export ---
  {
    id: 'TC-CHG0057554-013',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Cube View Load Time & Refresh Performance Validation',
    preconditions: 'Staging environment under normal business user concurrency.',
    steps: '1. Clear browser cache and launch Cube View PWRJOB_RPT_15.\n2. Record initial load duration.\n3. Perform data refresh across 12-month trailing POV.\n4. Repeat for PWRJOB_RPT_16 and record response times.',
    testData: 'Time Range: 12-Month Consolidated POV; Concurrency: Normal.',
    expectedResult: 'Initial load executes under 8 seconds; subsequent POV refresh executes under 5 seconds.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending performance stopwatch log.'
  },
  {
    id: 'TC-CHG0057554-014',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Excel Export Data Integrity & Layout Alignment Verification',
    preconditions: 'OneStream Excel Add-In or standard Web Export enabled.',
    steps: '1. Open PWRJOB_RPT_15 and click "Export to Excel".\n2. Open exported .xlsx workbook.\n3. Validate every data cell matches the on-screen Cube View values.\n4. Check column widths, formatting, and number types (stored as numbers, not text).\n5. Repeat for PWRJOB_RPT_16.',
    testData: 'Export format: Microsoft Excel (.xlsx).',
    expectedResult: 'Excel workbook matches on-screen report 100%; numerical formulas evaluate correctly.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending exported sample workbook.'
  },
  {
    id: 'TC-CHG0057554-015',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'PDF Export & Print Layout Bounds Verification',
    preconditions: 'Print layout profile configured for Cube View.',
    steps: '1. Click "Export to PDF" on PWRJOB_RPT_15 and PWRJOB_RPT_16.\n2. Inspect PDF output in Adobe Acrobat.\n3. Verify all columns fit within paper bounds without horizontal column splitting.\n4. Confirm repeating table headers appear at top of each exported page.',
    testData: 'Page Setup: Landscape, Letter, Fit All Columns on One Page.',
    expectedResult: 'PDF renders cleanly without clipped columns; repeating headers present on page 2+.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'Medium',
    evidence: 'Pending exported PDF file.'
  },
  {
    id: 'TC-CHG0057554-016',
    crId: 'CHG0057554',
    report: 'Shared (PWRJOB_RPT_15 & 16)',
    scenario: 'Security Matrix & Role-Based Access Restriction Verification',
    preconditions: 'Test accounts with distinct security roles (e.g., Financial Analyst vs Read-Only User).',
    steps: '1. Log in with restricted user account and attempt to access PWRJOB_RPT_15 and PWRJOB_RPT_16.\n2. Verify unauthorized entity data is masked or blocked.\n3. Log in with authorized review role and confirm full visibility.',
    testData: 'Roles: Role_Finance_Read, Role_Restricted_Entity.',
    expectedResult: 'Access restrictions strictly enforced; unauthorized users cannot access restricted cost pools.',
    actualResult: 'Pending Execution.',
    status: 'Not Executed / Pending',
    priority: 'High',
    evidence: 'Pending security audit confirmation.'
  }
];

// Document Title & Metadata Block
let body = `
  ${p('TESTCASE REVIEW - CHG0057554', { bold: true, size: 36, align: 'center', spaceAfter: 200, color: '1E3A8A' })}
  ${p('OneStream Cube View Quality Assurance & Validation Plan', { italic: true, size: 22, align: 'center', spaceAfter: 240, color: '4B5563' })}
  
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="10254" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
        <w:left w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
        <w:bottom w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
        <w:right w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="80" w:type="dxa"/>
        <w:left w:w="120" w:type="dxa"/>
        <w:bottom w:w="80" w:type="dxa"/>
        <w:right w:w="120" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    <w:tr>
      ${tc('Change Request ID:', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('CHG0057554', 7754, { bold: true })}
    </w:tr>
    <w:tr>
      ${tc('CR Description (As Supplied):', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('Update PWRJOB_RPT_15, PWRJOB_RPT_15, & PWRJOB_RPT_16 [Duplicate Flagged]', 7754)}
    </w:tr>
    <w:tr>
      ${tc('Internal Project / Reference:', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('R117 (OneStream Reporting Workstream - Internal Track Identifier)', 7754)}
    </w:tr>
    <w:tr>
      ${tc('In-Scope Cube Views / Reports:', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('1. PWRJOB_RPT_15 (Confirmed)\n2. PWRJOB_RPT_15 (Duplicate Entry - Flagged for Confirmation)\n3. PWRJOB_RPT_16 (Confirmed)', 7754)}
    </w:tr>
    <w:tr>
      ${tc('Reviewer Name:', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('Sid (QA Reviewer - Provisional)', 7754)}
    </w:tr>
    <w:tr>
      ${tc('Document Revision Date:', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('22 October 2026', 7754)}
    </w:tr>
    <w:tr>
      ${tc('Document Status:', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('Draft / Pending Review (Unexecuted Preliminary Test Plan)', 7754, { bold: true, color: 'B45309' })}
    </w:tr>
    <w:tr>
      ${tc('Document Purpose & Classification:', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('Preliminary Test Plan & Quality Assurance Review for Change Request CHG0057554', 7754)}
    </w:tr>
  </w:tbl>
  <w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>
`;

// Callout Box 1: Flagged Duplicate Report Name
body += calloutBox('CRITICAL AUDIT NOTICE — DUPLICATE REPORT NAME FLAGGED FOR CONFIRMATION', [
  '• Observation: The report identifier "PWRJOB_RPT_15" appears twice in the supplied Change Request description ("Update PWRJOB_RPT_15, PWRJOB_RPT_15, & PWRJOB_RPT_16").',
  '• Change Management Protocol: The wording has been preserved exactly as supplied. As a quality safeguard, this document flags the duplicate for formal technical confirmation prior to execution sign-off.',
  '• Action Required: Technical Lead / Business Analyst must confirm whether the second occurrence is an inadvertent typo for another report (e.g., PWRJOB_RPT_14, PWRJOB_RPT_17) or represents two distinct executions/parameters for PWRJOB_RPT_15.'
]);

// Callout Box 2: Missing Requirements / Preliminary Test Plan
body += calloutBox('PRELIMINARY TEST PLAN — MISSING DETAILS REQUIRED TO FINALIZE EXECUTION', [
  'Because the supplied Change Request provides only the high-level title, this document is formally classified as a Preliminary Test Plan. The following technical specifications must be provided to complete execution:',
  '1. Specific Update Criteria: Details on specific column formatting, margin adjustments, member formula updates, or dimension modifications requested for PWRJOB_RPT_15 and PWRJOB_RPT_16.',
  '2. Target Environment & POVs: The designated Staging/UAT environment URL and test Point of View (POV) intersections (Entity, Scenario, Time periods).',
  '3. Source Data Baselines: Expected financial balances and source GL queries to validate numerical reconciliation.',
  '4. Remediation Workbook: The remediation Excel file referenced below is currently pending upload in the project repository.'
]);

// Reconciled Summary Table
body += `
  ${p('Test Case Scope & Execution Summary Table', { bold: true, size: 24, spaceAfter: 80 })}
  ${p('Summary figures recalculated based on the actual traceable test cases defined in this document:', { italic: true, size: 20, spaceAfter: 80, color: '6B7280' })}
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="10254" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:left w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:bottom w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:right w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:trPr><w:tblHeader/></w:trPr>
      ${tc('S. No.', 928, { bold: true, align: 'center', fill: 'F3F4F6' })}
      ${tc('Scope & Report Breakdown', 4326, { bold: true, fill: 'F3F4F6' })}
      ${tc('Review Status', 2000, { bold: true, align: 'center', fill: 'F3F4F6' })}
      ${tc('TC Allocated', 1500, { bold: true, align: 'center', fill: 'F3F4F6' })}
      ${tc('Total Testcase', 1500, { bold: true, align: 'center', fill: 'F3F4F6' })}
    </w:tr>
    <w:tr>
      ${tc('1', 928, { bold: true, align: 'center' })}
      ${tc('PWRJOB_RPT_15 (Confirmed In-Scope)', 4326, { bold: true })}
      ${tc('Pending Execution', 2000, { align: 'center', fill: 'FEF3C7' })}
      ${tc('8', 1500, { align: 'center' })}
      ${tc('8', 1500, { align: 'center' })}
    </w:tr>
    <w:tr>
      ${tc('2', 928, { bold: true, align: 'center' })}
      ${tc('PWRJOB_RPT_15 (Duplicate Entry — Flagged for Confirmation)', 4326, { italic: true, color: 'B45309' })}
      ${tc('Flagged / Provisional', 2000, { align: 'center', fill: 'FEF3C7', italic: true })}
      ${tc('—', 1500, { align: 'center' })}
      ${tc('—', 1500, { align: 'center' })}
    </w:tr>
    <w:tr>
      ${tc('3', 928, { bold: true, align: 'center' })}
      ${tc('PWRJOB_RPT_16 (Confirmed In-Scope)', 4326, { bold: true })}
      ${tc('Pending Execution', 2000, { align: 'center', fill: 'FEF3C7' })}
      ${tc('8', 1500, { align: 'center' })}
      ${tc('8', 1500, { align: 'center' })}
    </w:tr>
    <w:tr>
      ${tc('Total', 928, { bold: true, align: 'center', fill: 'E5E7EB' })}
      ${tc('Reconciled Scope: 2 Distinct Confirmed Reports (1 Duplicate Flagged)', 4326, { bold: true, fill: 'E5E7EB' })}
      ${tc('Draft / Pending Review', 2000, { bold: true, align: 'center', fill: 'E5E7EB' })}
      ${tc('8 (Average)', 1500, { bold: true, align: 'center', fill: 'E5E7EB' })}
      ${tc('16', 1500, { bold: true, align: 'center', fill: 'E5E7EB' })}
    </w:tr>
  </w:tbl>
  ${p('*Note: The previous document stated Total Reports: 3, TC per Report: 5, Total Testcase: 14 (which was mathematically inconsistent). The table above completely reconciles: 2 confirmed reports × 8 test cases each = 16 total test cases.', { italic: true, size: 18, spaceAfter: 200, color: '6B7280' })}
`;

// Checklist Sections
body += p('Core Quality Review Categories & Parameter Checklists', { bold: true, size: 28, spaceAfter: 120, color: '1E3A8A' });
body += p('The three standard review categories have been retained and refined. All checklist boxes have been reset to [ ] (Unexecuted) in strict compliance with Section 7 — no test is marked Approved or Yes without recorded verification evidence.', { italic: true, size: 20, spaceAfter: 140, color: '4B5563' });

body += buildChecklistTable('1', 'Data Accuracy & Calculations', 'Data Validation & Numerical Accuracy Parameters', checklistModule1);
body += buildChecklistTable('2', 'Layout, Formatting & Suppression', 'Visual, Suppression & Presentation Parameters', checklistModule2);
body += buildChecklistTable('3', 'Performance & Export', 'System Reliability, Security & File Export Parameters', checklistModule3);

// Traceable Test Cases Table
body += buildTraceableTestCasesTable(traceableTestCases);

// Remediation & Evidence Section
body += `
  ${p('5. Evidence & Remediation Reference', { bold: true, size: 24, spaceAfter: 80, color: '1E3A8A' })}
  ${p('Please refer to the link below for the changes made to the report:', { size: 22, spaceAfter: 60 })}
  ${p('PWRJOB_RPT_15_16_Remediation_22-10-2026.xlsx', { bold: true, size: 22, color: '2563EB', italic: true, spaceAfter: 100 })}
  
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="10254" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
        <w:left w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
        <w:bottom w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
        <w:right w:val="single" w:color="D1D5DB" w:sz="6" w:space="0"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      ${tc('Remediation Workbook Status:', 3000, { bold: true, fill: 'F3F4F6' })}
      ${tc('PENDING VERIFICATION — File Not Found in Project Workspace', 7254, { bold: true, color: 'DC2626' })}
    </w:tr>
    <w:tr>
      ${tc('Audit Verification Note:', 3000, { bold: true, fill: 'F3F4F6' })}
      ${tc('In strict accordance with Section 8, the referenced remediation workbook (originally cited as R117_Remediation_22-10-2026.xlsx) was searched in the project workspace and confirmed to be UNAVAILABLE. As mandated, this reference is marked as PENDING and has NOT been claimed as verified.', 7254)}
    </w:tr>
    <w:tr>
      ${tc('Execution Evidence Repository:', 3000, { bold: true, fill: 'F3F4F6' })}
      ${tc('Screenshots, execution logs, and export workbooks must be archived in SharePoint under: /OneStream/Remediation Logs/CHG0057554/ upon actual test execution.', 7254)}
    </w:tr>
  </w:tbl>
  <w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>
`;

// Sign-off Block
body += `
  ${p('6. Review & Approval Sign-Off Block', { bold: true, size: 24, spaceAfter: 80, color: '1E3A8A' })}
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="10254" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:left w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:bottom w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
        <w:right w:val="single" w:color="9CA3AF" w:sz="6" w:space="0"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:trPr><w:tblHeader/></w:trPr>
      ${tc('Role', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('Name & Title', 3000, { bold: true, fill: 'F3F4F6' })}
      ${tc('Status / Decision', 2500, { bold: true, fill: 'F3F4F6' })}
      ${tc('Date & Signature', 2254, { bold: true, fill: 'F3F4F6' })}
    </w:tr>
    <w:tr>
      ${tc('QA Reviewer / Author', 2500, { bold: true })}
      ${tc('Sid (QA Review Team)', 3000)}
      ${tc('Draft Prepared (Pending Execution)', 2500, { fill: 'FEF3C7' })}
      ${tc('22-Oct-2026 [Provisional]', 2254)}
    </w:tr>
    <w:tr>
      ${tc('Technical Lead', 2500, { bold: true })}
      ${tc('Pending Assignment', 3000, { italic: true })}
      ${tc('Pending Confirmation of Duplicate CR Scope', 2500, { fill: 'FEF3C7', italic: true })}
      ${tc('Pending', 2254, { italic: true })}
    </w:tr>
    <w:tr>
      ${tc('Business / System Approver', 2500, { bold: true })}
      ${tc('Pending Assignment', 3000, { italic: true })}
      ${tc('Pending Test Execution Sign-off', 2500, { fill: 'FEF3C7', italic: true })}
      ${tc('Pending', 2254, { italic: true })}
    </w:tr>
  </w:tbl>
  <w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>
`;

// Final XML assembly
const documentXml = `<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16du="http://schemas.microsoft.com/office/word/2023/wordml/du" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16se="http://schemas.microsoft.com/office/word/2024/wordml/selection" xmlns:w16curuser="http://schemas.microsoft.com/office/word/2024/wordml/curuser" xmlns:w17="http://schemas.microsoft.com/office/word/2025/wordml" xmlns:w18="http://schemas.microsoft.com/office/word/2026/wordml" xmlns:w19="http://schemas.microsoft.com/office/word/2027/wordml" xmlns:w20="http://schemas.microsoft.com/office/word/2028/wordml" xmlns:w21="http://schemas.microsoft.com/office/word/2029/wordml" xmlns:w22="http://schemas.microsoft.com/office/word/2030/wordml" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16du w16curuser w17 w18 w19 w20 w21 w22">
  <w:body>
    ${body}
    <w:sectPr w:rsidR="00CD3DB1">
      <w:pgSz w:w="12240" w:h="15840" w:orient="portrait"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;

zip.file('word/document.xml', documentXml);

const buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(outPath, buffer);
console.log('SUCCESS: Revised document created at:', outPath);
console.log('File size:', buffer.length, 'bytes');

/**
 * tag_dashboard_template.js
 * Converts the reference Dashboard testcase document into a
 * docxtemplater-compatible tagged template.
 * Run once from the project root:
 *   node server/tag_dashboard_template.js
 */
import fs from "fs";
import path from "path";
import PizZip from "pizzip";

const inputDocx = "c:/Users/siddharth.chandran/OneDrive - Quanta Services Management Partnership, L.P/Documents/Automation/Dashboard/R168-Forecast reports in workflow (RptgGrp_Dashboard)-Testcase Document.docx";
const outputDocx = path.resolve("templates/TC_DASHBOARD_TEMPLATE_TAGGED.docx");

const content = fs.readFileSync(inputDocx);
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();

console.log("XML length:", xml.length);

// 1. Title paragraph - look for title text
const titleRegex = /<w:p\b[^>]*>(?:<(?!\/w:p)[^>]*>)*[^<]*(?:ONESTREAM|DASHBOARD TASK REVIEW)[^<]*(?:<[^>]*>)*<\/w:p>/i;
const titleMatch = xml.match(titleRegex);
if (titleMatch) {
  const newTitle = '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:b w:val="1"/><w:sz w:val="36"/><w:u w:val="single"/></w:rPr><w:t>{doc_title}</w:t></w:r></w:p>';
  xml = xml.replace(titleMatch[0], newTitle);
  console.log("+ Title tagged");
} else {
  // Fallback: find paragraphs containing title-like text splits across runs
  xml = xml.replace(/(<w:t[^>]*>)(ONESTREAM DASHBOARD TASK REVIEW CHECKLIST)(<\/w:t>)/, "$1{doc_title}$3");
  console.log("~ Title fallback: replace run text directly");
}

// 2. Project Name
if (xml.includes("Quanta - OneStream")) {
  xml = xml.replace("<w:t>Quanta - OneStream</w:t>", "<w:t>{project_name}</w:t>");
  console.log("+ Project name tagged");
} else {
  console.log("! Quanta - OneStream not found");
}

// 3. Reviewer Name
const reviewerNames = ["Priya Kamaraj", "Siddharth Chandran"];
let rTagged = false;
for (const rn of reviewerNames) {
  if (xml.includes(rn)) {
    xml = xml.replace("<w:t>" + rn + "</w:t>", "<w:t>{reviewer_name}</w:t>");
    console.log("+ Reviewer name tagged: " + rn);
    rTagged = true;
    break;
  }
}
if (!rTagged) console.log("! Reviewer name not found");

// 4. Review Date paragraph
const rdMatch = xml.match(/<w:p\b[^>]*>[\s\S]*?Review[\s\S]*?Date[\s\S]*?<\/w:p>/i);
if (rdMatch) {
  const newDate = '<w:p><w:pPr><w:spacing w:before="240" w:after="240"/></w:pPr><w:r><w:rPr><w:b w:val="1"/></w:rPr><w:t xml:space="preserve">Review Date: </w:t></w:r><w:r><w:t>{review_date}</w:t></w:r></w:p>';
  xml = xml.replace(rdMatch[0], newDate);
  console.log("+ Review date tagged");
} else console.log("! Review Date para not found");

// 5. Status paragraph
const stMatch = xml.match(/<w:p\b[^>]*>[\s\S]*?Status:[\s\S]*?<\/w:p>/i);
if (stMatch) {
  const newStatus = '<w:p><w:pPr><w:spacing w:before="240" w:after="240"/></w:pPr><w:r><w:rPr><w:b w:val="1"/></w:rPr><w:t xml:space="preserve">Status: </w:t></w:r><w:r><w:t>{status}</w:t></w:r></w:p>';
  xml = xml.replace(stMatch[0], newStatus);
  console.log("+ Status tagged");
} else console.log("! Status para not found");

// 6. Table 1 - Summary
const t1Start = xml.indexOf("<w:tbl>");
const t1End = xml.indexOf("</w:tbl>") + 8;
let t1Xml = xml.substring(t1Start, t1End);

t1Xml = t1Xml
  .replace(/<w:t>Total Dashboards<\/w:t>/, "<w:t>{total_label}</w:t>")
  .replace(/<w:t>Testcases per dashboard<\/w:t>/, "<w:t>{tc_per_label}</w:t>");

const t1Rows = t1Xml.match(/<w:tr[\s\S]*?<\/w:tr>/g);
if (t1Rows && t1Rows.length >= 2) {
  let row2 = t1Rows[1];
  const cells = row2.match(/<w:tc[\s\S]*?<\/w:tc>/g);
  if (cells && cells.length >= 4) {
    let r2new = row2
      .replace(cells[1], cells[1].replace(/<w:t[^>]*>[\s\S]*?<\/w:t>/, "<w:t>{total_reports}</w:t>"))
      .replace(cells[2], cells[2].replace(/<w:t[^>]*>[\s\S]*?<\/w:t>/, "<w:t>{tc_per_report}</w:t>"))
      .replace(cells[3], cells[3].replace(/<w:t[^>]*>[\s\S]*?<\/w:t>/, "<w:t>{total_testcase}</w:t>"));
    t1Xml = t1Xml.replace(t1Rows[1], r2new);
    console.log("+ Table 1 values tagged");
  } else {
    console.log("! Table 1 row 2 cell count:", cells ? cells.length : 0);
  }
}

xml = xml.substring(0, t1Start) + t1Xml + xml.substring(t1End);

// 7. Table 2 - Checklist
const t2Start = xml.indexOf("<w:tbl>", t1Start + t1Xml.length);
const t2End = xml.indexOf("</w:tbl>", t2Start) + 8;
let t2Xml = xml.substring(t2Start, t2End);

// Category label
t2Xml = t2Xml.replace(/<w:t[^>]*>Dashboard[\s\S]*?Updation<\/w:t>/, "<w:t>{category_label}</w:t>");

const t2Rows = t2Xml.match(/<w:tr[\s\S]*?<\/w:tr>/g);
console.log("Table 2 rows:", t2Rows ? t2Rows.length : 0);

if (t2Rows && t2Rows.length >= 3) {
  let templateRow = t2Rows[2];
  const tCells = templateRow.match(/<w:tc[\s\S]*?<\/w:tc>/g);
  console.log("Template row cells:", tCells ? tCells.length : 0);

  if (tCells && tCells.length >= 5) {
    const c0 = tCells[0].replace(/<w:t[^>]*>[\s\S]*?<\/w:t>/, "<w:t>{sno}</w:t>");
    const c1 = tCells[1].replace(
      /(<w:tcPr>[\s\S]*?<\/w:tcPr>)[\s\S]*?(<\/w:tc>)/,
      (m, pr, end) => pr + '<w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:t>{parameter}</w:t></w:r></w:p>' + end
    );
    const c2 = tCells[2].replace(/<w:t[^>]*>[\s\S]*?<\/w:t>/, "<w:t>{yes_mark}</w:t>");
    const c3 = tCells[3].replace(/<w:t[^>]*>[\s\S]*?<\/w:t>/, "<w:t>{no_mark}</w:t>");
    const c4 = tCells[4].replace(/<w:t[^>]*>[\s\S]*?<\/w:t>/, "<w:t>{na_mark}</w:t>");

    const newRow = templateRow
      .replace(tCells[0], c0)
      .replace(tCells[1], c1)
      .replace(tCells[2], c2)
      .replace(tCells[3], c3)
      .replace(tCells[4], c4);

    // Module name row spanning all 5 cols
    const modNameRow = '<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="9072" w:type="dxa"/><w:gridSpan w:val="5"/><w:tcBorders><w:top w:val="single" w:sz="6"/><w:left w:val="single" w:sz="6"/><w:bottom w:val="single" w:sz="6"/><w:right w:val="single" w:sz="6"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="D9E2F3"/></w:tcPr><w:p><w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr><w:r><w:rPr><w:b w:val="1"/><w:sz w:val="24"/></w:rPr><w:t>{module_name}</w:t></w:r></w:p></w:tc></w:tr>';

    // Checklist loop rows (inside table, spanning all cols, invisible)
    const clOpenRow  = '<w:tr><w:tc><w:tcPr><w:tcW w:w="9072" w:type="dxa"/><w:gridSpan w:val="5"/></w:tcPr><w:p><w:r><w:t>{#checklist}</w:t></w:r></w:p></w:tc></w:tr>';
    const clCloseRow = '<w:tr><w:tc><w:tcPr><w:tcW w:w="9072" w:type="dxa"/><w:gridSpan w:val="5"/></w:tcPr><w:p><w:r><w:t>{/checklist}</w:t></w:r></w:p></w:tc></w:tr>';

    const tblPrEnd = t2Xml.indexOf(t2Rows[0]);
    const tblPr = t2Xml.substring(0, tblPrEnd);

    t2Xml = tblPr
      + modNameRow
      + t2Rows[0]
      + t2Rows[1]
      + clOpenRow
      + newRow
      + clCloseRow
      + "</w:tbl>";

    console.log("+ Table 2 checklist tagged");
  }
}

// Wrap table 2 with modules loop outside (paragraphs)
const mOpen  = '<w:p><w:r><w:t>{#modules}</w:t></w:r></w:p>';
const mClose = '<w:p><w:r><w:t>{/modules}</w:t></w:r></w:p>';
xml = xml.substring(0, t2Start) + mOpen + t2Xml + mClose + xml.substring(t2End);
console.log("+ Modules loop wrapped");

// 8. Remediation file
const remPat = "Planning Dashboard - RPO Jobs_Remediation.xlsx";
if (xml.includes(remPat)) {
  xml = xml.split(remPat).join("{remediation_file_name}");
  console.log("+ Remediation tagged");
} else {
  console.log("! Remediation file not found");
}

zip.file("word/document.xml", xml);
const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
fs.writeFileSync(outputDocx, buffer);
console.log("\nSUCCESS! Written to:", outputDocx);

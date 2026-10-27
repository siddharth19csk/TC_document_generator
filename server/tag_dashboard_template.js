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

console.log("Original XML length:", xml.length);

// 1. Title paragraph
const titleMatch = xml.match(/<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?(?:ONESTREAM\s+DASHBOARD\s+TASK\s+REVIEW\s+CHECKLIST|(?:ONESTREAM|DASHBOARD\s+TASK\s+REVIEW))(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/i);
if (titleMatch) {
  const newTitle = '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:b w:val="1"/><w:sz w:val="36"/><w:u w:val="single"/></w:rPr><w:t>{doc_title}</w:t></w:r></w:p>';
  xml = xml.replace(titleMatch[0], newTitle);
  console.log("+ Title tagged");
} else {
  console.log("! Title not matched");
}

// 2. Project Name
if (xml.includes("Quanta - OneStream")) {
  xml = xml.replace("<w:t>Quanta - OneStream</w:t>", "<w:t>{project_name}</w:t>");
  console.log("+ Project name tagged");
}

// 3. Reviewer Name
const reviewerNames = ["Priya Kamaraj", "Siddharth Chandran"];
for (const rn of reviewerNames) {
  if (xml.includes(rn)) {
    xml = xml.replace("<w:t>" + rn + "</w:t>", "<w:t>{reviewer_name}</w:t>");
    console.log("+ Reviewer name tagged: " + rn);
    break;
  }
}

// 4. Review Date
const rdMatch = xml.match(/<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?Review[\s\S]*?Date[\s\S]*?<\/w:p>/i);
if (rdMatch) {
  const newDate = '<w:p><w:pPr><w:spacing w:before="240" w:after="240"/></w:pPr><w:r><w:rPr><w:b w:val="1"/></w:rPr><w:t xml:space="preserve">Review Date: </w:t></w:r><w:r><w:t>{review_date}</w:t></w:r></w:p>';
  xml = xml.replace(rdMatch[0], newDate);
  console.log("+ Review date tagged");
}

// 5. Status
const stMatch = xml.match(/<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?Status:[\s\S]*?<\/w:p>/i);
if (stMatch) {
  const newStatus = '<w:p><w:pPr><w:spacing w:before="240" w:after="240"/></w:pPr><w:r><w:rPr><w:b w:val="1"/></w:rPr><w:t xml:space="preserve">Status: </w:t></w:r><w:r><w:t>{status}</w:t></w:r></w:p>';
  xml = xml.replace(stMatch[0], newStatus);
  console.log("+ Status tagged");
}

// 6. Table 1 - Summary
const t1Start = xml.indexOf("<w:tbl>");
const t1End = xml.indexOf("</w:tbl>") + 8;

const t1Clean = `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:type="auto" w:w="0"/><w:tblLayout w:type="fixed"/><w:tblLook w:firstColumn="1" w:firstRow="1" w:lastColumn="0" w:lastRow="0" w:noHBand="0" w:noVBand="1" w:val="04A0"/></w:tblPr><w:tblGrid><w:gridCol w:w="864"/><w:gridCol w:w="2304"/><w:gridCol w:w="2592"/><w:gridCol w:w="2304"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="864"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>S. No.</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="2304"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{total_label}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="2592"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{tc_per_label}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="2304"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Total Testcase</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="864"/></w:tcPr><w:p><w:r><w:t>1</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="2304"/></w:tcPr><w:p><w:r><w:t>{total_reports}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="2592"/></w:tcPr><w:p><w:r><w:t>{tc_per_report}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="2304"/></w:tcPr><w:p><w:r><w:t>{total_testcase}</w:t></w:r></w:p></w:tc></w:tr></w:tbl>`;

xml = xml.substring(0, t1Start) + t1Clean + xml.substring(t1End);
console.log("+ Clean Table 1 inserted");

// 7. Table 2 - Checklist
const t2Start = xml.indexOf("<w:tbl>", t1Start + t1Clean.length);
const t2End = xml.indexOf("</w:tbl>", t2Start) + 8;
const t2Orig = xml.substring(t2Start, t2End);

// Table 2 structure (No blue heading row! Starts directly with columns header):
// Row 0: Columns header (S.No. | Checklist Item | Yes | No | N/A)
// Row 1: Category row (A | {category_label} | | | )
// Row 2: Checklist loop row with {#checklist}{sno} and {na_mark}{/checklist}

const colHeaderRow = '<w:tr w:rsidR="006E5EA5" w:rsidTr="03015A5A"><w:trPr><w:trHeight w:val="300"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="928" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>S. No.</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="6222" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Checklist Item</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="953" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Yes</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="1043" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>No</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="1108" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>N/A</w:t></w:r></w:p></w:tc></w:tr>';

const categoryRow = '<w:tr w:rsidR="006E5EA5" w:rsidTr="03015A5A"><w:trPr><w:trHeight w:val="300"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="928" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>A</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="6222" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b w:val="1"/><w:bCs w:val="1"/></w:rPr><w:t xml:space="preserve"> {category_label} </w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="953" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p/></w:tc><w:tc><w:tcPr><w:tcW w:w="1043" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p/></w:tc><w:tc><w:tcPr><w:tcW w:w="1108" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p/></w:tc></w:tr>';

const checklistRow = '<w:tr w:rsidR="006E5EA5" w:rsidTr="03015A5A"><w:trPr><w:trHeight w:val="300"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="928" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{#checklist}{sno}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="6222" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos Narrow" w:hAnsi="Aptos Narrow" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">{parameter}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="953" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{yes_mark}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="1043" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{no_mark}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="1108" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="6" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="6" w:space="0"/></w:tcBorders><w:tcMar><w:left w:w="105" w:type="dxa"/><w:right w:w="105" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{na_mark}{/checklist}</w:t></w:r></w:p></w:tc></w:tr>';

// Extract table properties & grid from original Table 2
const tblPrEnd = t2Orig.indexOf("<w:tr");
const tblHeader = t2Orig.substring(0, tblPrEnd);

const t2Clean = tblHeader
  + colHeaderRow
  + categoryRow
  + checklistRow
  + "</w:tbl>";

// Wrap Table 2 with {#modules} and {/modules}
const mOpen = '<w:p><w:r><w:t>{#modules}</w:t></w:r></w:p>';
const mClose = '<w:p><w:r><w:t>{/modules}</w:t></w:r></w:p>';

xml = xml.substring(0, t2Start) + mOpen + t2Clean + mClose + xml.substring(t2End);
console.log("+ Table 2 cleanly tagged (no blue header row)");

// 8. Remediation file
const remPat = "Planning Dashboard - RPO Jobs_Remediation.xlsx";
if (xml.includes(remPat)) {
  xml = xml.split(remPat).join("{remediation_file_name}");
  console.log("+ Remediation tagged");
}

zip.file("word/document.xml", xml);
const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
fs.writeFileSync(outputDocx, buffer);
console.log("\nSUCCESS! Written to:", outputDocx);

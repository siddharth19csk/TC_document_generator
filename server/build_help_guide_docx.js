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
  ImageRun
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docDir = path.resolve(__dirname, "../documentation");
const publicDir = path.resolve(__dirname, "../client/public");

const img1Path = path.resolve(docDir, "step1_landing_overview.png");
const img2Path = path.resolve(docDir, "step2_neat_prompt_filled.png");
const img3Path = path.resolve(docDir, "step3_success_download.png");

const outputDocx = path.resolve(docDir, "User_Help_Guide.docx");
const altOutputDocx = path.resolve(docDir, "Help_Document.docx");
const publicDocx = path.resolve(publicDir, "Help_Document.docx");

function t(text, options = {}) {
  const { bold = false, italics = false, size = 22 } = options;
  return new TextRun({
    text,
    font: "Calibri",
    color: "000000",
    size,
    bold,
    italics
  });
}

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

function h1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({
        text: title,
        font: "Calibri",
        size: 32,
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
        size: 26,
        bold: true,
        color: "000000"
      })
    ]
  });
}

function bullet(boldPrefix, normalText) {
  return new Paragraph({
    spacing: { before: 50, after: 70, line: 260 },
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
    spacing: { before: 50, after: 70, line: 260 },
    indent: { left: 400 },
    children: [
      t(`${num}. `, { bold: true }),
      t(boldPrefix, { bold: true }),
      t(" " + normalText)
    ]
  });
}

async function buildHelpGuide() {
  console.log("Loading screenshots...");
  const img1 = fs.readFileSync(img1Path);
  const img2 = fs.readFileSync(img2Path);
  const img3 = fs.readFileSync(img3Path);

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
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: "OneStream Testcase Document Generator",
                font: "Calibri",
                size: 38,
                bold: true,
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({
                text: "User Navigation Guide & Form Reference Manual",
                font: "Calibri",
                size: 24,
                italics: true,
                color: "000000"
              })
            ]
          }),

          p([
            t("Application Portal: ", { bold: true }),
            t("https://tc-document-generator.onrender.com")
          ]),
          p([
            t("Target Audience: ", { bold: true }),
            t("OneStream Developers, Financial Systems Analysts, QA Engineers, and Release Managers")
          ]),

          // SECTION 1
          h1("1. Purpose of this Guide"),
          p(
            "This document is a comprehensive user manual designed to help team members quickly navigate the Testcase Document Generator web portal. Whether you are releasing an updated Cube View, deploying a revised Dashboard interface, modifying system Parameters, or packaging financial Books, this guide explains how to construct clear, effective inputs and download production-ready Microsoft Word testcase review documents in seconds."
          ),

          // SECTION 2
          h1("2. User Interface Overview and Navigation"),
          p(
            "When you navigate to https://tc-document-generator.onrender.com, you are presented with a clean, focused single-page interface designed for rapid entry without unnecessary menus."
          ),

          // Screenshot 1
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 80 },
            children: [
              new ImageRun({
                data: img1,
                transformation: {
                  width: 560,
                  height: 395
                }
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 180 },
            children: [
              t("Figure 1: Main Landing Screen of the OneStream Task Review Studio", { italics: true, size: 19 })
            ]
          }),

          h2("Field Descriptions:"),
          bullet("Testcase Raw Details (Required):", "Paste the complete ServiceNow change/incident description, developer notes, or prompt detailing modified OneStream artifacts and workflow changes. Minimum 10 characters."),
          bullet("Report Code (Required):", "Enter the primary report or artifact code (e.g. R117, PWRJOB_RPT_15, or RPT_FORECAST)."),
          bullet("Certified By (Required):", "Developer name (e.g. Siddharth Chandran). Mandatory – stamped on the certification block of the generated document."),
          bullet("Ticket Number (Required):", "ServiceNow tracking ticket (e.g. CHG0058275, INC0158214, or RITM0098421)."),

          // Screenshot 2
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 80 },
            children: [
              new ImageRun({
                data: img2,
                transformation: {
                  width: 560,
                  height: 440
                }
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 180 },
            children: [
              t("Figure 2: Form populated with ticket details and certified reviewer information", { italics: true, size: 19 })
            ]
          }),

          // SECTION 5
          h1("5. Generating & Downloading"),
          p(
            "Once all required metadata and ticket details are supplied, follow these steps to generate and download the review document:"
          ),
          numbered("1", "Click Generate OneStream Document:", "Click the blue action button to begin AI-powered verification item assembly."),
          numbered("2", "Processing & Synthesis:", "Wait 3-5 seconds while the system parses the scope and binds checklist items."),
          numbered("3", "Download Word Document:", "Click 'Download Document' to obtain the standardized .docx file."),

          // Screenshot 3
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 80 },
            children: [
              new ImageRun({
                data: img3,
                transformation: {
                  width: 560,
                  height: 370
                }
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 180 },
            children: [
              t("Figure 3: Document generated successfully with instant download button", { italics: true, size: 19 })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputDocx, buffer);
  fs.writeFileSync(altOutputDocx, buffer);
  fs.writeFileSync(publicDocx, buffer);
  console.log("SUCCESS! Created:", outputDocx);
  console.log("SUCCESS! Created alternate:", altOutputDocx);
  console.log("SUCCESS! Copied to public:", publicDocx);
}

buildHelpGuide().catch(console.error);

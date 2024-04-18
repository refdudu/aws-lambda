const { JSDOM } = require("jsdom");
const { PDFDocument } = require("pdf-lib");
exports.PdfFromContent = async (page, content, waterMark) => {
  const dom = new JSDOM(content);
  const sections = Array.from(dom.window.document.querySelectorAll("section"));
  const head = dom.window.document.querySelector("head")?.innerHTML || "";
  const files = [];
  for (const section of sections) {
    const width = section.style.width || "210mm";
    section.style.width = width;
    const main = section.querySelector("main");
    if (main) {
      const height = main.style.minHeight || "297mm";
      main.style.minHeight = "0";

      const marginTop = main.style.paddingTop;
      const marginBottom = main.style.paddingBottom;
      main.style.padding = "0";

      const foreground = getDefaultHtml(main.outerHTML || "", head);
      const foregroundPdf = await PdfFromString({
        page,
        width,
        height,
        content: foreground,
        margin: {
          bottom: marginBottom,
          top: marginTop,
          left: "0",
          right: "0",
        },
      });

      main.style.minHeight = height;
      main.style.position = "relative";

      const widthNumber = Number(width.replace("mm", ""));
      const fontSize = widthNumber / 1.65; // Número que não quebra o layout;

      main.innerHTML = waterMark
        ? `
          <div
            style="
            position: absolute;
            height:${height};
            width:${width};
            display:flex;
            align-items:center;
            justify-content:center;
            "  
          >
          <h1 style="
            color: #c1c1c140;
            font-size:${fontSize}px;
            font-family: Verdana, sans-serif;
            transform: rotateZ(-45deg);">
                ${waterMark}
            </h1>
          </div>
          `
        : "";
      const header = section.querySelector("header");
      const footer = section.querySelector("footer");

      const sectionHtml = `
        ${header?.outerHTML}
        ${main.outerHTML}
        ${footer?.outerHTML}
        `;
      section.innerHTML = sectionHtml;
      const background = getDefaultHtml(section.outerHTML || "", head);
      const backgroundPdf = await PdfFromString({
        page,
        width,
        height,
        content: background,
      });
      const fullContent = await MergePage({
        background: backgroundPdf,
        foreground: foregroundPdf,
      });
      files.push(Buffer.from(fullContent));
    }
  }
  const finalPdf = await MergePdf({ files });
  return finalPdf;
};
async function MergePdf({ files }) {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const sectionDoc = await PDFDocument.load(file);
    const copiedPages = await mergedPdf.copyPages(
      sectionDoc,
      sectionDoc.getPageIndices()
    );
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
    console.log("MERGING DOC", mergedPdf.getPageCount());
  }
  const mergedPdfFile = await mergedPdf.save();
  return mergedPdfFile;
}

function getDefaultHtml(bodyContent, headContent) {
  const style = `<style>
        html, body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
            line-height: 1.5;
            font-size: 12pt;
            width: 100%;
        }
        section {
            position: relative;
        }
        section > header,
        section > footer {
            position: absolute;
            z-index: 1;
            left: 0;
            right: 0;
            top: 0;
        }
        section > footer {
            top: auto;
            bottom: 0;
        }
        section > main {
            position: relative;
            z-index: 10;
        }
        // section > main table thead,
        // section > main table tbody,
        // section > main table tfoot,
        // section > main table th,
        // section > main table td {
            // break-inside: avoid !important;
            // page-break-inside: avoid !important;
            // position: relative;
        // }
        // section > main table tr {
            // page-break-after: always !important;
        // }
		
		main table {
      border-spacing: 0;
      border-collapse: collapse;
      width: 100%;
			page-break-inside: auto !important;
    }
		main table tr { 
			display: table-row;
			page-break-inside: avoid !important;
		}
		main table thead { 
			display: table-header-group;
		}
		main table tbody { 
			display: table-row-group;
		}
		main table tfoot {
			display: table-footer-group;
		}
		main table td, 
		main table th { 
			display: table-cell;
		}
        </style>`;
  return `<!DOCTYPE html><html><head>${style} ${headContent}</head><body>${bodyContent}</body></html>`;
}
async function PdfFromString({ page, content, width, height, margin }) {
  await page.setContent(content, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    printBackground: true,
    omitBackground: true,
    width: width,
    height: height,
    scale: 1,
    displayHeaderFooter: false,
    margin,
  });
  console.log("PDF", { width, height }, pdf.length);
  return pdf;
}
async function MergePage({ background, foreground }) {
  const mergedPdf = await PDFDocument.create();
  const backgroundDoc = await PDFDocument.load(background);
  const foregroundDoc = await PDFDocument.load(foreground);
  const foregroundLength = foregroundDoc.getPageIndices();
  const copiedPages = await mergedPdf.copyPages(
    foregroundDoc,
    foregroundLength
  );
  for (const page of copiedPages) {
    const copyBackground = (await mergedPdf.copyPages(backgroundDoc, [0]))[0];
    const embedBg = await mergedPdf.embedPage(copyBackground);
    page.drawPage(embedBg, { x: 0, y: 0, opacity: 0.5 }); //corpo por cima de cabeçalho e rodapé, links do layer de cima somente funcionan
    mergedPdf.addPage(page);
  }
  const mergedPdfFile = await mergedPdf.save();
  return mergedPdfFile;
}

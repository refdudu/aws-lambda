const { initBrowser } = require("./utils/create-browser");
const { GetContentFromUrl } = require("./utils/get-content-from-url");
const { PdfFromContent } = require("./utils/pdf-from-content");

exports.handler = async (event) => {
  const url =
    event.url ||
    event.queryStringParameters?.url ||
    "https://web.atendare.com/public/docs/2VXML8X4PKyiJ8c1kum5lxBHXopcPDcHrXY3cLOT2te2PNRqYChAH98Dtpt2ouNlhrWqffx9gyBwTFwK57jm1CArYVISwrEggxT5/budget/50a1f975-db51-4b5b-b155-4df5be567c3c/html";
  const waterMark =
    event.waterMark || event.queryStringParameters?.waterMark || "";
  const pdf = await createPdf(url, waterMark);
  return {
    headers: { "Content-Type": "application/pdf" },
    statusCode: 200,
    body: pdf,
    isBase64Encoded: true,
  };
};
async function createPdf(url, waterMark) {
  const { page } = await initBrowser();
  const content = await GetContentFromUrl(page, url);
  if (!content) throw new Error();

  const mergedPdf = await PdfFromContent(page, content, waterMark);
  const base64Pdf = Buffer.from(mergedPdf.buffer).toString("base64")
  //   await browser.close();
  return base64Pdf;
}

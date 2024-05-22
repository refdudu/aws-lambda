const { initBrowser } = require("./utils/create-browser");
const { GetContentFromUrl } = require("./utils/get-content-from-url");
const { PdfFromContent } = require("./utils/pdf-from-content");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const Bucket = process.env.bucket;

exports.handler = async (event) => {
  const url =
    event.url ||
    event.queryStringParameters?.url ||
    "https://web.atendare.com/public/docs/2VXML8X4PKyiJ8c1kum5lxBHXopcPDcHrXY3cLOT2te2PNRqYChAH98Dtpt2ouNlhrWqffx9gyBwTFwK57jm1CArYVISwrEggxT5/budget/50a1f975-db51-4b5b-b155-4df5be567c3c/html";
  const waterMark =
    event.waterMark || event.queryStringParameters?.waterMark || "";
  const path = event.path || event.queryStringParameters?.path || "8/renan";
    // event.ownerUid || event.queryStringParameters?.ownerUid || "8";
  const pdf = await createPdf(url, waterMark);
  const key = await uploadPdf(pdf, path);
  return true;
  //   return {
  //     headers: { "Content-Type": "application/json" },
  // statusCode: 200,
  // body: { link },
  //     // isBase64Encoded: true,
  //   };
};

async function uploadPdf(pdfBase64, path) {
  const date = new Date();
  const utc = date.getTime();
  const Key = `${path}/pdf-document-${utc}.pdf`;
  const ContentType = "application/pdf";
  const props = {
    Bucket,
    Key,
    ContentType,
    Body: Buffer.from(pdfBase64, "base64"),
  };
  await s3.putObject(props).promise();
  return Key;
}
async function getPdfLink(Key) {
  return s3.getSignedUrl("getObject", {
    Bucket,
    Key,
  });
}
async function createPdf(url, waterMark) {
  const { page, browser } = await initBrowser();
  const content = await GetContentFromUrl(page, url);
  if (!content) throw new Error();
  //   return PdfFromContent(page, content, waterMark);

  const mergedPdf = await PdfFromContent(page, content, waterMark);
  const base64Pdf = Buffer.from(mergedPdf.buffer).toString("base64");
  await browser.close();
  return base64Pdf;
}

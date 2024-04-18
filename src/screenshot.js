const { initBrowser } = require("./utils/create-browser");

exports.handler = async (event) => {
  const url =
    event.url || event.queryStringParameters?.url || "https://google.com";
  if (!url) {
    // return "Please provide URL as GET parameter, for example: ?url=https://example.com</a>"
    return {
      statusCode: 400,
      body: JSON.stringify(
        "Please provide URL as GET parameter, for example: ?url=https://example.com</a>"
      ),
    };
  }
  const image = await screenshot(url);
//   return image
  return {
    headers: { "Content-Type": "image/png" },
    statusCode: 200,
    body: image,
    isBase64Encoded: true,
  };
};
async function screenshot(url) {
  const { page } = await initBrowser();
  await page.goto(url);
  await page.setViewport({
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
  });
  await autoScroll(page);
  const imageBuffer = await page.screenshot({ fullPage: true });
  return imageBuffer.toString("base64");
}
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

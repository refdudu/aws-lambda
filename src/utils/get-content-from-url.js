exports.GetContentFromUrl = async (page, url) => {
  const response = await page.goto(url, { timeout: 300000 });
  const responseBody = await response?.text();
  return responseBody;
};

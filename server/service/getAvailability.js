const { firefox } = require("playwright-firefox");

const resortMap = {
  keystone:
    "https://www.keystoneresort.com/plan-your-trip/lift-access/tickets.aspx",
  stevens:
    "https://www.stevenspass.com/plan-your-trip/lift-access/tickets.aspx",
  breckenridge: 'https://www.breckenridge.com/plan-your-trip/lift-access/tickets.aspx',
};

module.exports = async function getResortAvailbility(resort) {
  const result = [];
  const resortUrl = resortMap[resort];
  if (resortUrl) {
    const browser = await firefox.launch({ chromiumSandbox: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.route(/.*GetLiftTicketControlReservationInventory.*/, (route) => {
      route
        .request()
        .response()
        .then((response) => {
          response
            .body()
            .then((b) => {
              const arr = JSON.parse(b.toString());
              result.push(...arr);
            })
            .catch((err) => {
              throw err;
            });
        });
      route.continue();
    });

    await page.goto(resortUrl, {
      waitUntil: "networkidle",
      timeout: 0,
    });
    await browser.close();

    return result.sort(
      (a, b) =>
        new Date(a.InventoryDateTime).getTime() -
        new Date(b.InventoryDateTime).getTime()
    );
  } else {
    throw new Error("resort not exist");
  }
};

const {
    webkit
} = require('playwright');

(async () => {
    const browser = await webkit.launch();
    const context = await browser.newContext();

    const page = await context.newPage();
    const result = [];
    page.route(/.*GetLiftTicketControlReservationInventory.*/, route => {
        route.request().response().then((response) => {
            response.body()
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

    await page.goto('https://www.keystoneresort.com/plan-your-trip/lift-access/tickets.aspx', {
        waitUntil: 'networkidle'
    });
    await browser.close();
    console.log(result);
})();
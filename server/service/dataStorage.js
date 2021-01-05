const fs = require("fs").promises;

const getAvailability = require("./getAvailability");
const notification = require("./notification");
const twilio = require("./twilio");

const resortArray = ["keystone", "stevens"];
const resortMap = {
  'keystone': 'https://www.keystoneresort.com/plan-your-trip/lift-access/tickets.aspx',
  'stevens': 'https://www.stevenspass.com/plan-your-trip/lift-access/tickets.aspx'
}
const REFRESH_INTERVAL = 60000; //ms

function sleep(ms) {
  return new Promise((ok) => setTimeout(ok, ms));
}
let running = false;

async function updateAvailabilities() {
  if (running) throw new Error("Already running");
  running = true;
  while (true) {
    const result = {};
    await Promise.all(
      resortArray.map(async (resort) => {
        const availability = await getAvailability(resort);
        result[resort] = availability;
      })
    );
    const time = Date.now();
    console.log(`writing data at epoch time of ${time}`);
    result["time"] = time;
    sendOutNotification(result);
    await fs.writeFile(
      `${__dirname}/data.json`,
      JSON.stringify(result, null, 2)
    );
    await sleep(REFRESH_INTERVAL);
  }
}

async function sendOutNotification(availabilityMap) {
  const watchList = notification.getWatchList();
  for (const phoneNumber of Object.keys(watchList)) {
    const { resort, choosenDate } = watchList[phoneNumber];
    const { Remaining } = availabilityMap[resort].find(
      (obj) =>
        new Date(obj.InventoryDate).getTime() ===
        new Date(choosenDate).getTime()
    );
    if (Remaining > 0) {
      console.log('sending message');
      const message = `${resort} has tickets available for ${choosenDate}. Go to: ${resortMap[resort]}`;
      twilio.sendSms(phoneNumber, message);
    }
  }
}

module.exports = updateAvailabilities;

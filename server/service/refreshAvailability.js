const getAvailability = require("./getAvailability");
const databaseConnection = require('./db');

const resortArray = ["keystone", "stevens", "breckenridge"];
const REFRESH_INTERVAL = 60000; //ms

function sleep(ms) {
  console.log(`sleep for ${ms}ms`);
  return new Promise((ok) => setTimeout(ok, ms));
}

function getRandomArbitrary(min, max) {
  return REFRESH_INTERVAL + Math.floor((Math.random() * (max - min) + min));
}

let running = false;

async function updateAvailabilities() {
  if (running) throw new Error("Already running");
  running = true;
  while (true) {
    await Promise.all(
      resortArray.map(async (resort) => {
        try {
          const availability = await getAvailability(resort);
          console.log({
            message: 'got availability array, writing data to db',
            resort
          });
          await databaseConnection.updateAvailability(resort, availability);
        } catch(e) {
          console.error({
            resort,
            message: 'unable to get availiability',
            errorMessage: e.message
          });
        }
        
      })
    );
    const time = Date.now();
    console.log(`writing data at epoch time of ${time}`);
    await sleep(getRandomArbitrary(5000, 10000));
  }
}

module.exports = updateAvailabilities;

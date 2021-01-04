const fs = require('fs').promises;

const getAvailability = require('./getAvailability');

const resortArray = ['keystone', 'stevens'];
const REFRESH_INTERVAL = 60000; //ms

function sleep(ms) {
    return new Promise(ok => setTimeout(ok, ms));
}
let running = false;

async function updateAvailabilities() {
    if (running) throw new Error('Already running');
    running = true;
    while(true) {
        const result = {};
        await Promise.all(resortArray.map(async resort => {
            const availability = await getAvailability(resort);
            result[resort] = availability;
        }));
        const time = Date.now();
        console.log(`writing data at epoch time of ${time}`)
        result['time'] = time;
        await fs.writeFile(`${__dirname}/data.json`, JSON.stringify(result, null, 2));
        await sleep(REFRESH_INTERVAL);
    }
}

module.exports = updateAvailabilities;
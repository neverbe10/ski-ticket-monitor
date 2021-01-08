// const {
//     webkit
// } = require('playwright');

// (async () => {
//     const browser = await webkit.launch();
//     const context = await browser.newContext();

//     const page = await context.newPage();
//     const result = [];
//     page.route(/.*GetLiftTicketControlReservationInventory.*/, route => {
//         route.request().response().then((response) => {
//             response.body()
//                 .then((b) => {
//                     const arr = JSON.parse(b.toString());
//                     result.push(...arr);
//                 })
//                 .catch((err) => {
//                     throw err;
//                 });
//         });
//         route.continue();
//     });

//     await page.goto('https://www.keystoneresort.com/plan-your-trip/lift-access/tickets.aspx', {
//         waitUntil: 'networkidle'
//     });
//     await browser.close();
//     console.log(result);
// })();

const { MongoClient } = require("mongodb");
const { format } = require('date-fns');

async function test() {
  const dbClient = new MongoClient(
    "mongodb+srv://Elaine:3PpsBUKrTtK5eHr@cluster0.vninh.mongodb.net/ski-ticket?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  await dbClient.connect();
  const db = dbClient.db("ski-ticket");
  // const collection = this.db.collection('availability');
  // const current = await collection.findOne({key: '2021-01-04T00:00:00'});
  // console.log({current});
  // const resort = 'stevens'
  // const Remaining = 10;
  // if(current[resort] != Remaining) {
  //   current[resort] = Remaining;
  //   console.log('update');
  // } else {
  //   console.log('not update');
  // }
  // console.log({current});
  // current['keystone'] = 10;
  // await collection.replaceOne({key: '2021-01-04T00:00:00'}, current);
  addSubscription({
    db,
    phoneNumber: "4087484652",
    choosenDate: "2021-01-30T00:00:00",
    resort: "stevens",
  });
  console.log("done");
}

async function addSubscription({ db, phoneNumber, choosenDate, resort }) {
  console.log({phoneNumber, choosenDate, resort});
  choosenDate = format(
    new Date(choosenDate),
    'MM/dd/yyyy'
  );
  phoneNumber = phoneNumber.replace(/\D/g, '');
  const collection = db.collection("subscription");
  const current = await collection.findOne({ key: choosenDate });

  if (!current) {
    // when date is missing
    const doc = {
      key: choosenDate,
      [resort]: [phoneNumber],
    };
    await collection.insertOne(doc);
  } else if (!current[resort]) {
    current[resort] = [phoneNumber];
    await collection.replaceOne({ key: choosenDate }, current);
  } else if (!current[resort].includes(phoneNumber)) {
    current[resort].push(phoneNumber);
    await collection.replaceOne({ key: choosenDate }, current);
  } else {
    console.log('no update');
  }
}
test();
// const REFRESH_INTERVAL = 60000; //ms

// function getRandomArbitrary(min, max) {
//   return REFRESH_INTERVAL + Math.floor((Math.random() * (max - min) + min));
// }

// console.log(getRandomArbitrary(5000, 10000));

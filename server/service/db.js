const { MongoClient } = require('mongodb');
const { format } = require('date-fns');

const twilio = require('./twilio');

const resortMap = {
  keystone:
    'https://www.keystoneresort.com/plan-your-trip/lift-access/tickets.aspx',
  stevens:
    'https://www.stevenspass.com/plan-your-trip/lift-access/tickets.aspx',
};

class DatebaseConnection {
  constructor() {
    const dbClient = new MongoClient(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.ready = dbClient.connect();
    this.ready.then(() => {
      this.db = dbClient.db('ski-ticket');
    });
  }

  async getAvailability(resort, choosenDate) {
    await this.ready;
    const collection = this.db.collection('availability');
    const current = await collection.findOne({ key: choosenDate });
    if (!current) {
      return null;
    } else {
      return current[resort];
    }
  }

  async updateAvailability(resort, availabilityArray) {
    await this.ready;
    const collection = this.db.collection('availability');
    await Promise.all(
      availabilityArray.map(async ({ InventoryDateTime, Remaining }) => {
        const inventoryDateTime = format(
          new Date(InventoryDateTime),
          'MM/dd/yyyy'
        );
        const current = await collection.findOne({ key: inventoryDateTime });
        if (!current) {
          // when date is missing
          const doc = {
            key: inventoryDateTime,
            [resort]: Remaining,
          };
          await collection.insertOne(doc);
          console.log({
            message: 'insert record',
            doc,
          });
        } else if (current[resort] !== Remaining) {
          // when remaining value doesn't match up
          current[resort] = Remaining;
          await collection.replaceOne({ key: inventoryDateTime }, current);
          console.log({
            message: 'update remaining',
            resort,
            inventoryDateTime,
            remaining: Remaining,
            current,
          });
        }
        if (Remaining > 0) {
          this.sendOutNotification({
            resort,
            choosenDate: inventoryDateTime,
          });
        }
      })
    );
  }

  async sendOutNotification({ resort, choosenDate }) {
    await this.ready;
    const message = `${resort} resort has ticket(s) available for ${choosenDate}. Go to: ${resortMap[resort]}`;
    const collection = this.db.collection('subscription');
    const current = await collection.findOne({ key: choosenDate });
    if (current && current[resort]) {
      current[resort].forEach((phoneNumber) => {
        twilio.sendSms(phoneNumber, message);
      });
    }
  }

  async addSubscription({ phoneNumber, choosenDate, resort }) {
    await this.ready;
    choosenDate = format(
      new Date(choosenDate),
      'MM/dd/yyyy'
    );
    const collection = this.db.collection('subscription');
    phoneNumber = phoneNumber.replace(/\D/g, '');
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
    } else {
      current[resort].push(phoneNumber);
      await collection.replaceOne({ key: choosenDate }, current);
    }
  }
}

const databaseConnection = new DatebaseConnection();
// Object.freeze(databaseConnection);

module.exports = databaseConnection;

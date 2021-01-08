require("dotenv-safe").config();
const path = require('path');

const databaseConnection = require('./service/db');

require('./service/dataStorage')();

const resortArray = ["keystone", "stevens"];
const resortMap = {
  'keystone': 'https://www.keystoneresort.com/plan-your-trip/lift-access/tickets.aspx',
  'stevens': 'https://www.stevenspass.com/plan-your-trip/lift-access/tickets.aspx'
}

// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});

fastify.register(require('fastify-formbody'));

// fastify.register(require("fastify-cors"), {});

// https://github.com/fastify/fastify-static
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '../dist'),
});

// fastify.get("/availability", async (req, reply) => {
//   const data = JSON.parse(await fs.readFile("./server/service/data.json"));
//   reply.send(data);
// });

// fastify.get("/availability/:resort", async (req, reply) => {
//   const resort = req.params.resort;
//   const data = JSON.parse(await fs.readFile("./server/service/data.json"));
//   reply.send(data[resort]);
// });

fastify.get("/availability/:resort", async (req, reply) => {
  const resort = req.params.resort;
  const inventoryDate = req.query.date;
  if (resort && inventoryDate) {
    const res = await databaseConnection.getAvailability(resort, inventoryDate);
    reply.send({
      remaining: res,
      resort,
      resortUrl: resortMap[resort]
    });
  } else {
    throw new Error("params not passed in correctly");
  }
});

fastify.get("/resort-list", (req, reply) => {
  reply.send(resortArray);
});

fastify.post("/subscribe", async (req, reply) => {
  const body = req.body;
  await databaseConnection.addSubscription(body);
  reply.send('ok');
});

// Message example: UNSUBSCRIBE 02/20/2021 STEVENS
fastify.post("/unsubscribe", async (req, reply) => {
  const body = req.body.Body;
  const phoneNumber = req.body.From;
  if(!body || !phoneNumber) {
    console.log({body: req.body});
    throw new Error("params are not formatted correctly");
  }
  const parsed = body.split(' ');
  if(parsed.length !== 3 || (parsed.length > 1 && parsed[0].toUpperCase() !== 'UNSUBSCRIBE')) {
    reply.send(`Sorry I don't understand`);
  } else {
    const bool = await databaseConnection.deleteSubscription({phoneNumber, choosenDate: parsed[1], resort: parsed[2]});
    if(bool) {
      reply.send(`Unsubscribe successful`);
    } else {
      reply.send(`Something went wrong`);
    }
  }
});

// Run the server!
fastify.listen(process.env.PORT, (err, address) => {
  if (err) throw err;
  fastify.log.info(`server listening on ${address}`);
});

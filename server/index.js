require("dotenv-safe").config();

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

fastify.register(require("fastify-cors"), {});

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

// Run the server!
fastify.listen(3000, (err, address) => {
  if (err) throw err;
  fastify.log.info(`server listening on ${address}`);
});

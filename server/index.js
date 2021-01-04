require("dotenv-safe").config();
const fs = require("fs").promises;

// require('./service/dataStorage')();

const resortArray = ["keystone", "stevens"];

// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});

fastify.register(require("fastify-cors"), {});

fastify.get("/availability", async (req, reply) => {
  const data = JSON.parse(await fs.readFile("./server/service/data.json"));
  reply.send(data);
});

// fastify.get("/availability/:resort", async (req, reply) => {
//   const resort = req.params.resort;
//   const data = JSON.parse(await fs.readFile("./server/service/data.json"));
//   reply.send(data[resort]);
// });

fastify.get("/availability/:resort", async (req, reply) => {
  const resort = req.params.resort;
  const inventoryDate = req.query.date;
  if (resort && inventoryDate) {
    const data = JSON.parse(await fs.readFile("./server/service/data.json"));
    const { Remaining } = data[resort].find(
      (obj) => new Date(obj.InventoryDate).getTime() === new Date(inventoryDate).getTime()
    );
    reply.send(Remaining);
  } else {
    throw new Error("params not passed in correctly");
  }
});

fastify.get("/resort-list", (req, reply) => {
  reply.send(resortArray);
});

// Run the server!
fastify.listen(3000, (err, address) => {
  if (err) throw err;
  fastify.log.info(`server listening on ${address}`);
});

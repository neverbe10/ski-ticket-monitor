const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

async function sendSms(phoneNumber, message) {
  console.log({phoneNumber, message});
  await client.messages.create({
    body: message,
    from: "+12068884707",
    to: phoneNumber,
  });
}

module.exports = {
  sendSms,
};

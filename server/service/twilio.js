const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

async function sendSms(phoneNumber, message) {
  try {
    console.log({
      phoneNumber, 
      message, 
      msg: 'sending sms'
    });
    const msg = await client.messages.create({
      body: message,
      from: "+12068884707",
      to: phoneNumber,
    });
    console.log(msg.sid);
  } catch(e) {
    console.error({e, message: 'error sending the message'});
  }
  
}

module.exports = {
  sendSms,
};

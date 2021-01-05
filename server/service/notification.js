const fs = require("fs").promises;

const watchList = {}

function subscribe({ phoneNumber, choosenDate, resort }) {
  console.log({phoneNumber, choosenDate, resort });
  phoneNumber = phoneNumber.replace(/\D/g, "");
  watchList[phoneNumber] = {
    choosenDate,
    resort
  };

}

function getWatchList() {
  return watchList;
}

module.exports = {
  subscribe,
  getWatchList
};

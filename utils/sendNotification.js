const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  require("../config/firebase-config");
}

module.exports = sendNotication = (message) => {
  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      console.log(response);
      console.log(response.successCount + " messages were sent successfully");
    });
};

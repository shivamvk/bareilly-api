const admin = require("firebase-admin");
const serviceAccount = require("../bareilly-fcm-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://bareilly-project.appspot.com",
});

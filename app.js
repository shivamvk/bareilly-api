const express = require("express");
const bodyParser = require("body-parser");
const db = require("./config/db");
const commonHeaders = require('./middleware/common-headers');
const authRoutes = require("./routes/auth-routes");
const userRoutes = require("./routes/user-routes");
const postRoutes = require("./routes/post-routes");
const contentRoutes = require("./routes/content-routes");
const app = express();
require("./config/firebase-config");

app.use(bodyParser.json());
app.use(commonHeaders);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/user/posts", postRoutes);
app.use("/api/v1/content", contentRoutes);

db.connect()
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    throw new Error(err.message);
  });

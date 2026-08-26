const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vasundhara Theatre API is running",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

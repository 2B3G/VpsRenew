import express from "express";
const app = express();
const port = process.env.PORT || 3000;
import renew from "./module/renewer.js";
import createBrowser from "./module/createBrowser.js";

global.browserLength = 0;
global.browserLimit = Number(process.env.browserLimit) || 20;
global.timeOut = Number(process.env.timeOut || 60000);

if (process.env.NODE_ENV !== "development") {
  let server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  try {
    server.timeout = global.timeOut;
  } catch (e) {}
}

createBrowser();

app.get("/", async (req, res) => {
  try {
    await renew();

    res.status(200).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: {
        message: e.message,
      },
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ code: 404, message: "Not Found" });
});

if (process.env.NODE_ENV == "development") module.exports = app;

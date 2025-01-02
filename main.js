import Browser from "./browser.js";
import renew from "./renewer.js";
import express from "express";

Browser.launchBrowser();
const app = express();
const port = 3012;

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

app.listen(port, console.log(`VPS Renewer listening on port ${port}`));

import { connect } from "puppeteer-real-browser";

class Browser {
  static browser;

  static async launchBrowser() {
    const { browser } = await connect({
      headless: false,
      args: ["--no-sandbox"],
    });

    Browser.browser = browser;

    Browser.browser.on("disconnected", () => {
      console.log("Browser was closed. Relaunching in 2 seconds...");

      setTimeout(() => {
        Browser.launchBrowser();
      }, 2000);
    });
  }
}

export default Browser;

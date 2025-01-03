import { connect } from "puppeteer-real-browser";

class Browser {
  static browser;

  static async launchBrowser() {
    try {
      const { browser } = await connect({
        headless: false,
        args: ["--no-sandbox"],
        disableXvfb: false,
      });

      Browser.browser = browser;

      Browser.browser.on("disconnected", () => {
        console.log("Browser was closed. Relaunching in 2 seconds...");

        setTimeout(() => {
          Browser.launchBrowser();
        }, 2000);
      });
    } catch (e) {
      console.error(e);

      setTimeout(() => {
        Browser.launchBrowser();
      }, 2000);
    }
  }
}

export default Browser;

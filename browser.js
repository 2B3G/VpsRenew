import { launch } from "puppeteer";

class Browser {
  static browser;

  static async launchBrowser() {
    Browser.browser = await launch({ headless: false });

    Browser.browser.on("disconnected", () => {
      console.log("Browser was closed. Relaunching in 2 seconds...");

      setTimeout(() => {
        Browser.launchBrowser();
      }, 2000);
    });
  }
}

export default Browser;

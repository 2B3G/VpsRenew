import { get } from "node:https";
import { createWriteStream, unlinkSync } from "fs";
import Audio2TextJS from "audio2textjs";
import Browser from "./browser.js";

const converter = new Audio2TextJS({
  outputJson: true,
});

async function renew() {
  const page = await Browser.browser.newPage();

  await page.setViewport({ height: 1000, width: 1900 });

  await page.goto("https://game4free.net/odnuw");

  await page.waitForSelector("iframe[title='reCAPTCHA'");
  const iframe = await page.$("iframe[title='reCAPTCHA'");

  const content = await iframe.contentFrame();

  await content.waitForSelector(".recaptcha-checkbox");
  await content.click(".recaptcha-checkbox");

  await page.waitForSelector(
    "iframe[title='recaptcha challenge expires in two minutes']"
  );
  const f = await page.$(
    "iframe[title='recaptcha challenge expires in two minutes']"
  );

  const captchaFrame = await f.contentFrame();

  await captchaFrame.waitForSelector("#recaptcha-audio-button");
  await captchaFrame.click("#recaptcha-audio-button");

  let audioUrl;
  try {
    await captchaFrame.waitForSelector(".rc-audiochallenge-tdownload-link", {
      timeout: 3000,
    });

    audioUrl = await captchaFrame.$eval(
      ".rc-audiochallenge-tdownload-link",
      (e) => e.href
    );
  } catch (e) {
    await page.close();

    throw Error("Captcha Rate Limited");
  }

  await downloadAudio(audioUrl);
  const text = await transcribe();

  await captchaFrame.type("#audio-response", text.trim());
  await captchaFrame.click("#recaptcha-verify-button");

  await delay(500);

  const captchaResp = await captchaFrame.$eval(
    "#recaptcha-token",
    (inp) => inp.value
  );

  await page.type("#username-input", "dasdadda");
  await page.click("#submit-button");

  await page.waitForNavigation({ waitUntil: "domcontentloaded" });

  await page.close();
}

async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function downloadAudio(url) {
  return new Promise((resolve) => {
    get(url, (response) => {
      if (response.statusCode !== 200) {
        console.error(`Failed to download file: ${response.statusCode}`);
        response.resume();
        return;
      }

      const file = createWriteStream("audio.mp3");

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve();
      });

      file.on("error", (err) => {
        console.error(`File Write Error: ${err.message}`);
        file.close();
        unlinkSync("model/audio.mp3"); // Delete incomplete file
      });
    }).on("error", (err) => {
      console.error(`Error: ${err.message}`);
    });
  });
}

async function transcribe() {
  const result = await converter.runWhisper("audio.mp3", "tiny", "en");

  if (result.output.length == 0)
    throw Error("Transcription failed. No text found");

  // sometimes it detects the static as vawes and adds "(waves crashing)" so this avoids it
  const isWeird = (str) => /[\[\]()]/.test(str);
  let text;
  result.output[0].data.transcription.forEach((t) => {
    if (!isWeird(t.text)) text = t.text;
  });

  if (!text) throw Error("Transcription failed. No text found");
  return text;
}

export default renew;

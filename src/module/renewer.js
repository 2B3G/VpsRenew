async function renew() {
  const context = await global.browser.createBrowserContext().catch(() => null);
  try {
    const page = await context.newPage();

    await page.setViewport({ height: 1000, width: 1900 });

    await page.goto("https://game4free.net/odnuw");

    try {
      await page.waitForSelector("#username-input", { timeout: 3500 });
    } catch {
      throw new Error("Renew is on timeout, try again in 5 minutes");
    }

    await page.waitForSelector("iframe[title='reCAPTCHA'");
    const iframe = await page.$("iframe[title='reCAPTCHA'");

    const content = await iframe.contentFrame();

    await content.waitForSelector(".recaptcha-checkbox");
    await content.click(".recaptcha-checkbox");

    await page.waitForSelector(
      "iframe[title='recaptcha challenge expires in two minutes']",
      { timeout: 2000 }
    );

    const f = await page.$(
      "iframe[title='recaptcha challenge expires in two minutes']"
    );

    const captchaFrame = await f.contentFrame();

    try {
      await captchaFrame.waitForSelector("#recaptcha-audio-button", {
        timeout: 2000,
      });
    } catch (e) {
      // means the captcha got verified without the challange
      await page.type("#username-input", "dasdadda");
      await page.click("#submit-button");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await context.close();

      return;
    }

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
      throw Error("Captcha Rate Limited");
    }

    const text = await transcribe(audioUrl);

    await captchaFrame.type("#audio-response", text.trim());
    await captchaFrame.click("#recaptcha-verify-button");

    await delay(500);

    await page.type("#username-input", "dasdadda");
    await page.click("#submit-button");

    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (e) {
    throw e;
  } finally {
    await context.close();
  }
}

async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function transcribe(url) {
  const audioResp = await fetch(url);
  const arrayBuffer = await audioResp.arrayBuffer();
  const fileBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });

  const fd = new FormData();
  fd.append("file", fileBlob, "audio.mp3");

  const response = await fetch(
    "https://transcriptionapi-xbqu.onrender.com/transcribe",
    {
      method: "POST",
      body: fd,
    }
  );
  const result = await response.json();

  return result.transcription;
}

export default renew;

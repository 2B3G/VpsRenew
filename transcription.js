import Audio2TextJS from "audio2textjs";

// Example usage
const converter = new Audio2TextJS({
  threads: 4,
  processors: 1,
  outputTxt: true,
});

const inputFile = "1.wav";
const model = "tiny"; // Specify one of the available models
const language = "en"; // or specify a language code for translation

converter
  .runWhisper(inputFile, model, language)
  .then((result) => {
    if (result.success) {
      console.log("Conversion successful:", result.output);
    } else {
      console.error("Conversion failed:", result.message);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

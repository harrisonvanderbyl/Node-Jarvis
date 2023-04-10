import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { exec } from "child_process";
import { writeFileSync } from "fs";
// Add credentials path to shell variables
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  __dirname + "/../config/googleconfig.json";

const client = new TextToSpeechClient();

export const synthesize = async (
  words: string,
  name = "en-US-Wavenet-G",
  speed = "slow",
  pitch = 100
) => {
  const request: Parameters<typeof client.synthesizeSpeech>[0] = {
    input: {
      ssml: "<speak>" + words + "</speak>",
    },
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: "en-US",
      ssmlGender: "FEMALE",

      name,
    },

    // select the type of audio encoding
    audioConfig: {
      audioEncoding: "MP3",
      sampleRateHertz: 44100,
      pitch: pitch / 100,
    },
  };

  const [response] = await client.synthesizeSpeech(request);

  return response.audioContent;
};

export async function wordsToFile(
  words: string,
  name = "en-US-Neural2-C",
  filename: string
) {
  const audio = await synthesize(words, name);
  writeFileSync(filename, audio, "binary");
  return;
}

export async function fileToSpeaker(filename: string) {
  // play audi file (windows)
  exec(`start ${filename}`);
  
}

export async function say(words: string): Promise<void> {
  console.log("starting speaker", words);

  // Save words to temp file
  await wordsToFile(words, "en-US-Neural2-C", "./temp.mp3");

  // Play the audio using the speaker
  await fileToSpeaker("./temp.mp3");
}

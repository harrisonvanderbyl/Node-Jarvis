import Mp3 from "js-mp3";
import PCM from "pcm";
import { Readable } from "stream";
import Speaker from "speaker";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { exec } from "child_process";
import { writeFileSync } from "fs";

let speaker = new Speaker({
  channels: 1, // 2 channels
  bitDepth: 16, // 16-bit samples
  sampleRate: 44100, // 44,100 Hz sample rate
});

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
  name = "en-US-Wavenet-G",
  filename: string
) {
  const audio = await synthesize(words, name);
  writeFileSync(filename, audio, "binary");
  return;
}

export async function fileToSpeaker(filename: string) {
  return new Promise<void>(async (res, reject) => {
    exec("cvlc " + filename + " --play-and-exit", () => res());
  });
}

// wordsToFile(
//   `I am listening <say-as interpret-as="expletive">beep</say-as>`,
//   "en-US-Wavenet-B",
//   "./Listening.mp3"
// );

export async function say(words: string): Promise<void> {
  console.log("starting speaker", words);

  // Save words to temp file
  await wordsToFile(words, "en-GB-Wavenet-B", "./temp.mp3");

  // Play the audio using the speaker
  await fileToSpeaker("./temp.mp3");
}

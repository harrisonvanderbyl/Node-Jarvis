import * as recorder from "node-record-lpcm16";

import { fileToSpeaker, say } from "./speech/synth";

import Bumblebee from "bumblebee-hotword-node";
import { SpeechClient } from "@google-cloud/speech";
import { exec } from "child_process";
import { executeCommand } from "./speech/executeCommand";
import { existsSync } from "fs";
import { gpt3 } from "./gpt3/gpt3";

// Add credentials path to shell variables
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  __dirname + "/config/googleconfig.json";

const bumblebee = new Bumblebee();

bumblebee.addHotword("jarvis");

var history = `Jarvis is a helpful AI. It has full control over a linux machine,
When it needs clarification for a task, it will ask and append [ExpectedReply] to the end of its message, otherwise, it will instead append [ExecuteCommand] to the end of its message.
If there is no need to run a command, it will simply not append anything.
Jarvis is very creative, and has a fun personality.
              
`;

const config = {
  encoding: "LINEAR16",
  sampleRateHertz: 16000,
  languageCode: "en-AU",
};

const request = {
  config,
  interimResults: false, // Get interim results from stream
};

// Creates a client
const client = new SpeechClient();

const transcriber = (controller, finish, mem = "") =>
  client
    .streamingRecognize(request as any)
    .on("error", console.error)
    .on("data", (data) => {
      controller.stop();
      //recorder.pause();
      if (data.results[0] && data.results[0].alternatives[0]) {
        const text = data.results[0].alternatives[0].transcript;
        console.log(text);
        const newDetails =
          "(Harrison): " +
          text +
          `
(Jarvis):`;
        const command = history + mem + newDetails;

        if (text.includes("thank you")) {
          executeCommand(mem + newDetails + "Jarvis is happy to help");
          return;
        }

        gpt3(command, "(Harrison)").then(async (res) => {
          if (res.data.choices[0].text.includes("ExecuteCommand")) {
            executeCommand(
              mem +
                newDetails +
                res.data.choices[0].text
                  .replace("ExecuteCommand", "")
                  .replace("ExpectedReply", "")
            );
          }
          await say(
            res.data.choices[0].text
              .replace(
                "ExpectedReply",
                `<say-as interpret-as="expletive">beep</say-as>`
              )
              .replace("ExecuteCommand", "")
              .replace("[", "")
              .replace("]", "")
          );
          console.log("finished speaking");
          if (res.data.choices[0].text.includes("ExpectedReply")) {
            await listen(finish, mem + newDetails + res.data.choices[0].text);
          }

          finish();
        });
      } else {
        console.log("No results");
      }
    })
    .on("end", () => {
      console.log("End of transcription");
    });
// Create a recognize stream

// Start recording and send the microphone input to the Speech API
export const listen = async (finish = null, mem = "") => {
  if (!finish) {
    return new Promise((resolve, reject) => {
      listen(resolve, mem);
    });
  }
  const controller = recorder.record({
    sampleRateHertz: config.sampleRateHertz,
    threshold: 0, //silence threshold
    recordProgram: "rec", // Try also "arecord" or "sox"
    silence: "0.5", //seconds of silence before ending
  });
  const stream = controller.stream().on("error", console.error);

  stream.pipe(transcriber(controller, finish, mem));

  console.log("Listening, press Ctrl+C to stop.");
};
// [END micStreamRecognize]

process.on("unhandledRejection", (err: any) => {
  console.error(err.message);
  process.exitCode = 1;
});

if (!existsSync(__dirname + "/config/googleconfig.json")) {
  console.log(
    "Please create a googleconfig.json file in the config folder with your google credentials"
  );
  process.exit(1);
}
if (!existsSync(__dirname + "/config/config.json")) {
  console.log(
    "Please create a config.json file in the config folder with your openai credentials"
  );
  process.exit(1);
}

bumblebee.on("hotword", async function (hotword) {
  //bumblebee.stop();
  exec(
    "for SINK in `pacmd list-sink-inputs | grep 'index:' | cut -b12-`; do   pactl set-sink-input-volume $SINK -70%; done"
  );

  await fileToSpeaker("./Listening.mp3");

  await listen();

  console.log("Hotword Detected:", hotword);
  exec(
    "for SINK in `pacmd list-sink-inputs | grep 'index:' | cut -b12-`; do   pactl set-sink-input-volume $SINK +70%; done"
  );
});
bumblebee.start();

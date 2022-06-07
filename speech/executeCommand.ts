import { customCommands } from "../config/commands";
import { exec } from "child_process";
import { gpt3 } from "../gpt3/gpt3";

const promisify = <T extends typeof customCommands>(
  obj: T
): {
  [key in keyof T]: (args: string) => Promise<any>;
} =>
  Object.keys(obj).reduce(
    (acc, key: keyof T) => {
      acc[key] = (args) =>
        new Promise((res, rej) =>
          obj[key](args, (err, data) => (err ? rej(err) : res(data)))
        );
      return acc;
    },
    {} as {
      [key in keyof T]: (args: string) => Promise<any>;
    }
  );
const commands = promisify(customCommands);

const myprompt = (convo) =>
  `You are an AI subroutine in charge of interpreting a conversation and applying the correct bash commands.
you can use the following commands: ${Object.keys(commands).join(", ")}
syntax is: command(arguments)
sequential commands are seperated by newlines, but website queries should be included in urls
example: chrome(https://google.com)
convo to interpret: (${convo})

command Result:`;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
export const executeCommand = async (convo) => {
  return gpt3(myprompt(convo)).then(async (res) => {
    for (const command of res.data.choices[0].text.split("\n")) {
      console.log(command);

      const foundCommand = Object.keys(commands).find((key) =>
        command.toLowerCase().includes(key.toLowerCase())
      );
      if (!foundCommand) {
        console.log("no command found");
        continue;
      }
      const commandArgs = command
        .toLowerCase()
        .replace(foundCommand.toLowerCase(), "")
        .trim()
        .replace(/\(|\)/g, "");

      console.log(commandArgs);
      await commands[foundCommand](commandArgs);
      await delay(1000);
    }
    return;
  });
};

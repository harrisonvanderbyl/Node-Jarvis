import { MessageOptions } from "discord.js";
import { characters as chars } from "./characters.json";
import { gpt3 } from "./gpt3";
import { synthesize } from "../speech/synth";

var mem: string | null = null;
type AIResponse = {
  content: string | null;
  username: string;
  avatar_url?: string;
  embeds?: MessageOptions["embeds"];
  audio: Buffer | null;
}[];
export async function getAIResponse(
  id: string,
  message: string,
  server: string,
  callingUser = "Person"
): Promise<AIResponse> {
  const char = chars.find((ch) =>
    ch.name.toLowerCase().includes(id.split(",").join("").toLowerCase())
  );
  if (!char) return [];
  const current = mem ? mem : "";
  const calling =
    current +
    "Person(" +
    callingUser +
    ")" +
    ":" +
    message +
    "\n" +
    char.name +
    ":";
  const response = await gpt3(
    char.prompt + calling,
    "Person",
    `server<${server}> Username:<${callingUser}>`
  );

  if (!response.data?.choices?.[0]?.text?.split(" ").join("").length) {
    return [
      {
        content: "...",
        username: char.name,
        avatar_url: char.avatar,
        audio: null,
      },
    ];
  }
  mem = calling + response.data.choices[0].text + "\n";
  const voice = false
    ? Buffer.from(
        await synthesize(
          response.data.choices[0].text,
          char.voice,
          char.speed,
          char.pitch
        )
      )
    : null;
  const returns: AIResponse = [
    {
      content: response.data.choices[0].text,
      username: char.name,
      avatar_url: char.avatar,
      audio: voice,
    },
  ];
  if (mem.length > 700) {
    mem = null;
    returns.push({
      username: "System",
      content: null,
      embeds: [
        {
          description:
            "Bots too powerful... Wiping memory banks... Checking [resources](https://www.patreon.com/unexplored_Horizons/)... ",
        },
      ],
      avatar_url:
        "https://discord.com/assets/509dd485f6269e2521955120f3e8f0ef.svg",
      audio: null,
    });
  }
  return returns;
}

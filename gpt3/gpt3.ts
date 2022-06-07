import { Configuration, OpenAIApi } from "openai";

import { apikey } from "../config/config.json";

const configuration = new Configuration({
  apiKey: apikey,
});

const openai = new OpenAIApi(configuration);

export const gpt3 = async (
  prompt = "",
  stop: string[] | string | undefined = undefined, // Terminate at this string
  requestor = "HarrisonVanderbyl@gmail.com", // For complience, all requests need to send identifying infomation
  engine = "text-davinci-002"
) =>
  openai.createCompletion(engine, {
    prompt,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    stop: stop,
    frequency_penalty: 0.6,
    user: requestor,
  });

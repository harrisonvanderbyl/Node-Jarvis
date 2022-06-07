# Node-Jarvis

Node-Jarvis is a programmable personal assistant that runs on various AI services, Google speech ⇄ text services, and OpenaAI Gpt3.

## Installation

It's a node-typescript project, install the yarn dependencies with

```bash
yarn install
```

you should also create a "config.json" file in the config folder with the gpt3 key

```json
{
  "apikey": "YOUR_GPT3_API_KEY"
}
```

You should also have a "googleconfig.json" file in the config folder that contains your google api keys json download.

You should activate the "Text to speech" and "Speech to text" APIs in your google account.

## Usage

Start the script with

```bash
node-ts ./speech.ts
```

Wake by speaking:

```
"Hey Jarvis"
```

Jarvis will respond, and ask for more information if needed.
If it decides it has enough information, it will try and parse your command by activating one of the methods specified in the
[Command List](./config/commands.ts)

If Jarvis is not confident that it can parse the command, you can use

```
"Thank You"
```

anywhere in your wording to end the conversation and force Jarvis to attempt to parse the command.

## Adding your own commands

You can add your own commands to the [Command List](./config/commands.ts)

commands are structured as follows:

```ts
{
  "DescriptiveName": (args,callback) => {
    // Your code here

    // When finished, call the callback function
    callback()
  }
}
```

## License

Personal I guess, not sure

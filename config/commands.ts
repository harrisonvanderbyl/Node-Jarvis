import * as WomboDreamApi from "wombo-dream-api";

import { exec } from "child_process";
import { say } from "../speech/synth";

export const customCommands: {
  [key: string]: (
    args: string,
    callback?: (err: any, data: any) => any
  ) => void;
} = {
  chrom: (args, callback = () => {}) =>
    exec("chromium '" + args.replace('"', "") + "'", callback),
  firefox: (args, callback = () => {}) =>
    exec('firefox "' + args.replace('"', "") + '"', callback),
  "youtube-url": (args, callback = () => {}) =>
    exec("chromium '" + args.replace('"', "") + "'", callback),

  // Move mouse
  //   "xdotool-mousemove": (args, callback = () => {}) =>
  //     exec("xdpyinfo | grep dimensions: | awk '{print $2}'", (err, data) => {
  //       exec(
  //         "xdotool mousemove " +
  //           args
  //             .replace("%", "")
  //             .split(",")
  //             .join(" ")
  //             .split(" ")
  //             .filter((w) => w.length)
  //             .map((p, i) =>
  //               ((Number(p) / 100.0) * Number(data.split("x")[i])).toFixed(0)
  //             )
  //             .join(" "),
  //         callback
  //       );
  //     }),

  // Click mouse
  //   "xdotool-mouse-click": (args, callback = () => {}) =>
  //     exec("xdotool click " + args, callback),
  // Scroll mouse
  // "xdotool-scroll": (args, callback = () => {}) =>
  //   exec("xdotool scroll " + args, callback),
  // Type text
  "xdotool-type": (args, callback = () => {}) =>
    exec("xdotool type '" + args + "'", callback),
  // Say text out loud
  "say-out-loud": (args, callback = () => {}) =>
    say(args) && callback(null, null),

  // open teams
  teams: (_args = null, callback = () => {}) => exec("teams", callback),
  // open slack
  slack: (_args = null, callback = () => {}) =>
    exec("firefox https://slack.com/", callback),
  // spotify
  // spotify: (_args = "", callback = () => {}) =>
  //   exec(
  //     "firefox https://open.spotify.com/" +
  //       _args.replace("https://open.spotify.com/", ""),
  //     callback
  //   ),
  // media button play
  // mediaPlay: (args, callback = () => {}) =>
  //   exec("xdotool key XF86AudioPlay", callback),
  // // media button pause
  // mediaPause: (args, callback = () => {}) =>
  //   exec("xdotool key XF86AudioPlay", callback),
  // // media button next
  // mediaNext: (args, callback = () => {}) =>
  //   exec("xdotool key XF86AudioNext", callback),
  // // media button previous
  // mediaPrevious: (args, callback = () => {}) =>
  //   exec("xdotool key XF86AudioPrev", callback),
  // media button volume up
  pacmdSetVolume: (args, callback = () => {}) =>
    exec(
      `for SINK in \`pacmd list-sinks | grep 'index:' | cut -b12-\`; do   pactl set-sink-volume $SINK ${args.replace(
        "%",
        ""
      )}%; done`,
      callback
    ),
  // press enter key
  pressEnterKey: (args, callback = () => {}) =>
    exec("xdotool key Return", callback),

  //press a key
  "xdotool-key": (args, callback = () => {}) =>
    exec("xdotool key " + args, callback),
  // Open text editor
  "open-text-editor": (args, callback = () => {}) =>
    exec("gedit " + args) && callback(null, null),

  "paint-a-painting-of": (args, callback = () => {}) => {
    WomboDreamApi.buildDefaultInstance()
      .generatePicture(args, 10, (task: { [key: string]: any }) => {
        console.log(task.state, "stage", task.photo_url_list.length);
      })
      .then(async (task: { [key: string]: any }) => {
        exec(
          'curl "' +
            task?.result.final +
            '" --output ./temp.jpeg && eog ./temp.jpeg &',
          callback
        );
      })
      .catch((err) => {
        console.error(err);
        callback(err, null);
      });
  },
};

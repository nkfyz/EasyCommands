import ansi from "ansi-escapes";
import chalk from "chalk";

import isterm from "../isterm/index.js";
import { Shell } from "../utils/shell.js";
import { inferShell } from "../utils/shell.js";
import { SuggestionManager, Suggestion } from "../core/suggestionManager.js";
import readline from "node:readline";

export type KeyPressEvent = [string | null | undefined, KeyPress];

type KeyPress = {
  sequence: string;
  name: string;
  ctrl: boolean;
  shift: boolean;
};


const writeOutput = (data: string) => {
    process.stdout.write(data);
  };


export async function render() {
    const shell = (await inferShell()) as unknown as Shell;
    const term = await isterm.spawn({ shell, rows: process.stdout.rows, cols: process.stdout.columns, underTest: false, login: false });
    const suggestionManager = new SuggestionManager(term);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);

    term.onData((data) => {
          writeOutput(data);
    });

    process.stdin.on("keypress", async (...keyPress: KeyPressEvent) => {
        // ctrl + c
        if (keyPress[1].ctrl && keyPress[1].name === "c") {
            process.exit();
        }
        
        // space
        if (keyPress[1].name === "space" || keyPress[1].name === "backspace") {
            const cmd = term.getCommandState().commandText
            const cursor_x = term.getCursorState().cursorX;
            if (cmd) {
                suggestionManager._load_suggestions(cmd, cursor_x);
            }
        }

        // up or down or return
        if (keyPress[1].name === "up" || keyPress[1].name === "down" || keyPress[1].name === "return") {
            if (suggestionManager._update_suggestions(keyPress[1].name)) {
                term.write(keyPress[1].sequence);
            } else {
                // observe update
            }
        } else {
            term.write(keyPress[1].sequence);
        }

        
    });
}



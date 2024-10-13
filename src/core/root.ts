import ansi from "ansi-escapes";
import chalk from "chalk";

import isterm from "../isterm/index.js";
import { Shell } from "../utils/shell.js";
import { inferShell } from "../utils/shell.js";
import { SuggestionManager, Suggestion } from "./suggestionManager.js";
import readline from "node:readline";

import { writeOutput, KeyPressEvent } from "../utils/common.js";


export async function render() {
    const shell = (await inferShell()) as unknown as Shell;
    const term = await isterm.spawn({ shell, rows: process.stdout.rows, cols: process.stdout.columns, underTest: false, login: false });
    const suggestionManager = new SuggestionManager(term);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);

    writeOutput("Welcome to isterm! Type 'git' and press space to see suggestions.");

    term.onData((data) => {
          writeOutput(data);
    });

    process.stdin.on("keypress", async (...keyPress: KeyPressEvent) => {
        if (keyPress[1].ctrl && keyPress[1].name === "c") {
            process.exit();
        }

        if (suggestionManager.handle_keypress(keyPress)) {
            if (suggestionManager._update_suggestions(keyPress)) {
                // observe update
            } else {
                term.write(keyPress[1].sequence);
            }
        } else {
            suggestionManager.process_keypress(term, keyPress);
            term.write(keyPress[1].sequence);
        }
    });
}



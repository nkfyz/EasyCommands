import ansi from "ansi-escapes";
import chalk from "chalk";

import isterm from "../isterm/index.js";
import { Shell } from "../utils/shell.js";
import { inferShell } from "../utils/shell.js";
import { SuggestionManager, Suggestion } from "./suggestionManager.js";
import readline from "node:readline";

import { writeOutput, KeyPressEvent, getBackspaceSequence } from "../utils/common.js";


export async function render() {
    const shell = (await inferShell()) as unknown as Shell;
    const term = await isterm.spawn({ shell, rows: process.stdout.rows, cols: process.stdout.columns, underTest: false, login: false });
    const suggestionManager = new SuggestionManager(term);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);

    // writeOutput(ansi.clearScreen);
    // writeOutput(chalk.red("---------------------------------------------------------------------\n"));
    // writeOutput(chalk.red("| Welcome to EasyCommands Type 'git' and press space to see suggestions. |\n"));
    // writeOutput(chalk.red("---------------------------------------------------------------------\n"));

    term.onData((data) => {
        writeOutput(data);
        // suggestionManager.render_suggestions();
    });

    process.stdin.on("keypress", async (...keyPress: KeyPressEvent) => {
        /*
            The following keys should be controlled by EasyCommands:
            1. `ctrl + c`   exit the process 
            2. `up`         move up the suggestion list
            3. `down`       move down the suggestion list
            4. `return`     select the suggestion
        */

        if (keyPress[1].ctrl && keyPress[1].name === "c") {
            process.exit();
        }
        
        if (suggestionManager.handle_keypress(keyPress)) {
            if (suggestionManager.update_suggestions(keyPress)) {
                // update list here
            } else {
                term.write(keyPress[1].sequence);
            }
        } else {
            if (keyPress[1].name === "backspace") {
                term.write(getBackspaceSequence(keyPress, shell));
            } else {
                term.write(keyPress[1].sequence);
            }
        }
    });
}

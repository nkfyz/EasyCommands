import ansi from "ansi-escapes";
import chalk from "chalk";

import isterm from "./isterm/index.js";
import { Shell } from "./utils/shell.js";
import { inferShell } from "./utils/shell.js";
import readline from "node:readline";

import { writeOutput, KeyPressEvent, getBackspaceSequence } from "./utils/common.js";

async function render() {
    const shell = (await inferShell()) as unknown as Shell;
    const term = await isterm.spawn({ shell, rows: process.stdout.rows, cols: process.stdout.columns, underTest: false, login: false });
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);

    term.onData((data) => {
        writeOutput(data);
        // suggestionManager.render_suggestions();
        const cmd = term.getCommandState().commandText;
        console.log('----- ', cmd, '-----')
    });

    process.stdin.on("keypress", async (...keyPress: KeyPressEvent) => {

        if (keyPress[1].ctrl && keyPress[1].name === "c") {
            process.exit();
        }
        
        term.write(keyPress[1].sequence);
    });
}

render();
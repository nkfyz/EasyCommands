import ansi from "ansi-escapes";
import wrapAnsi from "wrap-ansi";
import chalk from "chalk";

const writeOutput = (data) => {
    process.stdout.write(data);
  };

export function render_commands(commands, x) {
    const n = commands.length;

    writeOutput(ansi.cursorHide);

    commands.forEach((command) => {
        writeOutput('\n' + command);
    });
    
    writeOutput(ansi.cursorLeft)
    writeOutput(ansi.cursorMove(x, -n))
    writeOutput(ansi.cursorShow)
}
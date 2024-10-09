import * as pty from 'node-pty';
import { createRequire } from 'module';
import { writeOutput } from './utils.js';
import ansi from "ansi-escapes";
import wrapAnsi from "wrap-ansi";
import chalk from "chalk";


export class FTerminal {
    constructor(name, shell, rows, cols, max_command_num) {
        this.name = name
        this.shell = shell
        this.rows = rows
        this.cols = cols
        this.max_command_num = max_command_num

        this.selected_id = 0
        this.commands = ['cursor_x', 'command222', 'command3333']
        this.command_num = 0
        this.cursor_x = 0
        this.PERFIX = '> ';
        this.FILLME = '  ';

        this.pty = pty.spawn(shell, [], {
            name: this.name,
            cols: this.cols,
            rows: this.rows,
            cwd: process.env.HOME,
            env: process.env
        });

        // recv data from pty
        this.pty.onData((data) => {
            process.stdout.write(data);
        });

        // recv data from user
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (input) => {
            const inputStr = input.toString();
            
            if (inputStr === 'a'){
                this._render_commands();
            }
            
            if (input === '\u001b[B'){
                this._update_commands('down');
            }
        
            if (input === '\u0003') { // '\u0003' 是 Ctrl+C
                process.exit();
            }
        
            this.pty.write(inputStr);
        });

    }

    _get_cursor_x() {
        const require = createRequire(import.meta.url);
        const getCursorPosition = require('get-cursor-position');
        var pos = getCursorPosition.sync();
        return pos.col - 1;
    }

    _render_commands() {
        var commands = this.commands;
        this.command_num = commands.length;
        var command_num = this.command_num;
        this.cursor_x = this._get_cursor_x();

        writeOutput(ansi.cursorHide);
        for (let i = 0; i < command_num; i++) {
            if (i === this.selected_id) {
                writeOutput('\n' + chalk.green.bold(this.PERFIX + commands[i]));
            } else {
                writeOutput('\n' + this.FILLME + commands[i]);
            }
        }
        writeOutput(ansi.cursorLeft)
        writeOutput(ansi.cursorMove(this.cursor_x, -command_num))
        writeOutput(ansi.cursorShow)
    }

    _clear_commands() {

    }

    _update_commands(op) {
        var selected_id = this.selected_id;
        var command_num = this.command_num;

        switch(op) {
            case 'down':
                if ((selected_id + 1) >= command_num) {
                    this.selected_id = 0;
                } else {
                    this.selected_id += 1;
                }
                this._render_commands();
        }
    }
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import * as pty from 'node-pty';


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
        this.curr_cmd = ''
        this.suggest_cmds = [
            'activate',
            'remove',
            'init'
        ]
        // TODO(nkfyz): Replace this.commands with this.suggest_cmds
        this.commands = this.suggest_cmds
        this.suggest_cmds_desc = [
            'Activate a conda environment.',
            'Remove a conda environment.',
            'Initialize a conda environment.'
        ]
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
        this.terminal = new xterm.Terminal({
            cols: this.cols,
            rows: this.rows
        });

        // recv data from pty
        this.pty.onData((data) => {
            this.terminal.write(data);
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

            if (input === '\u001b[A'){
                this._update_commands('up');
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
        console.log(this.terminal.buffer.active.cursorX);
        return this.terminal.buffer.active.cursorX;
    }

    _render_commands() {
        var commands = this.commands;
        this.command_num = commands.length;
        var command_num = this.command_num;
        this.cursor_x = this._get_cursor_x();

        writeOutput(ansi.cursorHide);
        for (let i = 0; i < command_num; i++) {
            if (i === this.selected_id) {
                writeOutput(
                    '\n' +
                    chalk.green.bold(this.PERFIX + commands[i]) + 
                    '\t' +
                    chalk.gray(this.suggest_cmds_desc[i])
                );
            } else {
                writeOutput(
                    '\n' +
                    this.FILLME + commands[i] + 
                    '\t' +
                    chalk.gray(this.suggest_cmds_desc[i])
                );
            }
        }
        writeOutput(ansi.cursorLeft)
        writeOutput(ansi.cursorMove(this.cursor_x, -command_num))
        writeOutput(ansi.cursorShow)
    }

    _clear_commands() {
        this.selected_id = 0;
        this.commands = [];
        this.suggest_cmds = [];
        this.suggest_cmds_desc = [];
        this.command_num = 0;
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
            case 'up':
                if ((selected_id - 1) < 0) {
                    this._clear_commands();
                } else {
                    this.selected_id -= 1;
                }
            case 'enter':
                // do nothing
        }
        this._render_commands();
    }
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import * as pty from 'node-pty';
import { writeOutput, extract_cursor_pos } from './utils.js';
import ansi from "ansi-escapes";
import wrapAnsi from "wrap-ansi";
import chalk from "chalk";
import ansiRegex from 'ansi-regex';

const {Terminal} = require(`xterm-headless`);
import { Unicode11Addon } from "@xterm/addon-unicode11";

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
        this.suggest_cmds_desc = [
            'Activate a conda environment.',
            'Remove a conda environment.',
            'Initialize a conda environment.'
        ]
        this.command_num = 0
        this.cursor_x = -1
        this.first_render = true
        this.PERFIX = '> ';
        this.FILLME = '  ';
        this.get_position_cmd = false

        this.pty = pty.spawn(shell, [], {
            name: this.name,
            cols: this.cols,
            rows: this.rows,
            cwd: process.env.HOME,
            env: process.env
        });

        const unicode11Addon = new Unicode11Addon();
        this.terminal = new Terminal({
            allowProposedApi: true,
            cols: this.cols,
            rows: this.rows
        });
        this.terminal.loadAddon(unicode11Addon);
        this.terminal.unicode.activeVersion = "11";

        // recv data from user
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (input) => {
            const inputStr = input.toString();
            var send_to_xterm = true;
            var send_to_pty = true;

            if (this.get_position_cmd) {
                var pos = inputStr.match(ansiRegex());
                var cursor_x = extract_cursor_pos(pos[0]);
                if (cursor_x != -1) {
                    this.cursor_x = Number(cursor_x)
                    writeOutput(ansi.cursorHide);
                    this.command_num = this.suggest_cmds.length;
                    for (let i = 0; i < this.command_num; i++) {
                        if (i === this.selected_id) {
                            writeOutput(
                                '\n' + 
                                chalk.green.bold(this.PERFIX + this.suggest_cmds[i]) + 
                                '\t' +
                                chalk.gray(this.suggest_cmds_desc[i])
                            );
                        } else {
                            writeOutput(
                                '\n' +
                                this.FILLME + this.suggest_cmds[i] + 
                                '\t' +
                                chalk.gray(this.suggest_cmds_desc[i])
                            );
                        }
                    }
                    writeOutput(ansi.cursorLeft)
                    writeOutput(ansi.cursorMove(this.cursor_x, -this.command_num))
                    writeOutput(ansi.cursorShow)
                } else {
                    console.log('Error: cannot get cursor position.')
                }
                this.get_position_cmd = false;
            } else {
                send_to_xterm, send_to_pty = this._keyboard_controller(input);
            
                if (send_to_xterm) {
                    this.terminal.write(input);
                }
                if (send_to_pty) {
                    this.pty.write(inputStr);
                }
            }
        });

        this.pty.onData((data) => {
            this.terminal.write(data);
            process.stdout.write(data);
        });

    }

    async _get_cursor_x() {
        this.get_position_cmd = true;
        process.stdout.write(ansi.cursorGetPosition);
    }

    _keyboard_controller(input) {
        var send_to_xterm = true;
        var send_to_pty = true;

        switch(input) {
            case 'a':
                this._render_commands();
                break;
            case '\u001b[A':
                this._update_commands('up');
                break;
            case '\u001b[B':
                this._update_commands('down');
                break;
            case '\u0003':
                process.exit();
            case '\u0008': // backsapce
            case '\b':
            case '\u007F':
                send_to_xterm = false;
                break;
        }

        return send_to_xterm, send_to_pty;
    }

    _render_commands() {
        this.command_num = this.suggest_cmds.length;
        
        if (this.first_render) {
            this._get_cursor_x();
        } else {
            this.first_render = false;
            writeOutput(ansi.cursorHide);
            for (let i = 0; i < this.command_num; i++) {
                if (i === this.selected_id) {
                    writeOutput(
                        '\n' + 
                        chalk.green.bold(this.PERFIX + this.suggest_cmds[i]) + 
                        '\t' +
                        chalk.gray(this.suggest_cmds_desc[i])
                    );
                } else {
                    writeOutput(
                        '\n' +
                        this.FILLME + this.suggest_cmds[i] + 
                        '\t' +
                        chalk.gray(this.suggest_cmds_desc[i])
                    );
                }
            }
            writeOutput(ansi.cursorLeft)
            writeOutput(ansi.cursorMove(this.cursor_x, -this.command_num))
            writeOutput(ansi.cursorShow)
        }
    }

    _clear_commands() {
        this.selected_id = 0;
        this.commands = [];
        this.suggest_cmds = [];
        this.suggest_cmds_desc = [];
        this.command_num = 0;
        this.first_render = true;
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
                break;
            case 'up':
                if ((selected_id - 1) < 0) {
                    this._clear_commands();
                } else {
                    this.selected_id -= 1;
                }
                break;
            // case 'enter':
            //     console.log('enter')
        }
        this._render_commands();
    }
}

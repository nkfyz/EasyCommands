import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import * as pty from 'node-pty';
import { writeOutput, extract_cursor_pos } from './utils.js';
import ansi from "ansi-escapes";
import wrapAnsi from "wrap-ansi";
import chalk from "chalk";
import ansiRegex from 'ansi-regex';


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
        this.suggest_cmds_num = 0
        this.cursor_x = -1
        this.PERFIX = '> ';
        this.FILLME = '  ';

        // normal ----> render ----> selection ----> normal
        this.status_list = [
            'normal',
            'selection', // suggested commands is shown
            'render', // first render the suggested commands
        ]
        this.status = 'normal'

        this.pty = pty.spawn(shell, [], {
            name: this.name,
            cols: this.cols,
            rows: this.rows,
            cwd: process.env.HOME,
            env: process.env
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (input) => {
            const inputStr = input.toString();
            var send_to_pty = true;

            if (this.status == 'render') {
                var pos = inputStr.match(ansiRegex());
                this.cursor_x = Number(extract_cursor_pos(pos[0]));
                this.selected_id = 0;
                this._render_commands();
                this.status = 'selection';
            } else if (this.status == 'normal' || this.status == 'selection') {
                send_to_pty = this._keyboard_controller(input);
                if (send_to_pty) {
                    this.pty.write(inputStr);
                }
            }
            
        });

        this.pty.onData((data) => {
            process.stdout.write(data);
        });
    }

    _keyboard_controller(input) {
        var send_to_pty = true;

        switch(input) {
            case 'a':
                // this.curr_cmd += input;
                // var this.suggest_cmds = check();
                // if (this.suggest_cmds.length > 0) {
                //     this._show_commands();
                // }
                this._show_commands();
                break;
            case '\u001b[A':
                // 普通模式：不管
                // selection模式：不发送
                // clean模式：发送
                if (this.status == 'normal') {
                    // Do nothing
                } else if (this.status == 'selection') {
                    this._update_commands('up');
                    send_to_pty = false;
                }
                break;
            case '\u001b[B':
                if (this.status == 'normal') {
                    // Do nothing
                } else if (this.status == 'selection') {
                    this._update_commands('down');
                }
                break;
            case '\u0003':
                process.exit();
            // case '\u0008': // backsapce
            // case '\b':
            // case '\u007F':
            //     break;
        }

        return send_to_pty;
    }

    _show_commands() {
        this.status = 'render';
        process.stdout.write(ansi.cursorGetPosition);
    }

    _render_commands() {
        writeOutput(ansi.cursorHide);
        this.suggest_cmds_num = this.suggest_cmds.length;
        for (let i = 0; i < this.suggest_cmds_num; i++) {
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
        writeOutput(ansi.cursorMove(this.cursor_x, -this.suggest_cmds_num))
        writeOutput(ansi.cursorShow)
    }

    _clear_commands() {
        writeOutput(ansi.cursorHide);
        this.command_num = this.suggest_cmds.length;
        for (let i = 0; i < this.command_num; i++) {
                writeOutput(
                    '\n' +
                    ansi.cursorLeft +  
                    ansi.eraseEndLine
                );
        }
        writeOutput(ansi.cursorLeft)
        writeOutput(ansi.cursorMove(this.cursor_x, -this.command_num))
        writeOutput(ansi.cursorShow)

        this.selected_id = -1;
        this.commands = [];
        this.suggest_cmds = [];
        this.suggest_cmds_desc = [];
        this.suggest_cmds_num = 0;
        this.status = 'normal';
    }

    _update_commands(op) {

        switch(op) {
            case 'down':
                if ((this.selected_id + 1) >= this.suggest_cmds_num) {
                    this.selected_id = 0;
                } else {
                    this.selected_id += 1;
                }
                this._render_commands();
                break;
            case 'up':
                if ((this.selected_id - 1) < 0) {
                    this._clear_commands();
                } else {
                    this.selected_id -= 1;
                    this._render_commands();
                }
                break;
            // case 'enter':
            //     console.log('enter')
        }
        
    }
}

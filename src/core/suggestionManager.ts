import ansi from "ansi-escapes";
import chalk from "chalk";

import { ISTerm } from "../isterm/pty.js";


export class Suggestion {
    name: string;
    description: String;


    constructor(name: string, description: String) {
        this.name = name;
        this.description = description
    }
}


const writeOutput = (data: string) => {
    process.stdout.write(data);
  };

const PERFIX = '> ';
const FILLME = '  ';


export class SuggestionManager {
    term: ISTerm;
    activate_id: number;
    suggestions: Suggestion[];

    constructor(term: ISTerm) {
        this.term = term;
        this.activate_id = 0;
        this.suggestions = [];
    }

    _load_suggestions(cmd: string, cursor_x: number) {
        if (cmd && cmd == 'git') {
            this.suggestions = [
                new Suggestion('add', 'Add file contents to the index'),
                new Suggestion('commit', 'Record changes to the repository'),
                new Suggestion('status', 'Show the working tree status')
            ]
        }

        if (this.suggestions.length != 0) {
            this._render_suggestions();
        } else {
            this._clear_suggestions();
        }
    }

    _render_suggestions() {
        const cursor_x = this.term.getCursorState().cursorX;

        for (let i=0; i<this.suggestions.length; i++) {
            if (i === this.activate_id) {
                writeOutput(
                    ansi.cursorHide + 
                    '\n' + 
                    chalk.green.bold(PERFIX + this.suggestions[i].name) + 
                    '\t' +
                    chalk.gray(this.suggestions[i].description)
                )
            } else {
                writeOutput(
                    ansi.cursorHide + 
                    '\n' + 
                    FILLME + this.suggestions[i].name + 
                    '\t' +
                    chalk.gray(this.suggestions[i].description)
                )
            }
        }

        writeOutput(
            ansi.cursorLeft + 
            ansi.cursorMove(cursor_x, -this.suggestions.length) + 
            ansi.cursorShow
        )
    }

    // return: whether the keypress should be sent to terminal
    _update_suggestions(op: String): boolean {
        if (this.suggestions.length == 0) {
            return true;
        }

        switch(op) {
            case "up":
                if (this.activate_id == 0) {
                    this._clear_suggestions()
                } else {
                    this.activate_id -= 1;
                    this._render_suggestions();
                }
                break;
            case "down":
                if (this.activate_id == this.suggestions.length - 1) {
                    this.activate_id = 0;
                } else {
                    this.activate_id += 1;
                }
                this._render_suggestions();
                break;
            case "return":
                this._writeback_suggestion();
                break;
                
        }
        return false;
    }

    _clear_suggestions() {
        const cursor_x = this.term.getCursorState().cursorX;

        writeOutput(ansi.cursorHide);
        for (let i = 0; i < this.suggestions.length; i++) {
                writeOutput(
                    '\n' +
                    ansi.cursorLeft +  
                    ansi.eraseEndLine
                );
        }
        writeOutput(ansi.cursorLeft)
        writeOutput(ansi.cursorMove(cursor_x, -this.suggestions.length))
        writeOutput(ansi.cursorShow)

        this.activate_id = 0;
        this.suggestions = [];
    }

    _writeback_suggestion() {
        const suggestion = this.suggestions[this.activate_id];
        this._clear_suggestions();
        writeOutput(suggestion.name);
    }
}
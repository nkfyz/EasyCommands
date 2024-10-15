import ansi from "ansi-escapes";
import chalk from "chalk";

import { ISTerm } from "../isterm/pty.js";
import { writeOutput, PERFIX, FILLME, KeyPressEvent } from "../utils/common.js";
import process from 'node:process';
import { CommandGenerator } from "./runtime.js";


export class Suggestion {
    name: string;
    description: String;

    constructor(name: string, description: String) {
        this.name = name;
        this.description = description
    }
}


export class SuggestionManager {
    term: ISTerm;
    activate_id: number;
    suggestions: Suggestion[];
    commandGenerator: CommandGenerator;

    constructor(term: ISTerm) {
        this.term = term;
        this.activate_id = 0;
        this.suggestions = [];

        this.commandGenerator = new CommandGenerator();
    }

    render_suggestions() {
            this._load_suggestions();
    }

    handle_keypress(keyPress: KeyPressEvent): boolean {
        if (keyPress[1].name == "down" || 
            keyPress[1].name == "up" || 
            keyPress[1].name == "return") {
            return true
        } else {
            return false
        }
    }

    _load_suggestions() {
        const cmd = this.term.getCommandState().commandText;
        if (cmd) {
            const suggestions = this.commandGenerator.generate_commands(cmd);
            if (suggestions.length > 0) {
                this.suggestions = suggestions;
                this._render_suggestions();
            } else {
                this._clear_suggestions();
            }
        } else {
            // todo
        }
    }

    _render_suggestions() {
        const cursor_x = this.term.getCursorState().cursorX;

        /*
            Render commands.
        */
        for (let i=0; i<this.suggestions.length; i++) {
            if (i === this.activate_id) {
                writeOutput(
                    ansi.cursorHide + 
                    '\n' + 
                    ansi.eraseLine + 
                    chalk.green.bold(PERFIX + this.suggestions[i].name) + 
                    '\t' +
                    chalk.gray(this.suggestions[i].description)
                )
            } else {
                writeOutput(
                    ansi.cursorHide + 
                    '\n' + 
                    ansi.eraseLine + 
                    FILLME + this.suggestions[i].name + 
                    '\t' +
                    chalk.gray(this.suggestions[i].description)
                )
            }
        }

        /*
            Render page information.
        */
        writeOutput(
            '\n' + 
            ansi.cursorLeft + 
            ansi.eraseEndLine + 
            chalk.gray(
                '  [' + 
                (this.activate_id + 1) + 
                '/' + 
                this.suggestions.length + 
                ']'
            )
        )

        /*
            Get back to command line.
        */
        writeOutput(
            ansi.cursorLeft + 
            ansi.cursorMove(cursor_x, -this.suggestions.length - 1) + 
            ansi.cursorShow
        )
    }

    update_suggestions(keyPress: KeyPressEvent): boolean {
        if (this.suggestions.length == 0) {
            return false;
        }

        const op = keyPress[1].name;
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
        return true;
    }

    _clear_suggestions() {
        const cursor_x = this.term.getCursorState().cursorX;

        writeOutput(ansi.cursorHide);
        for (let i = 0; i < this.suggestions.length + 1; i++) {
                writeOutput(
                    '\n' +
                    ansi.cursorLeft +  
                    ansi.eraseEndLine
                );
        }
        writeOutput(ansi.cursorLeft)
        // The page information occupies an additional line,
        // hence we need to move the cursor back one more line [-(length+1)].
        writeOutput(ansi.cursorMove(cursor_x, -this.suggestions.length - 1))
        writeOutput(ansi.cursorShow)

        this.activate_id = 0;
        this.suggestions = [];
    }

    _writeback_suggestion() {
        const suggestion = this.suggestions[this.activate_id];
        this._clear_suggestions();
        this.term.write(suggestion.name);
    }
}
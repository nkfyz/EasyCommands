import { Suggestion } from "./suggestionManager";
import { Specifications } from "./spec";

export class CommandGenerator {
    curr_cmd: string[];

    constructor() {
        this.curr_cmd = [];
    }

    generate_commands(cmd: string): Suggestion[] {
        var suggestions: Suggestion[] = []
        if (!cmd) {
            // todo
        } else {
            var curr_spec = Specifications;
            for (let i=0; i<this.curr_cmd.length; i++) {
                curr_spec = curr_spec.subcommands[this.curr_cmd[i]];
            }
            if (Specifications[cmd]) {
                const subcommands = Specifications[cmd].subcommands;
                for (let i=0; i<subcommands.length; i++) {
                    suggestions.push(new Suggestion(subcommands[i].name, subcommands[i].description));
                }
            }
            this.curr_cmd.push(cmd);
            }
        return suggestions;
    }
}

export function generate_commands(cmd: string): Suggestion[] {
    var suggestions: Suggestion[] = []
    if (!cmd) {
        // todo
    } else {
        if (Specifications[cmd]) {
            const subcommands = Specifications[cmd].subcommands;
            for (let i=0; i<subcommands.length; i++) {
                suggestions.push(new Suggestion(subcommands[i].name, subcommands[i].description));
            }
        }
    }
    return suggestions;
    
}
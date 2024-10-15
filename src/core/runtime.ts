import { Suggestion } from "./suggestionManager";
import { Specifications } from "./spec";

export class CommandGenerator {
    cmd_queue: string[];
    spec: any;

    constructor() {
        this.cmd_queue = [];
        this.spec = Specifications;
    }

    generate_commands(cmd: string): Suggestion[] {
        var suggestions: Suggestion[] = []
        if (!cmd) {
            // todo
        } else {
            const cmd_queue = cmd.split(" ");
            console.log(cmd_queue)
            var spec = this.spec;
            for (let i=0; i<cmd_queue.length; i++) {
                spec = spec.subcommands[cmd_queue[i]];
                if (!spec) {
                    return suggestions;
                }
            }
            Object.keys(spec.subcommands).forEach(key => {
                const name = spec.subcommands[key].name;
                const desc = spec.subcommands[key].description;
                suggestions.push(new Suggestion(name, desc));
            });
            Object.keys(spec.options).forEach(key => {
                const name = spec.options[key].name;
                const desc = spec.options[key].description;
                suggestions.push(new Suggestion(name, desc));
            });
        }
        return suggestions;
    }
}

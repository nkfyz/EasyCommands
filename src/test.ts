import { CommandGenerator } from "./core/runtime.js";
const commandGenerator = new CommandGenerator()
const suggestions = commandGenerator.generate_commands("conda  123")
console.log(suggestions)
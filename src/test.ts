import { CommandGenerator } from './core/runtime.js';

const commandGenerator = new CommandGenerator();
const cmd = "cd ";
const suggestions = commandGenerator.generate_commands(cmd);

console.log(suggestions);
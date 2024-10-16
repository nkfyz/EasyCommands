import { CommandGenerator } from './core/runtime.js';

const commandGenerator = new CommandGenerator();
const cmd = "conda activate ";
const suggestions = commandGenerator.generate_commands(cmd);

console.log(suggestions);



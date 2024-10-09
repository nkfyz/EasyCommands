import * as os from 'node:os';
import { execNativeCommand } from './utils.js';


import { FTerminal } from './terminal.js';

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh';
const cols = 80;
const rows = 30;

// execNativeCommand('clear')
// console.log('-----------------------------------------------------');
// console.log('| Welcome to EasyPrompt - A simple command line tool |');
// console.log('-----------------------------------------------------');

const fterminal = new FTerminal('EasyPrompt', shell, cols, rows, 10);

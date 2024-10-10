import * as os from 'node:os';
import { execNativeCommand } from './utils.js';
import { FTerminal } from './terminal.js';


const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh';
const cols = 80;
const rows = 30;

const fterminal = new FTerminal('EasyPrompt', shell, rows, cols, 10);

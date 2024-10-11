import * as pty from 'node-pty';
import * as os from 'node:os';

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh';
const cols = 80;
const rows = 30;

const mypty = pty.spawn(shell, [], {
    name: 'hello',
    cols: cols,
    rows: rows,
    cwd: process.env.HOME,
    env: process.env
});

process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

process.stdin.on('data', (input) => {
    const inputStr = input.toString();


    
    mypty.write(inputStr);
    
    
});

mypty.onData((data) => {
    process.stdout.write(data);
});

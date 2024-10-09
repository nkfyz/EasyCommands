import * as os from 'node:os';
import * as pty from 'node-pty';
import xterm from "@xterm/headless";
import { render_commands } from './display.js';

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh';

const cols = 80;
const rows = 30;

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: cols,
  rows: rows,
  cwd: process.env.HOME,
  env: process.env
});

const term = new xterm.Terminal({ allowProposedApi: true, rows, cols });

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

ptyProcess.onData((data) => {
  process.stdout.write(data);
  term.write(data);
});

function getCursorState() {
    return {
      onLastLine: term.buffer.active.cursorY >= term.rows - 2,
      remainingLines: Math.max(term.rows - 2 - term.buffer.active.cursorY, 0),
      cursorX: term.buffer.active.cursorX,
      cursorY: term.buffer.active.cursorY,
    };
  }

process.stdin.on('data', (input) => {
    const inputStr = input.toString();
    // if input is space
    // send the input to trie
    // get commands!
    if (input === 'a'){
        render_commands(['command11', 'command222', 'command3333']);
    }

    if (input === '\u0003') { // '\u0003' 是 Ctrl+C
        process.exit();
    }
    // 发送输入到伪终端
    term.write(inputStr);
    ptyProcess.write(inputStr);

  });
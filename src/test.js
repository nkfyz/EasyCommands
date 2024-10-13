import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const xterm = require('@xterm/headless');

const term = new xterm.Terminal({ allowProposedApi: true, cols: 80, rows: 30 })

term.write('Hello, World!\r\n');
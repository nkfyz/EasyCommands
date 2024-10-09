import ansi from "ansi-escapes";
import wrapAnsi from "wrap-ansi";
import chalk from "chalk";
import readline from 'readline';


var selected_id = 0;
var command_num = 0;

const writeOutput = (data) => {
    process.stdout.write(data);
};


// Down: 1, Up: -1
function _update_command_status() {

}


// Enter
function _confirm_command() {
    
}


// remove command rendering
function _remove_commands() {
    
}


function _get_cursor_x() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });
    rl.write('\x1b[6n');
    process.stdin.on('data', (data) => {
        // 匹配返回的光标位置格式
        const match = data.toString().match(/\[(\d+);(\d+)R/);
        if (match) {
          const row = match[1];
          const col = match[2];
          // console.log(`当前光标位置 - 行: ${row}, 列: ${col}`);
          rl.close(); // 关闭接口
          return col;
        }
    });
}


// render commands for the first time
export function render_commands(commands) {
    command_num = commands.length;

    var x = _get_cursor_x();

    writeOutput(ansi.cursorHide);

    commands.forEach((command) => {
        writeOutput('\n' + command);
    });
    
    writeOutput(ansi.cursorLeft)
    writeOutput(ansi.cursorMove(x=x, -command_num))
    writeOutput(ansi.cursorShow)
}


// update command selections once the keyDown/keyBoard/Enter is pressed
export function update_commands(op) {
    switch(op) {
        case 'keyDown':
            if ((selected_id + 1) > command_num) {
                selected_id = 0;
            } else {
                selected_id += 1;
            }
            _update_command_status();
        case 'keyUp':
            if ((selected_id - 1) < 0) {
                _remove_commands();
            } else {
                selected_id -= 1;
            }
            _update_command_status(selected_id);
        case 'Enter':
            _confirm_command();
    }
}
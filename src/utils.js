import { exec } from 'child_process';

export function execNativeCommand(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行命令时出错: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`错误输出: ${stderr}`);
            return;
        }
        console.log(`命令输出:\n${stdout}`);
        return stdout;
    });
}

export const writeOutput = (data) => {
    process.stdout.write(data);
};

export function extract_cursor_pos(data) {
    return data.split(';')[1].replace('R', '').replace('\n', '');
};
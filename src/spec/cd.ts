import { execSync } from 'child_process';

function get_dirs(cwd: string) {
    const command = "find . -type d -maxdepth 1";
    const out = execSync(command, { cwd: cwd }).toString();
    const dirs = out.split("\n");
    var ret = {}
    for (let i = 1; i < dirs.length; i++) {
        var dir_name = dirs[i].slice(2);   
        if (dir_name === "") {
            continue;
        }
        ret[dir_name] = {
            name: dir_name + '/',
            description: "",
            subcommands: {}
        };
    }

    return ret;
}

export const cd = {
    name: "cd",
    description: "",
    subcommands: get_dirs,
    options: {}
}
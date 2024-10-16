import { execSync } from 'child_process';

function get_dirs() {
    const command = "ls -d */ | xargs -n 1";
    const out = execSync(command, { cwd: process.cwd() }).toString();
    const dirs = out.split("\n");
    var ret = {}
    for (let i = 0; i < dirs.length; i++) {
        var dir_name = dirs[i]
        if (dir_name === "") {
            continue;
        }
        ret[dir_name] = {
            name: dir_name,
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
import { execSync } from 'child_process';

function get_conda_envs() {
    const command = "conda env list";
    const out = execSync(command).toString();

    const lines = out.split("\n");
    var packages = {}
    for (let i = 2; i < lines.length; i++) {
        var pkg_name = lines[i].split(" ").at(0);
        var pkg_path = lines[i].split(" ").at(-1);
        if (pkg_name === "") {
            continue;
        }
        packages[pkg_name] = {
            name: pkg_name,
            description: pkg_path,
            subcommands: {}
        };
    }

    return packages;
}

export const conda = {
    name: "conda",
    description: "Conda is a tool for managing and deploying applications, environments and packages.",
    subcommands: {
        "activate": {
            name: "activate",
            description: "Activate an environment",
            subcommands: get_conda_envs,
            options: {
                "--help": {
                    name: "--help",
                    description: "Show this message and exit.",
                    subcommands: []
                },
            }
        },
        "deactivate": {
            name: "deactivate",
            description: "Deactivate an environment",
            subcommands: {},
            options: {},
        },
    },
    options: {}
}
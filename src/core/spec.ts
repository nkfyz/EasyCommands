/*
    This file contains the specifications for the commands.

    Currently, we support the following commands:
    1. conda
    2. git
    
    The component of a command:
    - key
        - name          : The name of the command
    - values
        - description   : The description of the command
        - options       : The options of the command (e.g., conda `--help`, node `--version`)
        - subcommands   : The subcommands of the command (e.g., git `clone`)
        - args          : The arguments of the command (e.g., git clone `<repo>`)

    The render order:
    1. subcommands
    2. options
*/

export const Specifications = {
    subcommands: {
        "conda": {
            name: "conda",
            description: "Conda is a tool for managing and deploying applications, environments and packages.",
            subcommands: {
                "activate": {
                    name: "activate",
                    description: "Activate an environment",
                    subcommands: {
                        "oss-remover": {
                            name: "oss-remover",
                            description: "/path/to/conda/oss-remover",
                            subcommands: []
                        },
                        "base": {
                            name: "base",
                            description: "/path/to/conda/base",
                            subcommands: []
                        }
                    },
                    options: {
                        "--help": {
                            name: "--help",
                            description: "Show this message and exit.",
                            subcommands: []
                        }
                    }
                },
                "deactivate": {
                    name: "deactivate",
                    description: "Deactivate an environment",
                    subcommands: {},
                    options: {},
                },
            }
        },
    }
    
}
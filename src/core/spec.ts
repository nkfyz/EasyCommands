/*
    This file contains the specifications for the commands.
*/

export const Specifications = {
    subcommands: {
        "conda": {
            description: "Conda is a tool for managing and deploying applications, environments and packages.",
            subcommands: {
                "activate": {
                    name: "activate",
                    description: "Activate an environment",
                    subcommands: ["oss-remover", "oss", "fyz", "test", "hello"]
                },
                "deactivate": {
                    name: "deactivate",
                    description: "Deactivate an environment",
                },
            }
        },
    }
    
}
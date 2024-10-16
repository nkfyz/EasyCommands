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

    The render order:
    1. subcommands
    2. options
*/

import { conda } from '../spec/conda.js';
import { cd } from '../spec/cd.js';
import { git } from '../spec/git.js';

export const Specifications = {
    subcommands: {
        "conda": conda,
        "cd": cd,
        "git": git,
    },
}
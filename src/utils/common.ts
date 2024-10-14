export const writeOutput = (data: string) => {
    process.stdout.write(data);
};

export const PERFIX = '> ';
export const FILLME = '  ';

export type KeyPressEvent = [string | null | undefined, KeyPress];

type KeyPress = {
  sequence: string;
  name: string;
  ctrl: boolean;
  shift: boolean;
};

export enum Shell {
  Bash = "bash",
  Powershell = "powershell",
  Pwsh = "pwsh",
  Zsh = "zsh",
  Fish = "fish",
  Cmd = "cmd",
  Xonsh = "xonsh",
  Nushell = "nu",
}

export const getBackspaceSequence = (press: KeyPressEvent, shell: Shell) =>
  shell === Shell.Pwsh || shell === Shell.Powershell || shell === Shell.Cmd || shell === Shell.Nushell ? "\u007F" : press[1].sequence;

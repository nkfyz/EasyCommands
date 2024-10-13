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
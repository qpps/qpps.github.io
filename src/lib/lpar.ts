export interface IBaseLpar {
    id: string;
    name: string;
    os: string;
}

export interface IIbmiLpar extends IBaseLpar {
    cpw: bigint;
    os: "ibmi";
}

export interface IAixLpar extends IBaseLpar {
    rperf: number;
    smt: string;
    os: "aix";
}

export interface ILinuxLpar extends IBaseLpar {
    entitlement: number;
    os: "linux";
}

export type ILpar = IIbmiLpar | IAixLpar | ILinuxLpar;
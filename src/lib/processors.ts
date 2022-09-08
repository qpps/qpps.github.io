export interface IProcessordFamily {
    name: string,
    shortName: string,
    minEntitlement: number
}

export interface IModel {
    name: string,
    processorFamily: IProcessordFamily,
    type: string,
    model: string
}

export interface IProcessor {
    id: string,
    name: string,
    model: IModel,
    cpw?: BigInt,
    cores: number,
    smt8Rperf?: number,
    smt4Rperf?: number,
    smt2Rperf?: number,
    stRperf?: number,
    maxCoresPerIbmiLpar?: number,
    maxAixIbmiCorePercent?: number,
    viosOnlyIbmi: boolean
}
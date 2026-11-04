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
    modelName: string,
    cpw?: BigInt,
    cores: number,
    baseFrequency: number,
    maxFrequency?: number,
    minSockets: number,
    maxSockets: number,
    coresPerSocket: number,
    rperf?: number,
    ibmiTier?: string,
    // Computed by the sizer for the current LPARs
    ibmiVps?: number,
    smt8Rperf?: number,
    smt4Rperf?: number,
    smt2Rperf?: number,
    stRperf?: number,
    maxCoresPerIbmiLpar?: number,
    maxAixIbmiCorePercent?: number,
    maxIbmiVirtualProcessors?: number,
    viosOnlyIbmi: boolean
}
import type { IModel, IProcessor, IProcessordFamily } from "$lib/processors";
import type { Load } from "@sveltejs/kit";

export interface IPowerData {
    processorFamilies: IProcessordFamily[],
    models: IModel[],
    processors: IProcessor[]
}

export const prerender = true;

export const load: Load = async ({ fetch }) => {
    let processorFamilies: IProcessordFamily[] = [];
    let models: IModel[] = [];
    let processors: IProcessor[] = [];

    const response = await fetch("/data.json");
    const data = await response.json();
    data.processorFamilies.forEach((pf: any) => {
        const processorFamily = {
            name: pf.name,
            shortName: pf.shortName,
            minEntitlement: pf.minEntitlement
        };
        processorFamilies.push(processorFamily);
        pf.models.forEach((m: any) => {
            const model = {
                name: m.name,
                type: m.type,
                model: m.model,
                processorFamily: processorFamily
            }
            models.push(model);
            m.processors.forEach((p: any) => {
                const processor = {
                    id: `${model.type}_${model.model}_${p.name}`,
                    name: p.name,
                    model: model,
                    modelName: `${model.name} (${model.type}-${model.model})`,
                    cpw: p.cpw === undefined ? undefined : BigInt(p.cpw),
                    cores: p.maxSockets * p.coresPerSocket,
                    baseFrequency: p.baseFrequency,
                    maxFrequency: p.maxFrequency,
                    minSockets: p.minSockets,
                    maxSockets: p.maxSockets,
                    coresPerSocket: p.coresPerSocket,
                    stRperf: p.stRperf,
                    smt2Rperf: p.smt2Rperf,
                    smt4Rperf: p.smt4Rperf,
                    smt8Rperf: p.smt8Rperf,
                    rperf: p.smt8Rperf ? p.smt8Rperf : p.smt4Rperf,
                    maxCoresPerIbmiLpar: p.maxCoresPerIbmiLpar,
                    maxAixIbmiCorePercent: p.maxAixIbmiCorePercent,
                    viosOnlyIbmi: p.viosOnlyIbmi === true,
                    ibmiTier: p.ibmiTier
                }
                processors.push(processor);
            });
        });
    });
    return {
        processorFamilies: processorFamilies,
        models: models,
        processors: processors
    }

}
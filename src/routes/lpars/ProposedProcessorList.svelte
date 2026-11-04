<script lang="ts">
    import type { DataTableHeader } from "carbon-components-svelte/src/DataTable/DataTable.svelte";
    import type { ILpar } from "#lib/lpar.ts";
    import type { IPowerData } from "../+layout";
    import { page } from "$app/state";
    import type { IProcessor } from "#lib/processors.ts";
    import { DataTable, InlineNotification } from "carbon-components-svelte";
    import { CellTower, CloudCeiling, License } from "carbon-icons-svelte";

    export let lpars: ILpar[];
    export let viosTopology: string;
    export let viosSize: string;
    export let viosEntitlement: number;

    let data: IPowerData = page.data as IPowerData;

    let viosQuantity: number;
    $: viosQuantity = parseInt(viosTopology);

    interface ILparSummary {
        cpw: bigint;
        maxCpw: bigint;
        stRperf: number;
        smt2Rperf: number;
        smt4Rperf: number;
        smt8Rperf: number;
        linuxEntitlement: number;
    }
    let lparSummary: ILparSummary = {
        cpw: BigInt("0"),
        maxCpw: BigInt("0"),
        stRperf: 0,
        smt2Rperf: 0,
        smt4Rperf: 0,
        smt8Rperf: 0,
        linuxEntitlement: 0,
    };
    $: {
        lparSummary = {
            cpw: BigInt("0"),
            maxCpw: BigInt("0"),
            stRperf: 0,
            smt2Rperf: 0,
            smt4Rperf: 0,
            smt8Rperf: 0,
            linuxEntitlement: 0,
        };
        lparSummary = lpars.reduce((summary: ILparSummary, lpar: ILpar) => {
            switch (lpar.os) {
                case "ibmi":
                    summary.cpw += lpar.cpw;
                    summary.maxCpw =
                        lpar.cpw > summary.maxCpw ? lpar.cpw : summary.maxCpw;
                    break;
                case "aix":
                    (summary as any)[lpar.smt + "Rperf"] += lpar.rperf;
                    break;
                case "linux":
                    summary.linuxEntitlement += lpar.entitlement;
                    break;
            }
            return summary;
        }, lparSummary);
    }
    let filteredProcessors: IProcessor[] = [];
    // Models that would otherwise fit but exceed their IBM i virtual processor limit
    let vpLimitedModels: string[] = [];
    $: {
        const vpLimited = new Set<string>();
        filteredProcessors = data.processors.reduce(
            (fp: IProcessor[], processor: IProcessor) => {
                let ibmiCores = 0;
                let maxIbmiCores = 0;
                let ibmiVps = 0;
                let aixCores = 0;
                let linuxCores = 0;
                let upgradedSmt = false;
                let st = lparSummary.stRperf;
                let smt2 = lparSummary.smt2Rperf;
                let smt4 = lparSummary.smt4Rperf;
                let smt8 = lparSummary.smt8Rperf;
                let viosCores = 0;
                if (lparSummary.cpw > BigInt("0")) {
                    if (
                        processor.cpw === undefined ||
                        (viosQuantity === 0 && processor.viosOnlyIbmi)
                    ) {
                        return fp;
                    }
                    ibmiCores = Math.max(
                        Number(lparSummary.cpw) /
                            (Number(processor.cpw) / processor.cores),
                        processor.model.processorFamily.minEntitlement
                    );
                    // Entitlement and virtual processors are per LPAR: each IBM i
                    // LPAR needs at least ceil(entitlement) virtual processors (min. 1).
                    const cpwPerCore = Number(processor.cpw) / processor.cores;
                    const minEntitlement =
                        processor.model.processorFamily.minEntitlement;
                    for (const lpar of lpars) {
                        if (lpar.os !== "ibmi") continue;
                        const entitlement =
                            Math.round(
                                Math.max(
                                    Number(lpar.cpw) / cpwPerCore,
                                    minEntitlement
                                ) * 100
                            ) / 100;
                        maxIbmiCores = Math.max(entitlement, maxIbmiCores);
                        ibmiVps += Math.max(1, Math.ceil(entitlement));
                    }
                }
                if (
                    st + smt2 + smt4 + smt8 > 0 &&
                    processor.stRperf === undefined &&
                    processor.smt2Rperf === undefined &&
                    processor.smt4Rperf === undefined &&
                    processor.smt8Rperf === undefined
                ) {
                    return fp;
                }
                if (processor.stRperf === undefined && st > 0) {
                    smt2 += st;
                    st = 0;
                    upgradedSmt = true;
                }
                if (processor.smt2Rperf === undefined && smt2 > 0) {
                    smt4 += smt2;
                    smt2 = 0;
                    upgradedSmt = true;
                }
                if (processor.smt4Rperf === undefined && smt4 > 0) {
                    smt8 += smt2;
                    smt4 = 0;
                    upgradedSmt = true;
                }
                if (processor.smt8Rperf === undefined && smt8 > 0) {
                    smt4 += smt8;
                    smt8 = 0;
                }
                if (processor.smt4Rperf === undefined && smt4 > 0) {
                    smt2 += smt4;
                    smt4 = 0;
                }
                if (processor.smt2Rperf === undefined && smt2 > 0) {
                    st += smt2;
                    smt2 = 0;
                }
                if (processor.stRperf !== undefined && st > 0) {
                    aixCores += Math.max(
                        (st / processor.stRperf!) * processor.cores,
                        processor.model.processorFamily.minEntitlement
                    );
                }
                if (processor.smt2Rperf !== undefined && smt2 > 0) {
                    aixCores += Math.max(
                        (smt2 / processor.smt2Rperf!) * processor.cores,
                        processor.model.processorFamily.minEntitlement
                    );
                }
                if (processor.smt4Rperf !== undefined && smt4 > 0) {
                    aixCores += Math.max(
                        (smt4 / processor.smt4Rperf!) * processor.cores,
                        processor.model.processorFamily.minEntitlement
                    );
                }
                if (processor.smt8Rperf !== undefined && smt8 > 0) {
                    aixCores += Math.max(
                        (smt8 / processor.smt8Rperf!) * processor.cores,
                        processor.model.processorFamily.minEntitlement
                    );
                }
                let totalCores =
                    ibmiCores + aixCores + lparSummary.linuxEntitlement;
                if (viosQuantity > 0) {
                    if (viosSize == "manual") {
                        viosCores =
                            viosQuantity *
                            Math.max(
                                viosEntitlement,
                                processor.model.processorFamily.minEntitlement
                            );
                    } else {
                        if (totalCores < 3) {
                            viosCores = 1;
                        } else {
                            viosCores = Math.min(
                                Math.ceil((totalCores + 2) / 16) * 2,
                                viosQuantity * 8
                            );
                        }
                    }
                    totalCores += viosCores;
                }

                if (totalCores > processor.cores) {
                    return fp;
                }
                if (
                    processor.maxCoresPerIbmiLpar !== undefined &&
                    maxIbmiCores > processor.maxCoresPerIbmiLpar
                ) {
                    return fp;
                }
                if (
                    processor.maxAixIbmiCorePercent !== undefined &&
                    Math.ceil(ibmiCores) + Math.ceil(aixCores) >
                        (processor.cores * processor.maxAixIbmiCorePercent) / 100
                ) {
                    return fp;
                }
                if (
                    processor.maxIbmiVirtualProcessors !== undefined &&
                    ibmiVps > processor.maxIbmiVirtualProcessors
                ) {
                    vpLimited.add(
                        `${processor.model.name} (${processor.model.type}-${processor.model.model})`
                    );
                    return fp;
                }
                fp.push({
                    ...processor,
                    ibmiVps,
                    ibmiCores,
                    aixCores,
                    linuxCores: lparSummary.linuxEntitlement,
                    maxIbmiCores,
                    viosCores,
                } as any);
                return fp;
            },
            [] as IProcessor[]
        );
        vpLimitedModels = [...vpLimited];
    }

    // Some columns are computed in the cell slot, so their keys are not row properties.
    const headers: DataTableHeader[] = [
        { key: "modelName", value: "Model" },
        { key: "name", value: "Name" },
        { key: "baseFrequency", value: "Frequency (GHz)" },
        { key: "maxSockets", value: "Sockets" },
        { key: "coresPerSocket", value: "Cores per socket" },
        { key: "ibmiCores", value: "IBM i cores" },
        { key: "aixCores", value: "AIX cores" },
        { key: "linuxCores", value: "Linux cores" },
        { key: "viosCores", value: "VIOS cores" },
    ];
</script>

{#if vpLimitedModels.length > 0}
    <InlineNotification
        lowContrast
        hideCloseButton
        kind="info"
        title="Not proposed:"
        subtitle={`${vpLimitedModels.join(", ")} - the IBM i LPARs would need more virtual processors than the model allows (each IBM i LPAR needs at least one).`}
    />
{/if}

<DataTable
    title="Proposed processors"
    sortable
    zebra
    {headers}
    rows={filteredProcessors}
>
    <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === "ibmiCores"}
            {cell.value.toFixed(2)}
            {#if cell.value > 0}
                ({Math.ceil(cell.value)} {row.ibmiTier} IBM i License(s))
            {/if}
            {#if row.maxIbmiVirtualProcessors !== undefined && row.ibmiVps > 0}
                ({row.ibmiVps} of {row.maxIbmiVirtualProcessors} IBM i virtual processors)
            {/if}
        {:else if cell.key === "aixCores"}
            {cell.value.toFixed(2)}
            {#if cell.value > 0}
                ({Math.ceil(cell.value)} AIX License(s))
            {/if}
        {:else if cell.key === "linuxCores"}
            {cell.value.toFixed(2)}
        {:else if cell.key === "baseFrequency"}
            {cell.value.toLocaleString()}
            {#if row.maxFrequency}
                {` - ${row.maxFrequency}`}
            {/if}
        {:else if cell.key === "maxSockets"}
            {row.minSockets}
            {#if row.maxSockets > row.minSockets}
                {`- ${row.maxSockets}`}
            {/if}
        {:else if cell.key === "viosCores"}
            {cell.value.toFixed(2)}
        {:else}
            {cell.value}
        {/if}
    </svelte:fragment>
</DataTable>

<script lang="ts">
    import {
        DataTable,
        Toolbar,
        ToolbarContent,
        ToolbarSearch,
        MultiSelect,
        Button,
    } from "carbon-components-svelte";
    import type { DataTableRow } from "carbon-components-svelte/types/DataTable/DataTable.svelte";
    import Add from "carbon-icons-svelte/lib/Add.svelte";

    import type { IPowerData } from "src/routes/+layout";
    import AddLpar from "./AddLpar.svelte";
    import type { ILpar } from "./lpar";
    import type { IModel, IProcessor } from "./processors";

    export let data: IPowerData = {
        processorFamilies: [],
        models: [],
        processors: [],
    };

    export let lpars: ILpar[];

    let allProcessors: IProcessor[];
    $: allProcessors = data.processors;
    let selectedProcessorFamilies: string[] = [];
    let selectedModels: string[] = [];

    let filteredProcessors: IProcessor[] = [];
    $: filteredProcessors = allProcessors.filter((processor) => {
        if (
            selectedProcessorFamilies.length > 0 &&
            selectedProcessorFamilies.indexOf(
                processor.model.processorFamily.shortName
            ) === -1
        ) {
            return false;
        }

        if (
            selectedModels.length > 0 &&
            selectedModels.indexOf(
                `${processor.model.type}-${processor.model.model}`
            ) === -1
        ) {
            return false;
        }

        return true;
    });

    let allModels: IModel[] = [];
    $: allModels = data.models;
    let filteredModels: IModel[] = [];
    $: filteredModels = allModels.filter((model) => {
        if (
            selectedProcessorFamilies.length > 0 &&
            selectedProcessorFamilies.indexOf(
                model.processorFamily.shortName
            ) === -1
        ) {
            return false;
        }

        return true;
    });
    let openAddLpar = false;
    let selectedProcessor: IProcessor;

    const addLpar = (row: DataTableRow) => {
        selectedProcessor = row as IProcessor;
        openAddLpar = true;
    };
</script>

<DataTable
    title="Processors"
    sortable
    zebra
    headers={[
        { key: "modelName", value: "Model" },
        { key: "id", value: "Name" },
        { key: "baseFrequency", value: "Frequency (GHz)" },
        { key: "maxSockets", value: "Sockets" },
        { key: "coresPerSocket", value: "Cores per socket" },
        { key: "cpw", value: "CPW (by core)" },
        { key: "rperf", value: "rPerf" },
        { key: "actions", value: "Actions", sort: false },
    ]}
    rows={filteredProcessors}
>
    <Toolbar>
        <ToolbarContent>
            <MultiSelect
                label="Select processor Family"
                bind:selectedIds={selectedProcessorFamilies}
                sortItem={() => {}}
                items={data.processorFamilies.map((it) => ({
                    id: it.shortName,
                    text: it.name,
                }))}
            />
            <MultiSelect
                label="Select model&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                bind:selectedIds={selectedModels}
                sortItem={() => {}}
                items={filteredModels.map((it) => ({
                    id: `${it.type}-${it.model}`,
                    text: `${it.name} (${it.type}-${it.model})`,
                }))}
            />
            <ToolbarSearch
                persistent
                shouldFilterRows={(row, value) => {
                    let v = value.toString().toLowerCase();
                    return (
                        row.model.name.toLowerCase().includes(v) ||
                        row.model.type.toLowerCase().includes(v) ||
                        row.model.model.toLowerCase().includes(v) ||
                        row.id.toLowerCase().includes(v)
                    );
                }}
            />
        </ToolbarContent>
    </Toolbar>
    <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === "cpw"}
            {cell.value === undefined? "":`${cell.value.toLocaleString()} (${(
                Number(cell.value) / row.cores
            ).toLocaleString(undefined, { maximumFractionDigits: 2 })})`}
        {:else if cell.key === "baseFrequency"}
            {row.baseFrequency.toLocaleString()}
            {#if row.maxFrequency}
                {` - ${row.maxFrequency}`}
            {/if}
        {:else if cell.key === "maxSockets"}
            {row.minSockets}
            {#if row.maxSockets > row.minSockets}
                {` - ${row.maxSockets}`}
            {/if}
        {:else if cell.key === "rperf"}
            {#if row.smt8Rperf === undefined}
                {row.smt4Rperf} (SMT4)
            {:else}
                {row.smt8Rperf} (SMT8)
            {/if}
        {:else if cell.key === "actions"}
            <Button
                icon={Add}
                size="small"
                kind="ghost"
                iconDescription="Add LPAR"
                on:click={() => {
                    addLpar(row);
                }}
            />
        {:else}
            {cell.value}
        {/if}
    </svelte:fragment>
</DataTable>
<AddLpar bind:open={openAddLpar} processor={selectedProcessor} bind:lpars />

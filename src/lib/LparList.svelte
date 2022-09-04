<script lang="ts">
    import {
        Button,
        DataTable,
        Toolbar,
        ToolbarContent,
    } from "carbon-components-svelte";
    import { Edit } from "carbon-icons-svelte";
    import type { ILpar } from "./lpar";
    import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
    import type { DataTableRow } from "carbon-components-svelte/types/DataTable/DataTable.svelte";
    import AddEditLpar from "../routes/lpars/AddEditLpar.svelte";

    export let lpars: ILpar[];

    let lpar: ILpar | undefined = undefined;

    const removeLpar = (row: DataTableRow) => {
        lpars.splice(lpars.indexOf(row as ILpar), 1);
        lpars = lpars;
    };

    const editLpar = (row: DataTableRow) => {
        lpar = row as ILpar;
        open = true;
    };

    const addLpar = () => {
        lpar = undefined;
        open = true;
    };

    let open = false;
</script>

<DataTable
    title="LPARs"
    sortable
    zebra
    headers={[
        { key: "name", value: "Name" },
        { key: "os", value: "OS" },
        { key: "performance", value: "Processor", sort: false },
        { key: "actions", value: "", sort: false },
    ]}
    rows={lpars}
>
    <Toolbar>
        <ToolbarContent>
            <Button on:click={addLpar}>Add LPAR</Button>
        </ToolbarContent>
    </Toolbar>
    <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === "os"}
            {#if cell.value === "ibmi"}
                IBM i
            {:else if cell.value === "aix"}
                AIX
            {:else if cell.value === "linux"}
                Linux
            {/if}
        {:else if cell.key === "performance"}
            {#if row.os === "ibmi"}
                {row.cpw.toLocaleString()} CPW
            {:else if row.os === "aix"}
                {row.rperf.toFixed(2)} rPerf ({row.smt.toUpperCase()})
            {:else if row.os === "linux"}
                {row.entitlement.toFixed(2)} cores
            {/if}
        {:else if cell.key === "name"}
            {row.name}
        {:else if cell.key === "actions"}
            <Button
                icon={Edit}
                size="small"
                kind="ghost"
                iconDescription="Edit LPAR"
                on:click={() => {
                    editLpar(row);
                }}
            />
            <Button
                icon={TrashCan}
                size="small"
                kind="ghost"
                iconDescription="Remove LPAR"
                on:click={() => {
                    removeLpar(row);
                }}
            />
        {:else}
            {cell.value}
        {/if}
    </svelte:fragment>
</DataTable>
<AddEditLpar bind:lpar bind:lpars bind:open />

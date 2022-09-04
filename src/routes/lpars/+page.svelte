<script lang="ts">
    import LparList from "$lib/LparList.svelte";
    import ProposedProcessorList from "./ProposedProcessorList.svelte";

    import { lpars } from "$lib/store";
    import ViosSelection from "./ViosSelection.svelte";

    let viosTopology = "2";
    let viosSize = "auto";
    let viosEntitlement = 1;
</script>

<style>
    .lparList,.viosSelection {
        margin-top: 1em;
    }
</style>

<div class="lparList">
<LparList bind:lpars={$lpars} />
</div>

<div class="viosSelection">
<ViosSelection bind:viosTopology bind:viosSize bind:viosEntitlement />
</div>

<ProposedProcessorList
    lpars={$lpars}
    {viosTopology}
    {viosSize}
    {viosEntitlement}
/>

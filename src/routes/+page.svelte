<script lang="ts">
    import ProcessorList from "$lib/ProcessorList.svelte";
    import type { IPowerData } from "./+layout";

    import { lpars } from "$lib/store";
    import { page } from "$app/stores";

    let data: IPowerData = $page.data as IPowerData;
</script>

<style>
    .processorList {
        margin-top: 1em;
    }
</style>

<div class="processorList">
<ProcessorList {data} bind:lpars={$lpars} />
</div>
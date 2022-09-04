<script lang="ts">
    import { Checkbox, Modal } from "carbon-components-svelte";
    import { onMount } from "svelte";

    let open = false;

    const onCheck = () => {
        open = false;
        localStorage.setItem("disclaimerAccepted", "true");
    };

    onMount(() => {
        if (localStorage.getItem("disclaimerAccepted") !== "true") {
            open = true;
        }
    });
</script>

<Modal
    passiveModal
    bind:open
    modalHeading="Disclamer"
    preventCloseOnClickOutside
>
    <p>Warning Beta software, use with care.</p>
    <p>
        This tool is provided as is without warranty of any kind. Refer to IBM,
        your business partner and/or official IBM documentation.
    </p>
    <p>This tool is not affiliated with IBM.</p>
    <Checkbox labelText="I understand and accept" on:change={onCheck} />
</Modal>

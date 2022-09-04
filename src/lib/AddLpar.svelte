<script lang="ts">
    import {
        ComposedModal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        NumberInput,
        RadioButton,
        RadioButtonGroup,
        TextInput,
    } from "carbon-components-svelte";
    import type { ILpar } from "./lpar";
    import type { IProcessor } from "./processors";

    export let open: boolean;
    export let processor: IProcessor;
    export let lpars: ILpar[];

    let operatingSystem: string;
    let entitlement = 1;
    let cpw = 0;
    let rperf = 0;
    let smt = "smt8";
    let totalRperf = 0;
    let name: string;

    const updateTotalRperf = () => {
        switch (smt) {
            case "smt8":
                totalRperf = processor.smt8Rperf!;
                break;
            case "smt4":
                totalRperf = processor.smt4Rperf!;
                break;
            case "smt2":
                totalRperf = processor.smt2Rperf!;
                break;
            default:
                totalRperf = processor.stRperf!;
        }
    };

    const onEntitlementInput = () => {
        const val = entitlement;
        if (!isNaN(val)) {
            switch (operatingSystem) {
                case "ibmi":
                    cpw = Math.round(
                        (Number(processor.cpw) / processor.cores) * val
                    );
                    break;
                case "aix":
                    rperf = Number(
                        ((totalRperf / processor.cores) * val).toFixed(1)
                    );
                    break;
            }
        }
    };

    const onCpwInput = (e: CustomEvent) => {
        const val = parseFloat(e.detail);
        if (!isNaN(val)) {
            entitlement = Math.max(
                parseFloat(
                    (
                        val /
                        (Number(processor.cpw) / Number(processor.cores))
                    ).toFixed(2)
                ),
                0.05
            );
        }
    };

    const onRperfInput = (e: CustomEvent) => {
        const val = parseFloat(e.detail);
        if (!isNaN(val)) {
            entitlement = Math.max(
                parseFloat((val / (totalRperf / processor.cores)).toFixed(2)),
                0.05
            );
        }
    };

    const onOpen = (e: CustomEvent) => {
        if (processor.cpw === undefined) {
            operatingSystem = "aix";
        } else {
            operatingSystem = "ibmi";
        }
        if (processor.smt8Rperf) {
            smt = "smt8";
        } else if (processor.smt4Rperf) {
            smt = "smt4";
        } else if (processor.smt2Rperf) {
            smt = "smt2";
        } else if (processor.stRperf) {
            smt = "st";
        }
        updateTotalRperf();
        onEntitlementInput();
    };

    const onSmtChange = () => {
        updateTotalRperf();
        onEntitlementInput();
    };

    const onAdd = () => {
        switch (operatingSystem) {
            case "ibmi":
                lpars.push({
                    id: crypto.randomUUID(),
                    name,
                    cpw: BigInt(cpw),
                    os: "ibmi",
                });
                break;
            case "aix":
                lpars.push({
                    id: crypto.randomUUID(),
                    name,
                    rperf,
                    smt,
                    os: "aix",
                });
                break;
            case "linux":
                lpars.push({
                    id: crypto.randomUUID(),
                    name,
                    entitlement,
                    os: "linux",
                });
                break;
        }
        lpars = lpars;
        open = false;
    };
</script>

<ComposedModal bind:open on:open={onOpen} on:submit={onAdd}>
    <ModalHeader title="Add LPAR" />
    <ModalBody>
        Processor: {processor?.id}
        <TextInput bind:value={name} labelText="LPAR name" />
        <RadioButtonGroup
            legendText="Operating system"
            bind:selected={operatingSystem}
        >
            <RadioButton
                labelText="IBM i"
                value="ibmi"
                disabled={processor?.cpw === undefined}
            />
            <RadioButton labelText="AIX" value="aix" />
            <RadioButton labelText="Linux" value="linux" />
        </RadioButtonGroup>
        <NumberInput
            label="Entitlement (processors)"
            bind:value={entitlement}
            on:input={onEntitlementInput}
        />
        {#if operatingSystem === "ibmi"}
            <NumberInput label="CPW" bind:value={cpw} on:input={onCpwInput} />
        {:else if operatingSystem === "aix"}
            <RadioButtonGroup
                legendText="Threads per core"
                bind:selected={smt}
                on:change={onSmtChange}
            >
                {#if processor?.smt8Rperf}
                    <RadioButton labelText="SMT8" value="smt8" />
                {/if}
                {#if processor?.smt4Rperf}
                    <RadioButton labelText="SMT4" value="smt4" />
                {/if}
                {#if processor?.smt2Rperf}
                    <RadioButton labelText="SMT2" value="smt2" />
                {/if}
                {#if processor?.stRperf}
                    <RadioButton labelText="ST" value="st" />
                {/if}
            </RadioButtonGroup>
            <TextInput
                labelText="rPerf"
                bind:value={rperf}
                on:input={onRperfInput}
            />
        {/if}
    </ModalBody>
    <ModalFooter primaryButtonText="Add" secondaryButtonText="Cancel" />
</ComposedModal>

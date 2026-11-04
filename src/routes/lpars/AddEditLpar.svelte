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
    import type {
        IAixLpar,
        IBaseLpar,
        IIbmiLpar,
        ILinuxLpar,
        ILpar,
    } from "#lib/lpar.ts";

    export let open: boolean;
    export let lpars: ILpar[];
    export let lpar: ILpar | undefined = undefined;

    let operatingSystem = "ibmi";
    let entitlement = 1;
    let cpw = 0;
    let rperf = 0;
    let smt = "smt8";
    let name: string;

    const onOpen = (e: CustomEvent) => {
        if (lpar === undefined) {
            operatingSystem = "ibmi";
            entitlement = 1;
            cpw = 0;
            rperf = 0;
            smt = "smt8";
            name = "";
        } else {
            name = lpar.name;
            operatingSystem = lpar.os;
            if (lpar.hasOwnProperty("cpw")) {
                cpw = Number((lpar as IIbmiLpar).cpw);
            } else {
                delete (lpar as any).cpw;
            }
            if (lpar.hasOwnProperty("rperf")) {
                rperf = (lpar as IAixLpar).rperf;
                smt = (lpar as IAixLpar).smt;
            } else {
                delete (lpar as any).rperf;
                delete (lpar as any).smt;
            }
            if (lpar.hasOwnProperty("entitlement")) {
                entitlement = (lpar as ILinuxLpar).entitlement;
            } else {
                delete (lpar as any).entitlement;
            }
        }
    };

    const onAdd = () => {
        const baseLpar: IBaseLpar = {
            id: lpar === undefined ? crypto.randomUUID() : lpar.id,
            name: name,
            os: operatingSystem as "ibmi" | "aix" | "linux",
        };
        let updated: ILpar;
        switch (operatingSystem) {
            case "aix":
                updated = {
                    ...baseLpar,
                    rperf: rperf,
                    smt: smt,
                    os: "aix",
                };
                break;
            case "linux":
                updated = {
                    ...baseLpar,
                    entitlement: entitlement,
                    os: "linux",
                };
                break;
            default:
                updated = { ...baseLpar, cpw: BigInt(cpw), os: "ibmi" };
        }
        // Assign new objects/arrays rather than mutating in place, so that
        // the LPAR list and the sizing see the change.
        lpars =
            lpar === undefined
                ? [...lpars, updated]
                : lpars.map((l) => (l.id === updated.id ? updated : l));
        open = false;
    };
</script>

<ComposedModal bind:open on:open={onOpen} on:submit={onAdd}>
    <ModalHeader title="Add LPAR" />
    <ModalBody>
        <TextInput bind:value={name} labelText="LPAR name" />
        <RadioButtonGroup
            legendText="Operating system"
            bind:selected={operatingSystem}
        >
            <RadioButton labelText="IBM i" value="ibmi" />
            <RadioButton labelText="AIX" value="aix" />
            <RadioButton labelText="Linux" value="linux" />
        </RadioButtonGroup>
        {#if operatingSystem === "ibmi"}
            <NumberInput labelText="CPW" bind:value={cpw} />
        {:else if operatingSystem === "aix"}
            <RadioButtonGroup legendText="Threads per core" bind:selected={smt}>
                <RadioButton labelText="SMT8" value="smt8" />
                <RadioButton labelText="SMT4" value="smt4" />
                <RadioButton labelText="SMT2" value="smt2" />
                <RadioButton labelText="ST" value="st" />
            </RadioButtonGroup>
            <NumberInput labelText="rPerf" bind:value={rperf} />
        {:else}
            <NumberInput
                labelText="Entitlement (processors)"
                bind:value={entitlement}
            />
        {/if}
    </ModalBody>
    <ModalFooter
        primaryButtonText={lpar === undefined ? "Add" : "Update"}
        secondaryButtonText="Cancel"
    />
</ComposedModal>

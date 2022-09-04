<script lang="ts">
    import {
        Form,
        FormGroup,
        NumberInput,
        RadioButton,
        RadioButtonGroup,
    } from "carbon-components-svelte";

    export let viosTopology = "2";
    export let viosSize = "auto";
    export let viosEntitlement = 1;
</script>

<Form on:submit>
    <FormGroup legendText="VIOS topology">
        <RadioButtonGroup bind:selected={viosTopology}>
            <RadioButton value="0" labelText="No VIOS" />
            <RadioButton
                value="1"
                labelText="Single VIOS (not recommended)"
            />
            <RadioButton value="2" labelText="Dual VIOS (recommended)" />
            <RadioButton value="4" labelText="4 VIOSes" />
        </RadioButtonGroup>
    </FormGroup>
    <FormGroup legendText="VIOS size">
        <RadioButtonGroup disabled={viosTopology==="none"} bind:selected={viosSize}>
            <RadioButton value="auto" labelText="Automatic"/>
            <RadioButton value="manual" labelText="Manual" />
        </RadioButtonGroup>
        <NumberInput disabled={viosSize==="auto"} bind:value={viosEntitlement} label="Entitlement (per VIOS)"/>
    </FormGroup>
</Form>

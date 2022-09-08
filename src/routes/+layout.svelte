<script lang="ts">
    import {
        Content,
        ContentSwitcher,
        Header,
        HeaderGlobalAction,
        HeaderUtilities,
        Switch,
    } from "carbon-components-svelte";

    import "carbon-components-svelte/css/g10.css";

    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import WarningModal from "./WarningModal.svelte";
    import { LogoGithub } from "carbon-icons-svelte";

    let selectedIndex: number;
    switch ($page.url.pathname) {
        case "/":
            selectedIndex = 0;
            break;
        case "/lpars":
            selectedIndex = 1;
            break;
    }
    const onChange = (e: CustomEvent) => {
        switch (selectedIndex) {
            case 0:
                goto("/");
                break;
            case 1:
                goto("/lpars");
                break;
        }
    };

    const githubClick = () => {
        window.open("https://github.com/qpps/qpps.github.io", "_blank");
    };
</script>

<Header company="QPPS" platformName="Quantum powered POWER sizer">
    <HeaderUtilities>
        <HeaderGlobalAction
            aria-label="github"
            icon={LogoGithub}
            on:click={githubClick}
        />
    </HeaderUtilities>
</Header>

<Content>
    <ContentSwitcher bind:selectedIndex on:change={onChange}>
        <Switch text="Processors" />
        <Switch text="LPARs" />
    </ContentSwitcher>
    <p />
    <slot />
</Content>
<WarningModal />

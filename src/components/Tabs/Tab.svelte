<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);
</script>

<button data-selected={$selectedTab === tab} class="aria-selected:bg-gradient-to-tr aria-selected:from-primary aria-selected:to-primary-focus aria-selected:text-white
px-2 py-1 text-base rounded-lg" {...$$restProps} on:click="{() => selectTab(tab)}">
	<slot></slot>
</button>
<script lang="ts">
	import type { JsonTree } from "#lib/Tree";
	import { ArrowLeft, FilePlus, FileText } from "radix-svelte-icons";
	import FileViewer from "./FileViewer.svelte";
	import DoubleArrowLeft from "radix-svelte-icons/src/lib/icons/DoubleArrowLeft.svelte";
	import { formatByteSize} from "#lib/formatByteSize"

	export let file: JsonTree<{
		data: string,
		mimetype: string,
		type: string,
		bytesize: number
	}> | null;

	

	let highlightedFile: typeof file | null = null;
</script>

<div class="border border-base-200 rounded-lg not-prose h-min">
	<div class="breadcrumbs py-3.5 px-4">
		<ul>
			<li class="text-sm">{file?.key}</li>
			{#if highlightedFile !== null}
				<li class="text-sm">{highlightedFile.key}</li>
			{/if}
		</ul>
	</div>
	{#if highlightedFile !== null}
		<div class="flex flex-row justify-between items-center px-4 py-2 bg-base-200">
			<button on:click={() => highlightedFile = null} class="flex flex-row items-center gap-1 text-sm link">
				<DoubleArrowLeft size={12}></DoubleArrowLeft> Back
			</button>
			<div class="flex flex-row gap-2 items-center">
				<span class="text-sm">
					{highlightedFile.value.mimetype}
				</span>
				<span class="text-sm text-base-content text-opacity-50">|</span>
				<span class="text-sm">
					{formatByteSize(highlightedFile.value.bytesize)}
				</span>
			</div>
		</div>
		<FileViewer file={highlightedFile}></FileViewer>
	{:else}
		<table class="table">
			<thead></thead>
			<tbody>
				{#if file}
					{#each file.children as child}
						<tr>
							<td><button class="link link-hover" on:click={() => highlightedFile = child}>{child?.key}</button></td>
							<td>{child.value.mimetype}</td>
							<td class="text-end">{formatByteSize(child.value.bytesize)}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	{/if}
</div>
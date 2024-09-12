<script lang="ts">
	import { Tabs, TabList, Tab, TabPanel } from "#components/Tabs"
	import SchemaRenderer from "#components/Schema/SchemaRenderer.svelte"
	import { type Comment, type Schema } from "@prisma/client"
	import { Archive, ChatBubble, CrumpledPaper, Download, FilePlus, Pencil2, Reader } from "radix-svelte-icons";
	import { InfoCircled, CrossCircled } from "radix-svelte-icons";
	import CopyCodeLine from "#components/CopyCodeLine.svelte";
	import { type JsonTree } from "#lib/Tree"
	import FileTree from "#components/FileTree.svelte";
	import { formatByteSize } from "#lib/formatByteSize";
	import moment from "moment"
	import Link2 from "radix-svelte-icons/src/lib/icons/Link2.svelte";
	import Discussion from "#components/Discussion.svelte";

	export let schema: Schema;
	export let latest: Schema;
	export let jsonSchema: Object | null;
	export let readme: string;
	export let files: JsonTree | null
	export let changelog: string;
	export let license: string;
	export let comments: Comment[];

	function calculateSchemaSizeInBytes(tree: JsonTree, size: number = 0) {
		size += tree.value.bytesize;
		for (const file of tree.children) {
			size += calculateSchemaSizeInBytes(file);
		}
		return size;
	}

	const size = calculateSchemaSizeInBytes(files)

	function countTreeSize(tree: JsonTree) {
		let count = 0;
		for (const file of tree.children) {
			count += 1;
			count += countTreeSize(file);
		}
		return count;
	}
</script>

<main class="my-16 px-8">
	{#if schema.status === "Deprecated"}
		<div role="alert" class="alert alert-error mb-8 col-span-2">
			<CrossCircled size={24}></CrossCircled>
			<span>This Schema version has been deprecated, consider using a newer version.</span>
		</div>
	{:else if schema.version !== latest.version}
		<div role="alert" class="alert mb-8 col-span-2">
			<InfoCircled size={24}></InfoCircled>
			<span>This Schema version is outdated, consider using the <a href="/schemas/{schema.name}/latest">latest version</a>.</span>
		</div>
	{/if}
	<article>
		<header class="mb-8">
			<div class="flex flex-row justify-between items-start">
				<h1 class="mb-2">{schema.name}</h1>
				<div class="flex flex-row gap-2">
					<div class="tooltip" data-tip="Download">
						<button class="btn btn-ghost btn-square"><Download size={18}></Download></button>
					</div>
					<div class="tooltip" data-tip="Suggest Edit">
						<button class="btn btn-ghost btn-square"><Pencil2 size={18}></Pencil2></button>
					</div>
					<div class="tooltip" data-tip="Report">
						<button class="btn btn-ghost btn-square"><CrumpledPaper size={18}></CrumpledPaper></button>
					</div>
				</div>
			</div>
			<p class="text-base-content text-opacity-60 text-base my-0 flex gap-2"><strong>{schema.version}</strong> • {#if schema.status === "Review"}
				<span class="text-red-600">Not yet Reviewed</span>
			{:else if schema.status === "Archived"}
				<span class="text-violet-600">Archived</span>
			{:else if schema.status === "Deprecated"}
				<span class="text-red-600">Deprecated</span>
			{:else if schema.status === "Published"}
				<span class="text-green-600">Published</span>
			{:else if schema.status === "Rejected"}
				<span class="text-red-600">Rejected</span>
			{/if}</p>
			<p class="text-base-content text-opacity-60 text-base mt-2">{schema.description}</p>
		</header>
		
		<Tabs>
			<TabList class="w-full grid grid-cols-5">
				<Tab class="px-4 py-3.5 rounded-t-lg text-base font-semibold flex flex-row gap-1.5 items-center border-b-2 justify-center data-[selected=true]:bg-orange-400 data-[selected=true]:bg-opacity-25 border-b-orange-400"><Reader size={20} /> Overview</Tab>
				<Tab class="px-4 py-3.5 rounded-t-lg text-base font-semibold flex flex-row gap-1.5 items-center border-b-2 justify-center data-[selected=true]:bg-red-400 data-[selected=true]:bg-opacity-25 border-b-red-400"><FilePlus size={20} /> Changelog</Tab>
				<Tab class="px-4 py-3.5 rounded-t-lg text-base font-semibold flex flex-row gap-1.5 items-center border-b-2 justify-center data-[selected=true]:bg-violet-400 data-[selected=true]:bg-opacity-25 border-b-violet-400"><Archive size={20} /> Files</Tab>
				<Tab class="px-4 py-3.5 rounded-t-lg text-base font-semibold flex flex-row gap-1.5 items-center border-b-2 justify-center data-[selected=true]:bg-green-400 data-[selected=true]:bg-opacity-25 border-b-green-400"><ChatBubble size={20} /> Discussion</Tab>
				<Tab class="px-4 py-3.5 rounded-t-lg text-base font-semibold flex flex-row gap-1.5 items-center border-b-2 justify-center data-[selected=true]:bg-blue-400 data-[selected=true]:bg-opacity-25 border-b-blue-400"><Link2 size={20} /> License</Tab>
			</TabList>
			<div class="grid grid-cols-1 lg:grid-cols-[3fr,1fr] gap-8 py-8">
				<TabPanel>
					<div class="prose prose-base max-w-full">
						{@html readme}
						{#if jsonSchema}
							<SchemaRenderer schema={jsonSchema} name={schema.name}></SchemaRenderer>
						{/if}
					</div>
				</TabPanel>
				<TabPanel>
					<div class="prose prose-base max-w-full">
						{@html changelog}
					</div>
				</TabPanel>
				<TabPanel>
					{#if files}
						<FileTree file={files}></FileTree>
					{:else}
						<p>No files found.</p>
					{/if}
				</TabPanel>
				<TabPanel>
					<Discussion {comments} {schema}></Discussion>
				</TabPanel>
				<TabPanel>
					<div class="prose prose-base max-w-full">
						{@html license}
					</div>
				</TabPanel>
				<aside class="flex flex-col gap-4">
					<div class="flex flex-col gap-2">
						<span class="text-sm font-bold text-base-content text-opacity-60">Install</span>
						<CopyCodeLine code="openschema pull {schema.name}:{schema.version}"></CopyCodeLine>
					</div>
					<div class="flex flex-col gap-2">
						<span class="text-sm font-bold text-base-content text-opacity-60">Link</span>
						<a href="/schemas/{schema.name}/{schema.version}.json" target="_blank" class="text-sm break-words whitespace-pre-line">https://openschema.wiki/schemas/{schema.name}/{schema.version}.json</a>
					</div>
					<div class="divider my-0"></div>
					<div class="grid grid-cols-2">
						<div class="flex flex-col gap-2">
							<span class="text-sm font-bold text-base-content text-opacity-60 flex flex-row gap-1 items-center"><Download size={16}></Download> Downloads</span>
							<span class="text-base font-bold">{schema.downloads}</span>
						</div>
						<div class="flex flex-col gap-2">
							<span class="text-sm font-bold text-base-content text-opacity-60 flex flex-row gap-1 items-center">Version</span>
							<span class="text-base font-bold">{schema.version}</span>
						</div>
					</div>
					<div class="divider my-0"></div>
					<div class="grid grid-cols-2">
						<div class="flex flex-col gap-2">
							<span class="text-sm font-bold text-base-content text-opacity-60 flex flex-row gap-1 items-center">Unpacked Size</span>
							<span class="text-base font-bold">{formatByteSize(size)}</span>
						</div>
						<div class="flex flex-col gap-2">
							<span class="text-sm font-bold text-base-content text-opacity-60 flex flex-row gap-1 items-center">Total Files</span>
							<span class="text-base font-bold">{countTreeSize(files)}</span>
						</div>
					</div>
					<div class="divider my-0"></div>
					<div class="flex flex-col gap-2">
						<span class="text-sm font-bold text-base-content text-opacity-60 flex flex-row gap-1 items-center">Last Published</span>
						<span class="text-base font-bold">{moment(schema.createdAt).fromNow()}</span>
					</div>
					<div class="divider my-0"></div>
					<div class="flex flex-col gap-2">
						<span class="text-sm font-bold text-base-content text-opacity-60">Tags</span>
						<div>
							{#each schema.tags as tag}
								<span class="badge badge-md badge-neutral">{tag}</span>
							{/each}
						</div>
					</div>
				</aside>
			</div>
		</Tabs>
	</article>
</main>
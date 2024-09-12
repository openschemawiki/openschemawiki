<script lang="ts">
	import type { Comment, Schema } from "@prisma/client";
	import { Carta, MarkdownEditor } from "carta-md";
	import { code } from "@cartamd/plugin-code";
	import "@cartamd/plugin-code/default.css";
	import "#styles/carta-github.scss";
	import moment from "moment";
	import { ArrowRight } from "radix-svelte-icons";
	import { DotsVertical, ArrowLeft } from "radix-svelte-icons";
	import Cross2 from "radix-svelte-icons/src/lib/icons/Cross2.svelte";

	export let comments: {
		createdAt: Date;
		Author: {
			username: string;
		};
		id: number;
		content: string;
		replyTo: number | null;
	}[];

	export let schema: Schema;

	function jumpToComment(id: number) {
		const comment = document.getElementById(`comment-${id}`);
		if (comment) {
			comment.scrollIntoView({ behavior: "smooth" });
			comment.classList.add("highlighted");
			setTimeout(() => {
				comment.classList.remove("highlighted");
			}, 400);
		}
	}

	const carta = new Carta({
		sanitizer: false,
		theme: "github-dark",
		rendererDebounce: 200,
		extensions: [
			code({
				theme: "github-dark",
			}),
		],
	});

	async function comment() {
		if (content.trim().length === 0) {
			return;
		}

		const response = await fetch("/api/comment", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				schema: schema.id,
				content,
				reply: replyingTo,
			}),
		});

		if (response.ok) {
			const comment = await response.json();
			comments = [{
				Author: {
					// TODO: Add username
					username: ""
				},
				content: content,
				createdAt: new Date(),
				id: comment.id,
				replyTo: replyingTo,
			}, ...comments];

			localStorage.setItem("comment", "");
			content = "";
			replyingTo = null;

			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	}

	let content = localStorage.getItem("comment") || "";

	$: {
		localStorage.setItem("comment", content);
	}

	function replyTo(id: number) {
		replyingTo = id;

		editorContainer.scrollIntoView({
			behavior: "smooth",
		});
	}

	let replyingTo: number | null = null;
	let editorContainer: HTMLDivElement;
</script>

<div class="not-prose flex flex-col gap-2">
	{#each comments as comment}
		<div
			class="bg-base-100 border border-base-300 px-4 py-3.5 flex flex-row gap-4 rounded-lg focus:bg-base-200 transition-colors"
			id="comment-{comment.id}">
			<div>
				<div class="avatar">
					<div class="w-10 rounded-full">
						<img
							src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
							alt={comment.Author.username} />
					</div>
				</div>
			</div>
			<div class="flex flex-col w-full">
				<div class="flex flex-row justify-between">
					<div class="flex flex-row gap-4 items-center">
						<span class="text-base text-base-content font-medium">
							{comment.Author.username}
						</span>
						<span class="text-sm text-base-content text-opacity-50">
							{moment(comment.createdAt).fromNow()}
						</span>
					</div>
					<div class="dropdown dropdown-bottom dropdown-left">
						<button
							class="p-1.5 hover:bg-base-200 rounded-full"
							tabindex="0"
							role="button">
							<DotsVertical size={16}></DotsVertical>
						</button>
						<ul
							tabindex="0"
							class="dropdown-content menu bg-base-100 border border-base-200 rounded-box z-[1] w-52 p-2 shadow">
							<li>
								<a on:click={() => replyTo(comment.id)}>
									<ArrowLeft size={16}></ArrowLeft> Reply
								</a>
							</li>
						</ul>
					</div>
				</div>
				<p class="text-base">{comment.content}</p>
				{#if comment.replyTo !== null}
					{@const repliedToComment = comments.find(
						(c) => c.id === comment.replyTo
					)}
					{#if repliedToComment}
						{@const content = repliedToComment.content}
						{@const length = content.length}
						<button
							class="bg-base-200 border-l-2 border-l-secondary flex flex-row gap-4 py-2 px-2.5 mt-2 hover:bg-base-300 cursor-pointer w-full"
							on:click={() => jumpToComment(repliedToComment.id)}>
							<span
								class="flex flex-row gap-1 text-xs text-secondary items-center">
								<ArrowRight size={12}></ArrowRight> reply
							</span>
							<span class="text-sm text-base-content text-opacity-50 text-left">
								{length > 400 ? `${content.slice(0, 400)}...` : content}
							</span>
						</button>
					{/if}
				{/if}
			</div>
		</div>
	{/each}

	<div
		class="flex flex-col gap-2 mt-8"
		bind:this={editorContainer}>
		{#if replyingTo}
			{@const replyingToComment = comments.find(
				(comment) => comment.id === replyingTo
			)}

			{#if replyingToComment}
				{@const content = replyingToComment.content}
				{@const length = content.length}
				<div class="flex flex-row group">
					<button
						class="bg-base-200 border-l-2 border-l-secondary flex flex-col gap-3 py-2 px-2.5 hover:bg-base-300 cursor-pointer w-full"
						on:click={() => jumpToComment(replyingToComment.id)}>
						<span
							class="flex flex-row gap-1 text-xs text-secondary items-center">
							Replying To
						</span>
						<span class="text-sm text-base-content text-opacity-50 text-left">
							{length > 400 ? `${content.slice(0, 400)}...` : content}
						</span>
					</button>
					<button
						class="bg-red-400 px-4"
						on:click={() => (replyingTo = null)}>
						<Cross2 size={24}></Cross2>
					</button>
				</div>
			{/if}
		{/if}
		<MarkdownEditor
			{carta}
			mode="tabs"
			theme="github"
			bind:value={content}></MarkdownEditor>
		<button
			class="btn btn-success w-min btn-md"
			on:click={comment}>
			Comment
		</button>
	</div>
</div>

<style>
	:global(.highlighted) {
		@apply bg-base-200;
	}
</style>

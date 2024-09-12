<script lang="ts">
	import type { JsonTree } from "#lib/Tree";
	import CodeMirror from "svelte-codemirror-editor"
	import { json } from "@codemirror/lang-json"
	import { markdown } from "@codemirror/lang-markdown"
	import { javascript } from "@codemirror/lang-javascript"
	import type { LanguageSupport } from "@codemirror/language";

	export let file: JsonTree<{
		data: string,
		mimetype: string,
		type: string,
		bytesize: number
	}> | null;

	let language: LanguageSupport | null = null;

	if (file?.value.mimetype === "application/json") {
		language = json();
	} else if (file?.value.mimetype === "text/markdown") {
		language = markdown();
	} else if (file?.value.mimetype === "text/plain") {
		language = null;
	} else if (file?.value.mimetype === "text/javascript") {
		language = javascript({
			typescript: false
		});
	} else if (file?.value.mimetype === "application/typescript") {
		language = javascript({
			typescript: true
		});
	}
</script>

<CodeMirror value={file?.value.data} editable={false} lineWrapping={true} readonly={true} lang={language}></CodeMirror>

<style>
	:global(.cm-gutters, .cm-activeLineGutter, .cm-activeLine) {
		@apply !bg-base-100;
	}

	:global(.cm-gutters) {
		@apply !border-r-base-300;
	}

	:global(.cm-editor) {
		@apply text-sm bg-base-100;
	}
</style>
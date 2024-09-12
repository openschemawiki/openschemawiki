<script lang="ts">
	import ThemeController from "./ThemeController.svelte";
	import { lightMode } from "#lib/shared";
	import ReactiveImage from "./ReactiveImage.svelte";

	export let light: boolean = false;

	lightMode.set(light);
</script>
<header class="h-full border-b border-base-200">
	<div class="border-b border-b-base-200">
		<div class="max-w-screen-2xl flex flex-row mx-auto py-6 px-8">
			<nav>
				<ul class="flex flex-row gap-8">
					<li class="font-bold text-base link link-hover"><a href="/docs">Pro</a></li>
					<li class="font-bold text-base link link-hover"><a href="/docs">Documentation</a></li>
					<li class="font-bold text-base link link-hover"><a href="/validate">CLI</a></li>
					<li class="font-bold text-base link link-hover"><a href="/about">Pricing</a></li>
				</ul>
			</nav>
		</div>
	</div>
	<div class="max-w-screen-2xl flex flex-row items-center gap-8 mx-auto py-4 px-8">
		<a href="/">
			<ReactiveImage src="/logo-light.svg" srclight="/logo-dark.svg" class="h-12"></ReactiveImage>
		</a>
		<form action="/schemas" method="get" class="w-full">
			<input type="text" class="input input-bordered input-md w-full" placeholder="Search Schemas..." name="q">
		</form>
		<ThemeController></ThemeController>
	</div>
</header>
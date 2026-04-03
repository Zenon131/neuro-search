<!-- script -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Niivue } from '@niivue/niivue';

	interface Concept {
		name: string;
		uid: string;
		relationships?: Array<{
			relationship: string;
			name: string;
		}>;
	}

	interface SearchResult {
		concept: Concept | null;
		regions: string[];
		mapUrl: string | null;
		explanation: string;
	}

	let query = $state('');
	let result: SearchResult | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(false);
	let canvas: HTMLCanvasElement;
	let nv: Niivue;

	onMount(() => {
		nv = new Niivue({
			show3Dcrosshair: true,
			crosshairColor: [0, 0, 1, 1],
			backColor: [0.1, 0.1, 0.1, 1]
		});
		nv.attachToCanvas(canvas);
		// load default mni template from local static folder
		nv.loadVolumes([{ url: '/mni152.nii.gz' }]);
	});

	async function search() {
		if (!query.trim()) return;
		loading = true;
		error = null;
		result = null;

		try {
			const res = await fetch('/api/decode', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ query })
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Server error: ${res.status} - ${text}`);
			}

			result = await res.json();

			// overlay neurovault stat map if possible
			if (result?.mapUrl && nv) {
				nv.loadVolumes([
					{ url: '/mni152.nii.gz' },
					{ url: result.mapUrl, colormap: 'hot', opacity: 0.6 }
				]);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			console.error('Search error:', e);
		} finally {
			loading = false;
		}
	}
</script>

<!-- main content -->
<main>
	<div class="page">
		<section class="content">
			<div class="search-container">
				<div class="search-bar">
					<input
						type="text"
						bind:value={query}
						placeholder="Search concepts (e.g., fear, attention, pain)"
						onkeydown={(e) => {
							if (e.key === 'Enter') search();
						}}
					/>
					<button type="button" onclick={search} disabled={loading}>
						{loading ? '...' : 'Search'}
					</button>
				</div>
			</div>

			{#if error}
				<div class="error">{error}</div>
			{:else if result}
				<section class="results">
					<h2>{result.concept?.name ?? query}</h2>
					<div class="regions">
						{#each result.regions ?? [] as region, i (i)}
							<span class="region-tag">{region}</span>
						{/each}
					</div>
					<p class="explanation">{result.explanation}</p>
				</section>
			{:else if !loading}
				<p class="hint">
					Enter a neuroscience concept above to see brain regions and an AI explanation
				</p>
			{/if}
		</section>

		<section class="viewer">
			<canvas bind:this={canvas} id="gl"></canvas>
		</section>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		padding: 2.5rem 2rem 3rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #111827;
		background: #f8fafc;
	}

	.page {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: minmax(280px, 1fr) minmax(320px, 560px);
		gap: 2.5rem;
		align-items: start;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.viewer {
		width: 100%;
	}

	#gl {
		width: 100%;
		height: 70vh;
		min-height: 420px;
		border-radius: 16px;
		background: #111827;
		display: block;
		box-shadow: 0 16px 30px rgba(15, 23, 42, 0.18);
	}

	.search-container {
		width: 100%;
		max-width: 560px;
	}

	.search-bar {
		display: flex;
		background: #fff;
		border-radius: 9999px;
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
		overflow: hidden;
	}

	input {
		flex: 1;
		padding: 1rem 1.5rem;
		font-size: 1rem;
		border: none;
		background: transparent;
		color: #111827;
		outline: none;
		font-family: inherit;
	}

	input::placeholder {
		color: #9ca3af;
	}

	button {
		padding: 1rem 1.75rem;
		font-size: 0.9375rem;
		font-weight: 600;
		background: #111827;
		color: #fff;
		border: none;
		cursor: pointer;
		transition: background-color 0.15s ease;
		font-family: inherit;
	}

	button:hover:not(:disabled) {
		background: #374151;
	}

	button:disabled {
		background: #6b7280;
		cursor: not-allowed;
	}

	.error {
		width: 100%;
		max-width: 560px;
		padding: 1rem 1.5rem;
		background: #fef2f2;
		color: #b91c1c;
		border-radius: 12px;
		font-size: 0.875rem;
		box-shadow: 0 12px 24px rgba(185, 28, 28, 0.08);
	}

	.hint {
		width: 100%;
		max-width: 560px;
		padding: 1rem 1.5rem;
		color: #6b7280;
		font-size: 0.9375rem;
		text-align: center;
	}

	.results {
		width: 100%;
		max-width: 560px;
		background: #fff;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
	}

	.results h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 1rem;
		color: #111827;
	}

	.regions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.region-tag {
		padding: 0.375rem 0.875rem;
		font-size: 0.8125rem;
		font-weight: 500;
		background: #f3f4f6;
		color: #374151;
		border-radius: 9999px;
		font-family: inherit;
	}

	.explanation {
		line-height: 1.6;
		color: #4b5563;
		font-size: 0.9375rem;
		margin: 0;
	}

	@media (max-width: 960px) {
		.page {
			grid-template-columns: 1fr;
		}

		.viewer {
			order: 2;
		}

		#gl {
			height: 50vh;
			min-height: 320px;
		}
	}
</style>

import ollama from 'ollama';

// get a response from cognitive atlas and extract teh data as json
/** @param {{ request: Request }} event */
export async function POST({ request }) {
	const { query } = await request.json();

	// part 1 used cog atlas to find regions related to a concept
	const cogAtlasResponse = await fetch(
		`https://www.cognitiveatlas.org/api/v-alpha/concept?search=${encodeURIComponent(query)}&format=json`
	);
	const cogAtlasData = await cogAtlasResponse.json();

	const concept = cogAtlasData[0] ?? null;

	const regions =
		concept?.relationships
			?.filter((/** @type {any} */ r) => r.relationship === 'RELATED_TO_STRUCTURE')
			?.map((/** @type {any} */ r) => r.name)
			?.slice(0, 5) ?? [];

	// part b finds a map of the regions to do with the concept
	const neuroVaultResponse = await fetch(
		`https://neurovault.org/api/images/?search=${encodeURIComponent(query)}&format=json`
	);
	const neuroVaultData = await neuroVaultResponse.json();
	const image = neuroVaultData.results?.find((/** @type {any} */ img) => img.file);
	const mapUrl = image?.file ?? null;

	// part c uses ollama to explain
	const ollamaMsg = `The neuroscience/cognitive concept "${query}" is associated with these brain regions: ${regions.join(', ') || 'unknown regions'}.
      In a few sentences, explain the neuroscience behind this mapping for a curious non-expert. Be specific and vivid and use analogies.`;
	const response = await ollama.chat({
		model: 'minimax-m2.7:cloud',
		messages: [{ role: 'user', content: ollamaMsg }]
	});
	const explanation = response.message?.content ?? 'No explanation available.';
	return new Response(JSON.stringify({ concept, regions, mapUrl, explanation }), {
		headers: { 'Content-Type': 'application/json' }
	});
}

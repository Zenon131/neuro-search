# Neuro Search

An interactive neuroscience search tool that maps cognitive concepts to brain regions and generates AI-powered explanations.

## Features

- **Concept Search**: Query cognitive concepts (e.g., "fear", "attention", "pain")
- **Brain Region Mapping**: Displays associated brain regions from the Cognitive Atlas API
- **3D Brain Visualization**: Interactive 3D brain viewer using Niivue with activation overlays from NeuroVault
- **AI Explanations**: Generated using Ollama LLM to explain the neuroscience behind concept-region mappings

## Tech Stack

- **Frontend**: SvelteKit 5 with Svelte 5 runes
- **3D Viewer**: Niivue for brain visualization
- **Backend**: SvelteKit API routes
- **External APIs**:
  - [Cognitive Atlas](https://www.cognitiveatlas.org/) - Brain region associations
  - [NeuroVault](https://neurovault.org/) - Brain activation maps
  - [Ollama](https://ollama.ai/) - LLM for generating explanations

## Getting Started

### Prerequisites

- Node.js 18+
- Ollama running locally (for AI explanations)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. Enter a cognitive concept (e.g., "fear", "attention", "pain")
4. View brain regions and AI-generated explanation
5. Explore the 3D brain visualization with activation overlays

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte          # Main UI
│   └── api/decode/+server.js # Search API endpoint
└── static/
    └── mni152.nii.gz          # MNI brain template
```

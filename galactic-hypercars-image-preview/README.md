# Galactic Hypercars image preview

Preview: https://ae6820dc.github.io/webtrade/galactic-hypercars-image-preview/index.html

## Verified coverage

**24 real, distinct WebP files completed; 976 images pending.** WT-0001–WT-0008 are the approved originals, preserved byte-for-byte. Batch 02 adds WT-0009–WT-0016; batch 03 adds WT-0017–WT-0024. This run completed 16 additional images in two batches, not full completion of issue #2. No generation quota error was observed in this batch; the remaining generation work is still outstanding.

All work remains in this separate preview directory. The original `galactic-hypercars/` application and its assets are unchanged. Preview approval does not authorize integration into that application.

`manifest.json` maps all 1,000 exact IDs, manufacturer/model names, exterior colors and propulsion values from the original catalog. `image: null` means no generated image exists. Never count pending records as completed files, and never substitute, recolor or reuse another car's image. The default gallery displays completed cars; the catalog and pending filters expose the remaining work without placeholder car imagery. Search supports ID, name, original Hungarian colors and English color names. Only 12 cards are rendered per page; actual images use native lazy loading with intrinsic dimensions.

## Provenance and art direction

All images were individually generated with the available OpenAI image-generation tool on 2026-10-16. No stock assets or real brand marks were requested. Generated output is subject to the service's applicable terms. Batch 02 retains the approved premium photorealistic futuristic automotive style, with independent vehicle geometry and settings:

| ID | Design direction |
| --- | --- |
| WT-0009 | Helion Arc ONE-3008; ion silver quantum coupe, crescent fairings and exposed core; icy ocean observatory |
| WT-0010 | Veltrix Arc S-3009; obsidian fusion stealth coupe, hexagonal wheels and twin canopy; volcanic moon |
| WT-0011 | Chronova Oblivion RS-3010; plasma blue magnetic racer, ski-like front pods and rear rings; maglev spaceport |
| WT-0012 | Zephyrix Vector ONE-3011; nebula purple antimatter arrowhead, separated front nacelles; orbital accelerator |
| WT-0013 | Voidstar Phantom XR-3012; aurora cyan plasma fastback, side gills and multi-part rear wing; canyon bridge |
| WT-0014 | Luminara Mirage XR-3013; solar gold antigravity barchetta, spherical pods and open cockpit; cloud station |
| WT-0015 | Cryovex Seraph XR-3014; Mars red six-wheel quantum racer, bifurcated nose; Europa glacier |
| WT-0016 | Ecliptix Phantom GT-3015; moon white fusion GT, visor lights and twin dorsal fins; orbital conservatory |

Each new image was visually inspected and encoded from its independent generated PNG as 1536 × 1024 WebP using Pillow quality 84, method 6. Batch 02 files are 209,422–348,598 bytes each. Approved batch 01 files were not re-encoded.

Batch 03 uses the same individual generation and optimization process. Its eight files are 223,092–359,440 bytes each:

| ID | Design direction |
| --- | --- |
| WT-0017 | Novaryn Eclipse S-3016; silver magnetic manta with hollow pontoons; ocean eclipse |
| WT-0018 | Titanveil Spectre GT-3017; obsidian antimatter land yacht with stacked lamps; desert terminal |
| WT-0019 | Aurorix Eclipse GT-3018; blue plasma cab-forward coupe and rear turbines; stellar maintenance bay |
| WT-0020 | Nebulon Eclipse GT-3019; purple antigravity toroidal pods and elliptical fuselage; lunar plaza |
| WT-0021 | Spectraxis Seraph XR-3020; cyan quantum single-seat exoskeleton racer; white test chamber |
| WT-0022 | Ionara Vector S-3021; gold fusion diamond wedge and layered armor; alien forest |
| WT-0023 | Gravion Vortex GT-3022; red magnetic four-seat coupe and long skids; asteroid cavern |
| WT-0024 | Pulsaris Phantom S-3023; white antimatter three-ridge wedge; pulsar dock |

## Resume and validation

Next pending ID: **WT-0025**. Generate each next car independently from its exact catalog metadata, inspect the result, encode a new file under `images/`, and populate that record's `image` path only after the file exists. Commit completed batches to main. Keep every edit inside this directory and do not alter the approved first eight images.

Run from repository root with Playwright and Chromium installed:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright CHROMIUM_PATH=/usr/bin/chromium node galactic-hypercars-image-preview/tests/gallery.test.mjs
```

Checks cover all 1,000 catalog mappings, exact real-file count, unique SHA-256 image hashes, WebP signatures and size limits, original approved bytes, decoded browser images, lazy loading, search, empty results, pagination, pending records without images, full-image navigation, and no horizontal overflow/resource errors at 375, 768 and 1440 pixels. The existing Pages workflow already deploys this preview folder.

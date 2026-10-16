# Galactic Hypercars image preview

Preview: https://ae6820dc.github.io/webtrade/galactic-hypercars-image-preview/index.html

## Verified coverage

**16 real, distinct WebP files completed; 984 images pending.** WT-0001–WT-0008 are the approved originals, preserved byte-for-byte. Batch 02 adds WT-0009–WT-0016. This is a completed eight-image generation batch, not full completion of issue #2. No generation quota error was observed in this batch; the remaining generation work is still outstanding.

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

## Resume and validation

Next pending ID: **WT-0017**. Generate each next car independently from its exact catalog metadata, inspect the result, encode a new file under `images/`, and populate that record's `image` path only after the file exists. Commit completed batches to main. Keep every edit inside this directory and do not alter the approved first eight images.

Run from repository root with Playwright and Chromium installed:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright CHROMIUM_PATH=/usr/bin/chromium node galactic-hypercars-image-preview/tests/gallery.test.mjs
```

Checks cover all 1,000 catalog mappings, exact real-file count, unique SHA-256 image hashes, WebP signatures and size limits, original approved bytes, decoded browser images, lazy loading, search, empty results, pagination, pending records without images, full-image navigation, and no horizontal overflow/resource errors at 375, 768 and 1440 pixels. The existing Pages workflow already deploys this preview folder.

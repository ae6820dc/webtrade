# Galactic Hypercars image preview — batch 01

Standalone preview for issue #2's PREVIEW FIRST requirements. No assets or references in the original application have been modified. Explicit user approval is required before any integration.

Preview: https://ae6820dc.github.io/webtrade/galactic-hypercars-image-preview/index.html

## Scope and source

The immutable `../galactic-hypercars/catalog-data.js` contains exactly **1,000 entries and 1,000 unique IDs**. `catalog.js` exports this initial catalog; the generator also specifies 1,000 entries. This preview maps eight individually generated images to WT-0001 through WT-0008 using exact manufacturer/model names, exterior colors and propulsion values. These entries cover all eight exterior colors and all six propulsion types. `manifest.json` is the stable mapping; the HTML has its own static captions and needs no JavaScript or access to the original application at runtime.

**8 completed images; 992 cars remain without generated candidates.** Full-catalog generation and visual review are beyond this bounded preview session. This is a representative design review batch, not a claim of full coverage. After approval, further batches can extend the mapping, with visual review and duplicate checks before any separately approved integration.

## Image provenance and optimization

Created on 2026-10-16 with the available OpenAI image-generation tool, one independent generation per car, with no reference images or third-party stock assets. Prompts requested fictional futuristic vehicles, no real brand marks, text or watermarks, photorealistic premium automotive lighting and whole-vehicle compositions. Generated output is subject to the service's applicable terms; no separate stock license is asserted.

Art directions:

| ID | Design direction |
| --- | --- |
| WT-0001 | Ion silver plasma teardrop; split fenders and turbine wheels; orbital showroom |
| WT-0002 | Obsidian antigravity grand tourer; monolithic body and amber lighting; wet spaceport |
| WT-0003 | Plasma blue quantum track wedge; aero channels and large wing; white laboratory |
| WT-0004 | Nebula purple fusion concept; organic curves and spherical wheel pods; Saturn moon |
| WT-0005 | Aurora cyan levitating speedster; twin cockpit nacelles and wheel rings; dawn salt plain |
| WT-0006 | Solar gold antimatter concept; folded surfaces and vertical fins; orbital hangar |
| WT-0007 | Mars red muscular plasma hypercar; curved arches and wraparound canopy; Martian canyon |
| WT-0008 | Moon white antigravity coupe; porcelain surfaces and floating roof; lunar deck |

Images are 1536 × 1024 WebP, encoded once from generated PNGs with Pillow quality 84, method 6. No image is repeated or recolored to stand in for another car. Intrinsic dimensions reserve layout space; below-the-fold images use native lazy loading. Direct full-image links work without scripting. If an image fails, descriptive alt text and the independently rendered name/ID remain available.

## Validation

Run from the repository root with Node and Playwright installed:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright CHROMIUM_PATH=/usr/bin/chromium node galactic-hypercars-image-preview/tests/gallery.test.mjs
```

The test checks source count, exact catalog mappings, eight distinct SHA-256 image hashes, WebP headers, per-image size limits, all colors/propulsion types, image decoding, no horizontal overflow, anchor navigation, full-image navigation, and browser/resource errors at 375, 768 and 1440 pixels. Optional `EVIDENCE_DIR` saves screenshots outside the repository.

The existing Pages workflow includes the new folder in its push paths so preview changes deploy. Its original application tests and deployment remain in place. Application directories must have zero diff against the base commit.

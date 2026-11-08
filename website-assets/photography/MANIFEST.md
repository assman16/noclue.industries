# Editorial photography: licence manifest

All photographs below are **illustrative editorial imagery**. None of them shows NoClue Industries
work, equipment, premises or clients. The site labels them "Illustrative photography" wherever they
appear, and credits every photographer on `/credits`.

**Licence:** [Unsplash License](https://unsplash.com/license) for every image. It grants an
irrevocable, nonexclusive, worldwide copyright licence to download, copy, modify, distribute,
perform and use the photos for free, including for commercial purposes, without permission from
or attribution to the photographer or Unsplash. Two things are excluded: compiling photos from
Unsplash to build a similar or competing service, and selling unaltered copies. No image here is
an Unsplash+ (paid licence) image. Attribution is not required; we give it anyway.

**Licence checked:** 2026-11-08. Each source page below was fetched that day and showed "Free to use
under the Unsplash License". Downloads came from the Unsplash image CDN (`images.unsplash.com`) at
3600 px wide.

**Other rights:** the Unsplash License covers copyright only. The checks below cover the rights it
does not cover:

- **People:** no identifiable people appear in any selected image.
- **Trademarks:**
  - **ph03:** the maker's mark in the bottom-right corner is cropped out by the grade script.
  - **ph09:** a Prusa printer appears, but no badge is visible in the crop used, and a blurred
    label at the bottom of the frame is cropped out.
  - **ph10:** a cutaway exhibit at the Mercedes-Benz Museum. No logo is visible, and the site never
    names or implies the manufacturer.
- **Private property:** none of the images identifies a facility. None is presented as a NoClue
  facility.

**Processing:** `visualization/scripts/grade_photos.py` crops and colour-grades the originals in
`originals/` and writes them to `public/photography/v1/`. The grade is the house "cold steel" look,
except for one signal-orange duotone. Grading is a modification, which the licence permits.

| ID | File | Subject | Photographer | Source page | Used on |
|---|---|---|---|---|---|
| ph01 | `ph01-endmill-aluminium.jpg` → `endmill` | End mill finishing an aluminium part in coolant | Jelifer Maniago ([@jelly1024](https://unsplash.com/@jelly1024)) | https://unsplash.com/photos/a-machine-that-is-cutting-a-piece-of-metal-8MBTn3Z71zI | Home: Act II Mechanical (diptych, wide) |
| ph02 | `ph02-facemill.jpg` → `facemill` | Face mill above a turned blank | Jelifer Maniago ([@jelly1024](https://unsplash.com/@jelly1024)) | https://unsplash.com/photos/a-machine-that-is-cutting-a-piece-of-metal-O5rSp_U-Pa0 | Home: Act II Mechanical (diptych, tall) |
| ph03 | `ph03-laser-sparks.jpg` → `sparks` | Laser cutting head, spark fan | Le Trung ([@letrung7](https://unsplash.com/@letrung7)) | https://unsplash.com/photos/a-piece-of-metal-being-cut-with-a-machine-fBCQz7OUUww | Home: Act II Prototyping (orange field) |
| ph04 | `ph04-machined-ring.jpg` → `ring` | Machined ring with tapped hole, black and white | Greg Rosenke ([@greg_rosenke](https://unsplash.com/@greg_rosenke)) | https://unsplash.com/photos/black-and-white-round-frame-cq2_Wg8Ebd4 | Home: Act V Invitation |
| ph05 | `ph05-pcb-pads.jpg` → `pcb-pads` | Bare PCB, gold pads, macro | Vishnu Mohanan ([@vishnumaiea](https://unsplash.com/@vishnumaiea)) | https://unsplash.com/photos/close-up-of-dark-blue-circuit-board-pfR18JNEMv8 | Home: Act II Electronics (full-bleed) |
| ph06 | `ph06-pcb-crystal.jpg` → `pcb-crystal` | Populated PCB, crystal and QFP | Anne Nygård ([@polarmermaid](https://unsplash.com/@polarmermaid)) | https://unsplash.com/photos/a-circuit-board-with-many-small-components-vILVKROnyGA | Home: Act II Firmware |
| ph07 | `ph07-machined-pocket.jpg` → `pocket` | Coated end mill in a machined pocket | nik biziuk ([@nikbizuk](https://unsplash.com/@nikbizuk)) | https://unsplash.com/photos/stainless-steel-and-blue-hand-tool-hJ4JxDJkRUw | Capabilities: Mechanical |
| ph08 | `ph08-steel-balls.jpg` → `balls` | Steel balls, black and white | Random Thinking ([@randomthinking](https://unsplash.com/@randomthinking)) | https://unsplash.com/photos/black-and-white-photograph-of-shiny-balls-gOo1gDEhS5c | `/credits` only (reserve) |
| ph09 | `ph09-printer-hex.jpg` → `printer` | FDM print head laying a perimeter | Kenneth Li ([@kennethliphotography](https://unsplash.com/@kennethliphotography)) | https://unsplash.com/photos/3d-printer-creating-a-hexagonal-shape-bTPDkYQ9-xk | Capabilities: Prototyping |
| ph10 | `ph10-gearbox-cutaway.jpg` → `gearbox` | Sectioned transmission (museum exhibit) | Kirill Prikhodko ([@kirillq](https://unsplash.com/@kirillq)) | https://unsplash.com/photos/a-close-up-of-a-machine-with-many-gears-kRp5woiVDaY | Home: Act II Mechanical (full-bleed band) |

The "Used on" column describes the current build. Every image is also shown on `/credits`. The data the site reads lives in
`src/content/photography.ts`. Keep both files in sync when an image is added or retired.

## Sources that were considered and not used

- **Pexels:** the site rejects automated requests (HTTP 403). It wasn't used, and no attempt was
  made to work around the block.
- **Openverse:** searched under CC0 / Public Domain Mark / CC BY only. The results didn't meet the
  quality bar, so none were used.

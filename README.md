# Check Engines — homepage demo

Demo homepage for **Check Engines**, a car service and customisation workshop in
Hyderabad. Built by Mad Tech Solutions.

The centrepiece is a **3D build configurator**: every control maps to a service
the shop actually sells, so the hero doubles as a sales tool rather than
decoration.

| Control | Service it demonstrates |
|---|---|
| Wrap colour | Wrapping |
| Gloss / Satin / Matte | Ceramic coating, PPF, matte wrap |
| Alloy colour | Alloy refinishing |
| Calliper colour | Brake refinishing |
| Lights, Night | Lighting retrofits |

Named camera views (Overview, Paint, Wheels, Rear, Lights) fly the camera to a
framed shot for each service. The configured build is sent to WhatsApp as a
text spec.

## Running it

```bash
npm install
npm run dev      # http://localhost:4300
npm run build
npm run preview
```

> **Start the dev server from this folder.** Tailwind resolves its `content`
> globs against `process.cwd()`, so launching Vite from elsewhere silently
> produces a stylesheet with no utility classes. `serve.mjs` pins the working
> directory for exactly this reason.

## Layout

```
index.html            the whole page
render.html           dev-only harness for capturing the compare frames
serve.mjs             cwd-pinning dev server launcher
src/
  configurator.js     three.js scene, materials, camera presets
  main.js             UI wiring, gallery, compare slider, nav
  style.css           Tailwind layers + components
public/
  models/car.glb      3D car (DRACO compressed)
  hdr/env.hdr         reflection environment
  draco/              decoder for the compressed mesh
  img/                section photography
  insta/              gallery tiles
  render/             gloss/matte frames for the compare slider
```

## Regenerating the compare frames

The gloss/matte slider images come out of the configurator itself, so both
frames share identical camera, lighting and colour. Load
`/render.html?wrap=0&finish=0&alloy=2&view=paint`, capture, then call
`__car.api.setFinish(2)` and capture again.

## Placeholder content — replace before this goes live

- **The 3D model is a stand-in.** It is the Ferrari from the three.js examples,
  used to prove the interaction. Badge colours are neutralised in code, but the
  silhouette and nose badge are recognisably Ferrari — a live site needs a
  properly licensed, unbranded model.
- **Photography is AI-generated** placeholder imagery, not Check Engines' own
  work. Instagram tiles are real posts and are for demo purposes only.
- **The WhatsApp number is fake** (`910000000000`, in `src/main.js`). So are the
  opening hours and address in the Visit section.

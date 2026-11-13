import type { ProductKind } from './products'

export interface Hotspot {
  key: string
  label: string
  title: string
  body: string
  position: [number, number, number]
}

export const hotspots: Record<ProductKind, Hotspot[]> = {
  tube: [
    {
      key: 'cap',
      label: 'Cap',
      title: 'The cap',
      body: 'A quarter-turn, soft-touch cylindrical cap with a low-gloss finish so it never feels cold or slippery in the hand.',
      position: [0.16, -1.1, 0.34],
    },
    {
      key: 'label',
      label: 'Print',
      title: 'Direct screen print',
      body: 'Crisp vegetable-ink typography printed directly onto the high-gloss shell, sealed beneath a satin clearcoat.',
      position: [0.22, 0.02, 0.29],
    },
    {
      key: 'crimp',
      label: 'Crimp',
      title: 'The flared seal',
      body: 'Full-width ridged crimp seam — air-tight, glue-free, and engineered to roll down cleanly as the balm empties.',
      position: [0.28, 1.02, 0.08],
    },
    {
      key: 'body',
      label: 'Body',
      title: 'Glossy squeeze shell',
      body: 'Tapered cosmetic laminate that flares outward from the neck and rebounds softly with every press.',
      position: [-0.34, 0.56, 0.18],
    },
  ],
  serum: [
    {
      key: 'bulb',
      label: 'Dropper',
      title: 'Sculpted silicone pipette',
      body: 'Matte soft-touch teardrop bulb seated on a slim brushed champagne collar for calibrated drop control.',
      position: [0.14, 0.84, 0.18],
    },
    {
      key: 'flutes',
      label: 'Glass',
      title: '20-fluted optical glass',
      body: 'Vertical sculpted glass flutes refract warm studio light while revealing the botanical elixir and pipette stem inside.',
      position: [-0.28, -0.05, 0.36],
    },
    {
      key: 'print',
      label: 'Print',
      title: 'Direct glass screen-print',
      body: 'High-contrast cream typography silkscreened directly onto the fluted tinted glass with zero paper label seams.',
      position: [0.2, -0.58, 0.45],
    },
    {
      key: 'base',
      label: 'Base',
      title: 'Weighted glass foot',
      body: 'Heavy chamfered optical base engineered for poised weight in the palm and quiet shelf presence.',
      position: [-0.22, -1.2, 0.38],
    },
  ],
}

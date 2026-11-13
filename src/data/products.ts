export type ProductKind = 'tube' | 'serum'
export type Finish = 'matte' | 'satin' | 'dewy'

export interface ProductPalette {
  body: string
  bodyDeep: string
  bodyLight: string
  cap: string
  capDeep: string
  label: string
  ink: string
  accent: string
  backdrop: [string, string]
  glow: string
}

export interface IngredientDetail {
  name: string
  role: string
  percent: string
}

export interface Product {
  id: string
  index: string
  name: string
  line: string
  category: string
  kind: ProductKind
  size: string
  volume: string
  price: number
  finish: Finish
  finishLabel: string
  moistureScore: number
  moistureHours: number
  ingredients: string[]
  ingredientDetails: IngredientDetail[]
  notes: string
  description: string
  story: string
  palette: ProductPalette
}

export const products: Product[] = [
  {
    id: 'original-balm',
    index: '01',
    name: 'Original Balm',
    line: 'The first ritual',
    category: 'All-over balm',
    kind: 'tube',
    size: '100 ml',
    volume: '100 ml / 3.4 fl oz',
    price: 34,
    finish: 'satin',
    finishLabel: 'Satin',
    moistureScore: 92,
    moistureHours: 12,
    ingredients: ['Shea butter', 'Squalane', 'Vitamin E'],
    ingredientDetails: [
      { name: 'Shea butter', role: 'Rich cushion & dry-spot repair', percent: '18%' },
      { name: 'Squalane', role: 'Weightless skin-identical slip', percent: '12%' },
      { name: 'Vitamin E', role: 'Antioxidant barrier calm', percent: '2.5%' },
    ],
    notes: 'Unscented · Cushioned · Everyday',
    description:
      'A quiet, cushioned balm that melts on contact and leaves a soft satin veil — for hands, elbows, knees and every place in between.',
    story: 'Warm between the fingers. Press where skin feels tight. Let the quiet settle in.',
    palette: {
      body: '#2948DC',
      bodyDeep: '#243CC4',
      bodyLight: '#7B90F0',
      cap: '#F2E8D9',
      capDeep: '#DED6C8',
      label: '#FFFFFF',
      ink: '#1A2D8C',
      accent: '#3F63F2',
      backdrop: ['#FBEADF', '#F4D4BF'],
      glow: '#EAEFFF',
    },
  },
  {
    id: 'daily-cloud',
    index: '02',
    name: 'Daily Cloud',
    line: 'Morning, softened',
    category: 'Daily cream',
    kind: 'tube',
    size: '75 ml',
    volume: '75 ml / 2.5 fl oz',
    price: 32,
    finish: 'dewy',
    finishLabel: 'Airy',
    moistureScore: 89,
    moistureHours: 10,
    ingredients: ['Oat milk', 'Ceramide NP', 'Panthenol'],
    ingredientDetails: [
      { name: 'Oat milk', role: 'Soothing colloidal hydration', percent: '14%' },
      { name: 'Ceramide NP', role: 'Daily lipid barrier reinforcement', percent: '4.0%' },
      { name: 'Panthenol', role: 'Pro-vitamin B5 moisture bind', percent: '3.5%' },
    ],
    notes: 'Light · Milky · Morning',
    description:
      'An airy, cloud-soft cream that sinks in fast and leaves nothing behind but comfort. Made for the first few minutes of the day.',
    story: 'Smooth a pearl over damp skin. Follow with sunlight, coffee, and the rest of your morning.',
    palette: {
      body: '#F0B45E',
      bodyDeep: '#D5943E',
      bodyLight: '#F9D296',
      cap: '#F7EBD5',
      capDeep: '#DDC9A8',
      label: '#FFFBEF',
      ink: '#4A3318',
      accent: '#DB9B45',
      backdrop: ['#FFF7E7', '#F6D9A5'],
      glow: '#FFF1CF',
    },
  },
  {
    id: 'barrier-rescue',
    index: '03',
    name: 'Barrier Rescue',
    line: 'A quieter defense',
    category: 'Repair balm',
    kind: 'tube',
    size: '75 ml',
    volume: '75 ml / 2.5 fl oz',
    price: 38,
    finish: 'matte',
    finishLabel: 'Matte',
    moistureScore: 96,
    moistureHours: 16,
    ingredients: ['Ceramide complex', 'Cholesterol', 'Fatty acids'],
    ingredientDetails: [
      { name: 'Ceramide complex', role: '3:1:1 structural barrier rebuild', percent: '6.0%' },
      { name: 'Cholesterol', role: 'Intercellular lipid seal', percent: '2.5%' },
      { name: 'Fatty acids', role: 'Cold-pressed linoleic calm', percent: '8.0%' },
    ],
    notes: 'Rich · Unscented · Renewal',
    description:
      'A denser, protective balm for skin that has had enough. It sits close, seals gently, and gives a tired barrier room to recover.',
    story: 'Use at night on the places that sting. A little goes far; a second layer is allowed.',
    palette: {
      body: '#A78BD8',
      bodyDeep: '#8467BC',
      bodyLight: '#C7B4EC',
      cap: '#6B4FA8',
      capDeep: '#533A89',
      label: '#FBF8FF',
      ink: '#38265C',
      accent: '#9474CE',
      backdrop: ['#F5F0FB', '#DACCF1'],
      glow: '#F0E7FF',
    },
  },
  {
    id: 'soft-touch',
    index: '04',
    name: 'Soft Touch',
    line: 'A little tenderness',
    category: 'Hand balm',
    kind: 'tube',
    size: '60 ml',
    volume: '60 ml / 2 fl oz',
    price: 29,
    finish: 'satin',
    finishLabel: 'Velvet',
    moistureScore: 90,
    moistureHours: 12,
    ingredients: ['Rosehip oil', 'Bisabolol', 'Allantoin'],
    ingredientDetails: [
      { name: 'Rosehip oil', role: 'Cold-pressed cuticle nourishment', percent: '10%' },
      { name: 'Bisabolol', role: 'Chamomile-derived redness calm', percent: '1.5%' },
      { name: 'Allantoin', role: 'Wash-resistant velvet seal', percent: '1.0%' },
    ],
    notes: 'Delicate · Calming · Hands',
    description:
      'A velvet hand balm for the parts of you that do the most. Absorbs to a soft, second-skin finish that survives another wash.',
    story: 'Keep one by the sink. Press what is left into your cuticles, then carry on with your hands.',
    palette: {
      body: '#E39AA3',
      bodyDeep: '#C77883',
      bodyLight: '#F2C0C6',
      cap: '#B85C6A',
      capDeep: '#984652',
      label: '#FFF7F5',
      ink: '#5C2932',
      accent: '#C77C86',
      backdrop: ['#FCF0F0', '#EFCDD2'],
      glow: '#FFEBEE',
    },
  },
  {
    id: 'night-melt',
    index: '05',
    name: 'Night Melt',
    line: 'Slow hours',
    category: 'Overnight balm',
    kind: 'tube',
    size: '100 ml',
    volume: '100 ml / 3.4 fl oz',
    price: 36,
    finish: 'dewy',
    finishLabel: 'Melting',
    moistureScore: 95,
    moistureHours: 14,
    ingredients: ['Bakuchiol', 'Peptide blend', 'Borage oil'],
    ingredientDetails: [
      { name: 'Bakuchiol', role: 'Gentle overnight skin renewal', percent: '1.2%' },
      { name: 'Peptide blend', role: 'Elasticity & barrier recovery', percent: '5.0%' },
      { name: 'Borage oil', role: 'Gamma-linolenic warmth', percent: '11%' },
    ],
    notes: 'Deep · Warming · Night',
    description:
      'A slow-melting balm designed for the hours when nothing is asked of you. It softens as you sleep and is gone by morning.',
    story: 'Take a little more than you think you need. Warm it, press it in, let the day end.',
    palette: {
      body: '#86A47E',
      bodyDeep: '#647F5C',
      bodyLight: '#AEC5A8',
      cap: '#4E6A49',
      capDeep: '#3A5235',
      label: '#F8FBF3',
      ink: '#263B22',
      accent: '#6F8F67',
      backdrop: ['#F0F5EC', '#CBDAC5'],
      glow: '#EBF7E3',
    },
  },
  {
    id: 'barrier-elixir',
    index: '06',
    name: 'Barrier Elixir',
    line: 'Glass-skin clarity',
    category: 'Botanical drops',
    kind: 'serum',
    size: '30 ml',
    volume: '30 ml / 1.0 fl oz',
    price: 46,
    finish: 'dewy',
    finishLabel: 'Translucent',
    moistureScore: 98,
    moistureHours: 18,
    ingredients: ['Bio-Peptide 5%', 'Squalane', 'Ectoin'],
    ingredientDetails: [
      { name: 'Bio-Peptide 5%', role: 'Micro-encapsulated barrier bounce', percent: '5.0%' },
      { name: 'Squalane', role: 'Weightless botanical slip', percent: '14%' },
      { name: 'Ectoin', role: '18-hour cellular hydration lock', percent: '2.0%' },
    ],
    notes: 'Fluted glass · Weightless · Radiance',
    description:
      'A featherweight bio-peptide elixir housed in 20-fluted optical glass with a brushed champagne pipette. Two drops seal moisture beneath any balm.',
    story: 'Press two warm drops over damp skin after cleansing, then follow with your Aroma Farmacy balm.',
    palette: {
      body: '#C6884E',
      bodyDeep: '#996231',
      bodyLight: '#ECC396',
      cap: '#302722',
      capDeep: '#1E1815',
      label: '#FFFDF8',
      ink: '#302722',
      accent: '#C6884E',
      backdrop: ['#FBF3E8', '#ECD2B6'],
      glow: '#FFF1DF',
    },
  },
]

export const getProduct = (index: number) => products[((index % products.length) + products.length) % products.length]

export const cartPrice = (id: string, qty: number) => {
  const product = products.find((p) => p.id === id)
  return (product?.price ?? 0) * qty
}

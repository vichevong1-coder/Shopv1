import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import fs from 'fs';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import Product, { IImage, IVariant } from '../models/Product';

// ─── Clients ──────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY!
);

const BUCKET      = process.env.SUPABASE_BUCKET ?? 'Products';
const MOCKDATA_DIR = path.resolve(__dirname, '../../../mockdata');

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorImage {
  file: string;
  color: string;
  colorHex: string;
}

interface ProductDef {
  name: string;
  description: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  category: 'hat' | 'shirt' | 'pant' | 'shoe' | 'accessory';
  gender: 'men' | 'women' | 'kids' | 'unisex';
  brand: string;
  tags: string[];
  isFeatured?: boolean;
  sizes: string[];
  colorImages: ColorImage[];
}

// ─── Product definitions ──────────────────────────────────────────────────────

const PRODUCTS: ProductDef[] = [
  {
    name: 'Slim Fit Chino',
    description:
      'Versatile slim-fit chino in stretch cotton twill. Smart enough for the office, casual enough for weekends. Features a zip fly with button closure and side slash pockets.',
    priceInCents: 5900,
    compareAtPriceInCents: 7500,
    category: 'pant',
    gender: 'men',
    brand: 'FitForm',
    tags: ['chino', 'slim', 'men', 'pants'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_1ub4fx1ub4fx1ub4.png', color: 'Olive',    colorHex: '#556B2F' },
      { file: 'Gemini_Generated_Image_7wzhx97wzhx97wzh.png', color: 'Charcoal', colorHex: '#4A4A4A' },
      { file: 'Gemini_Generated_Image_lwsibllwsibllwsi.png', color: 'Khaki',    colorHex: '#C3A882' },
    ],
  },
  {
    name: 'Wide-Leg Chino Trouser',
    description:
      'Elevated wide-leg trouser with a high-rise waist in structured cotton blend. Clean front with side slash pockets and a single back welt pocket.',
    priceInCents: 6500,
    compareAtPriceInCents: 8500,
    category: 'pant',
    gender: 'women',
    brand: 'FitForm',
    tags: ['trouser', 'wide-leg', 'women', 'chino'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_5a48sg5a48sg5a48.png', color: 'Khaki',    colorHex: '#C3A882' },
      { file: 'Gemini_Generated_Image_c7jtk3c7jtk3c7jt.png', color: 'Charcoal', colorHex: '#4A4A4A' },
      { file: 'Gemini_Generated_Image_kd0viykd0viykd0v.png', color: 'Olive',    colorHex: '#556B2F' },
    ],
  },
  {
    name: 'Kids Cargo Pant',
    description:
      'Rugged pull-on cargo pants with an elasticated drawstring waist and snap-button utility pockets on each leg. Built for active play.',
    priceInCents: 2900,
    category: 'pant',
    gender: 'kids',
    brand: 'FitForm',
    tags: ['kids', 'cargo', 'pants', 'play'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_5s2ozc5s2ozc5s2o.png', color: 'Khaki',    colorHex: '#C3A882' },
      { file: 'Gemini_Generated_Image_gw45qpgw45qpgw45.png', color: 'Olive',    colorHex: '#4A5C2F' },
      { file: 'Gemini_Generated_Image_jga2k3jga2k3jga2.png', color: 'Charcoal', colorHex: '#5A5A5A' },
    ],
  },
  {
    name: 'Kids Jogger Pant',
    description:
      'Cozy pull-on jogger with an elastic drawstring waist and ribbed ankle cuffs. Soft brushed interior keeps kids comfortable all day.',
    priceInCents: 2500,
    category: 'pant',
    gender: 'kids',
    brand: 'FitForm',
    tags: ['kids', 'jogger', 'pants', 'comfort'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_84h9yo84h9yo84h9.png', color: 'Khaki',    colorHex: '#C3A882' },
      { file: 'Gemini_Generated_Image_ljzu0mljzu0mljzu.png', color: 'Olive',    colorHex: '#4A5C2F' },
      { file: 'Gemini_Generated_Image_s5l5v8s5l5v8s5l5.png', color: 'Charcoal', colorHex: '#5A5A5A' },
    ],
  },
  {
    name: 'Kids Crewneck Sweatshirt',
    description:
      'Classic crewneck sweatshirt in medium-weight fleece with ribbed cuffs and hem. Relaxed fit with a soft brushed interior.',
    priceInCents: 3200,
    compareAtPriceInCents: 4200,
    category: 'shirt',
    gender: 'kids',
    brand: 'Basics Co.',
    tags: ['kids', 'sweatshirt', 'crewneck', 'fleece'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_9ntrui9ntrui9ntr.png', color: 'White',      colorHex: '#F5F5F5' },
      { file: 'Gemini_Generated_Image_dwvh4edwvh4edwvh.png', color: 'Sage',       colorHex: '#8FAE97' },
      { file: 'Gemini_Generated_Image_nx1cu3nx1cu3nx1c.png', color: 'Steel Blue', colorHex: '#607D8B' },
    ],
  },
  {
    name: 'Explore Every Day Graphic Tee',
    description:
      "Fun kids' tee featuring a cheerful dinosaur explorer graphic. Made from 100% soft cotton jersey. Easy-care and machine washable.",
    priceInCents: 1900,
    category: 'shirt',
    gender: 'kids',
    brand: 'Basics Co.',
    tags: ['kids', 'tshirt', 'graphic', 'dinosaur'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_luhxuyluhxuyluhx.png', color: 'Steel Blue', colorHex: '#607D8B' },
      { file: 'Gemini_Generated_Image_nypfjqnypfjqnypf.png', color: 'White',      colorHex: '#F5F5F5' },
      { file: 'Gemini_Generated_Image_qifqunqifqunqifq.png', color: 'Sage',       colorHex: '#8FAE97' },
    ],
  },
];

// ─── Upload local PNG to Supabase Storage ─────────────────────────────────────

async function uploadToSupabase(filePath: string, storagePath: string): Promise<IImage> {
  console.log(`    Uploading -> ${storagePath}`);

  const buffer = fs.readFileSync(filePath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) throw new Error(`Supabase upload error: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return { url: data.publicUrl, publicId: storagePath };
}

// ─── Build variants for one color across all sizes ────────────────────────────

function buildVariants(
  def: ProductDef,
  color: string,
  colorHex: string
): IVariant[] {
  const skuPrefix = [
    def.brand.replace(/\s/g, '').substring(0, 3),
    def.category.substring(0, 3),
    def.gender.substring(0, 1),
    color.replace(/\s/g, '').substring(0, 3),
  ]
    .join('-')
    .toUpperCase();

  return def.sizes.map((size) => ({
    size,
    color,
    colorHex,
    stock: Math.floor(Math.random() * 20) + 5,
    reservedStock: 0,
    sku: `${skuPrefix}-${size.replace(/[^a-zA-Z0-9]/g, '')}`.toUpperCase(),
  }));
}

// ─── Save product to MongoDB (upsert by name + gender) ────────────────────────

async function saveProduct(
  def: ProductDef,
  images: IImage[],
  variants: IVariant[]
): Promise<void> {
  const existing = await Product.findOne({ name: def.name, gender: def.gender });

  if (existing) {
    console.log(`    Updating existing: ${def.name} (${def.gender})`);
    existing.images   = images;
    existing.variants = variants;
    await existing.save();
    return;
  }

  const { colorImages, sizes, ...rest } = def;
  await Product.create({
    ...rest,
    images,
    variants,
    isActive: true,
    isDeleted: false,
    ratings: { average: 0, count: 0 },
  });

  console.log(`    Saved: ${def.name} (${def.gender})`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\nSeedProducts3 — local mockdata upload');
  console.log('─'.repeat(55));
  console.log(`  Products : ${PRODUCTS.length}`);
  console.log(`  Images   : 18 PNG files from /mockdata`);
  console.log('─'.repeat(55) + '\n');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not set in .env');

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected\n');

  let saved = 0;
  let errors = 0;

  for (const [i, def] of PRODUCTS.entries()) {
    console.log(`\n[${i + 1}/${PRODUCTS.length}] ${def.name} — ${def.gender} ${def.category}`);
    console.log('─'.repeat(55));

    try {
      const allImages:   IImage[]   = [];
      const allVariants: IVariant[] = [];

      for (const { file, color, colorHex } of def.colorImages) {
        console.log(`\n  Color: ${color} (${colorHex})`);

        const localPath  = path.join(MOCKDATA_DIR, file);
        const slug       = def.name.toLowerCase().replace(/\s+/g, '-');
        const colorSlug  = color.toLowerCase().replace(/\s+/g, '-');
        const storagePath = `${def.category}/${def.gender}/${slug}-${colorSlug}.png`;

        const image = await uploadToSupabase(localPath, storagePath);
        allImages.push(image);

        allVariants.push(...buildVariants(def, color, colorHex));
      }

      await saveProduct(def, allImages, allVariants);
      saved++;
    } catch (err: any) {
      errors++;
      console.error(`  ERROR [${def.name}]: ${err.message}`);
    }
  }

  await mongoose.disconnect();

  console.log('\n' + '='.repeat(55));
  console.log('Seed complete!');
  console.log(`  Saved  : ${saved}/${PRODUCTS.length}`);
  console.log(`  Errors : ${errors}`);
  console.log('='.repeat(55) + '\n');
}

seed().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});

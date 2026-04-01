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

const BUCKET       = process.env.SUPABASE_BUCKET ?? 'Products';
const MOCKDATA_DIR = path.resolve(__dirname, '../../../mockdata4');

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
  // ── Men's Shirts & Tops ────────────────────────────────────────────────────
  {
    name: 'Mock Neck Knit Sweater',
    description:
      'Refined mock neck sweater knit from a soft merino-blend yarn. Relaxed fit with ribbed cuffs and hem. Versatile enough for layering or wearing alone.',
    priceInCents: 7900,
    compareAtPriceInCents: 9800,
    category: 'shirt',
    gender: 'men',
    brand: 'Basics Co.',
    tags: ['sweater', 'mock-neck', 'knit', 'men'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_40hqjt40hqjt40hq.png', color: 'Grey Marl',  colorHex: '#9E9E9E' },
      { file: 'Gemini_Generated_Image_r4ec17r4ec17r4ec.png', color: 'Burgundy',   colorHex: '#722F37' },
      { file: 'Gemini_Generated_Image_ut5m1sut5m1sut5m.png', color: 'Oatmeal',    colorHex: '#E8DDD0' },
    ],
  },
  {
    name: 'Oxford Dress Shirt',
    description:
      'Crisp long-sleeve oxford shirt in 100% cotton poplin. Spread collar, chest patch pocket, and a clean straight hem. Tuck it in or leave it out.',
    priceInCents: 6500,
    compareAtPriceInCents: 8500,
    category: 'shirt',
    gender: 'men',
    brand: 'FitForm',
    tags: ['oxford', 'dress-shirt', 'button-down', 'men'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_5deyjm5deyjm5dey.png', color: 'Blush Pink', colorHex: '#F4C2C2' },
      { file: 'Gemini_Generated_Image_q8aecpq8aecpq8ae.png', color: 'White',      colorHex: '#F9F9F9' },
      { file: 'Gemini_Generated_Image_tfsi92tfsi92tfsi.png', color: 'Slate Grey', colorHex: '#708090' },
    ],
  },
  {
    name: 'Camp Collar Linen Shirt',
    description:
      'Laid-back short-sleeve camp collar shirt woven from breathable linen. Features a chest patch pocket and relaxed boxy cut — perfect for warm days.',
    priceInCents: 5500,
    category: 'shirt',
    gender: 'men',
    brand: 'FitForm',
    tags: ['linen', 'camp-collar', 'short-sleeve', 'men', 'summer'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_6rba4i6rba4i6rba.png', color: 'Terracotta', colorHex: '#C0603A' },
      { file: 'Gemini_Generated_Image_7h8til7h8til7h8t.png', color: 'Natural',    colorHex: '#F5F0E8' },
      { file: 'Gemini_Generated_Image_sdpo0osdpo0osdpo.png', color: 'Teal',       colorHex: '#007B7B' },
    ],
  },
  {
    name: 'Piqué Polo Shirt',
    description:
      'Classic piqué cotton polo with a two-button placket and ribbed collar and cuffs. A wardrobe staple that goes from casual Fridays to weekend outings.',
    priceInCents: 4500,
    compareAtPriceInCents: 5500,
    category: 'shirt',
    gender: 'men',
    brand: 'Basics Co.',
    tags: ['polo', 'pique', 'men', 'casual'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_dfpmxqdfpmxqdfpm.png', color: 'Black',        colorHex: '#1A1A1A' },
      { file: 'Gemini_Generated_Image_hkso5phkso5phkso.png', color: 'Forest Green', colorHex: '#1B5E20' },
      { file: 'Gemini_Generated_Image_mtp2xvmtp2xvmtp2.png', color: 'Mustard',      colorHex: '#C9952A' },
    ],
  },
  {
    name: 'Harrington Jacket',
    description:
      'Timeless Harrington jacket in washed cotton twill with a point collar, full-zip front, and signature flap pockets with button tabs. Ribbed hem and cuffs.',
    priceInCents: 11900,
    compareAtPriceInCents: 14500,
    category: 'shirt',
    gender: 'men',
    brand: 'FitForm',
    tags: ['jacket', 'harrington', 'men', 'outerwear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_fzhlybfzhlybfzhl.png', color: 'Navy',       colorHex: '#1F2D4A' },
      { file: 'Gemini_Generated_Image_g6gnog6gnog6gnog.png', color: 'Black',      colorHex: '#1A1A1A' },
      { file: 'Gemini_Generated_Image_zfl9pmzfl9pmzfl9.png', color: 'Khaki Olive', colorHex: '#8C8455' },
    ],
  },

  // ── Men's Pants ────────────────────────────────────────────────────────────
  {
    name: 'Tailored Flat-Front Trouser',
    description:
      'Structured flat-front trouser cut from a smooth cotton-twill blend. Mid-rise waist, tapered leg with a subtle crease, and side slash pockets.',
    priceInCents: 8900,
    compareAtPriceInCents: 11000,
    category: 'pant',
    gender: 'men',
    brand: 'FitForm',
    tags: ['trouser', 'tailored', 'flat-front', 'men', 'smart'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_8m8bih8m8bih8m8b.png', color: 'Navy',      colorHex: '#1C2B5A' },
      { file: 'Gemini_Generated_Image_98dqcv98dqcv98dq.png', color: 'Steel Blue', colorHex: '#4F7A9A' },
      { file: 'Gemini_Generated_Image_h8qwloh8qwloh8qw.png', color: 'Olive',     colorHex: '#6B7C5E' },
    ],
  },
  {
    name: 'Slim Casual Chino',
    description:
      'Everyday slim chino in lightweight garment-washed cotton. Sits slightly below the waist with a tapered leg and finished hem. Easy to dress up or down.',
    priceInCents: 6200,
    category: 'pant',
    gender: 'men',
    brand: 'FitForm',
    tags: ['chino', 'slim', 'casual', 'men'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_j7v6krj7v6krj7v6.png', color: 'Khaki',      colorHex: '#C3B090' },
      { file: 'Gemini_Generated_Image_jgrq88jgrq88jgrq.png', color: 'Stone Grey', colorHex: '#9E9E9E' },
      { file: 'Gemini_Generated_Image_vfh63qvfh63qvfh6.png', color: 'Dark Brown', colorHex: '#4A3728' },
    ],
  },

  // ── Women's Shirts & Tops ──────────────────────────────────────────────────
  {
    name: 'Ribbed Turtleneck Sweater',
    description:
      'Chunky-rib turtleneck sweater in a premium wool-blend. Oversized silhouette with dropped shoulders and long cuffs — minimal and effortlessly elegant.',
    priceInCents: 8500,
    compareAtPriceInCents: 10500,
    category: 'shirt',
    gender: 'women',
    brand: 'Basics Co.',
    tags: ['turtleneck', 'ribbed', 'sweater', 'women', 'knit'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_63cwlp63cwlp63cw.png', color: 'Camel',        colorHex: '#C19A6B' },
      { file: 'Gemini_Generated_Image_pssvjopssvjopssv.png', color: 'Forest Green', colorHex: '#2E6B2E' },
      { file: 'Gemini_Generated_Image_xk77mxxk77mxxk77.png', color: 'Ivory',        colorHex: '#FFFFF0' },
    ],
  },
  {
    name: 'Wrap Blouse',
    description:
      'Elegant long-sleeve wrap blouse in crisp cotton poplin. V-neckline, self-tie waist belt, and fitted cuffs with button closure. A polished everyday essential.',
    priceInCents: 5900,
    compareAtPriceInCents: 7500,
    category: 'shirt',
    gender: 'women',
    brand: 'Basics Co.',
    tags: ['blouse', 'wrap', 'women', 'elegant'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_e0o85le0o85le0o8.png', color: 'Slate Grey', colorHex: '#708090' },
      { file: 'Gemini_Generated_Image_iimlzbiimlzbiiml.png', color: 'White',      colorHex: '#F9F9F9' },
      { file: 'Gemini_Generated_Image_xpxttyxpxttyxpxt.png', color: 'Dusty Rose', colorHex: '#C4927A' },
    ],
  },
  {
    name: 'Layered Peplum Top',
    description:
      'Structured short-sleeve top with a double-layered peplum hem in smooth scuba fabric. Fitted bodice with a subtle flare — from brunch to evening.',
    priceInCents: 5200,
    category: 'shirt',
    gender: 'women',
    brand: 'Basics Co.',
    tags: ['peplum', 'top', 'women', 'structured'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_ogsv6pogsv6pogsv.png', color: 'Emerald',   colorHex: '#2E8B57' },
      { file: 'Gemini_Generated_Image_qe3ssaqe3ssaqe3s.png', color: 'Blush Pink', colorHex: '#E8B4A0' },
      { file: 'Gemini_Generated_Image_xsa4zlxsa4zlxsa4.png', color: 'Lavender',  colorHex: '#B399D4' },
    ],
  },
  {
    name: 'Boxy Crop Tee',
    description:
      'Relaxed boxy crop tee cut from heavyweight 220gsm cotton jersey. Slightly dropped shoulders and a raw-edge hem give it an effortless off-duty look.',
    priceInCents: 2900,
    compareAtPriceInCents: 3800,
    category: 'shirt',
    gender: 'women',
    brand: 'Basics Co.',
    tags: ['crop', 'tshirt', 'women', 'casual', 'cotton'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_a49txxa49txxa49t.png', color: 'White',    colorHex: '#F9F9F9' },
      { file: 'Gemini_Generated_Image_okcoe1okcoe1okco.png', color: 'Sky Blue', colorHex: '#87CEEB' },
      { file: 'Gemini_Generated_Image_y5trdfy5trdfy5tr.png', color: 'Mocha',    colorHex: '#9E7B5A' },
    ],
  },

  // ── Women's Pants ──────────────────────────────────────────────────────────
  {
    name: 'Wide-Leg Linen Trouser',
    description:
      'Breezy high-rise wide-leg trousers woven from a linen-blend for a clean drape. Single pleat front, side pockets, and a button-fly closure.',
    priceInCents: 7200,
    compareAtPriceInCents: 9000,
    category: 'pant',
    gender: 'women',
    brand: 'FitForm',
    tags: ['linen', 'wide-leg', 'trouser', 'women', 'summer'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_otmfdqotmfdqotmf.png', color: 'Taupe', colorHex: '#9E8D79' },
      { file: 'Gemini_Generated_Image_s9hvfbs9hvfbs9hv.png', color: 'Ivory', colorHex: '#FAF7F0' },
      { file: 'Gemini_Generated_Image_ub142fub142fub14.png', color: 'Rust',  colorHex: '#B5541E' },
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
  console.log('\nSeedProducts4 — local mockdata4 upload');
  console.log('─'.repeat(55));
  console.log(`  Products : ${PRODUCTS.length}`);
  console.log(`  Images   : 36 PNG files from /mockdata4`);
  console.log('─'.repeat(55) + '\n');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not set in .env');

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected\n');

  let saved  = 0;
  let errors = 0;

  for (const [i, def] of PRODUCTS.entries()) {
    console.log(`\n[${i + 1}/${PRODUCTS.length}] ${def.name} — ${def.gender} ${def.category}`);
    console.log('─'.repeat(55));

    try {
      const allImages:   IImage[]   = [];
      const allVariants: IVariant[] = [];

      for (const { file, color, colorHex } of def.colorImages) {
        console.log(`\n  Color: ${color} (${colorHex})`);

        const localPath   = path.join(MOCKDATA_DIR, file);
        const slug        = def.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const colorSlug   = color.toLowerCase().replace(/\s+/g, '-');
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

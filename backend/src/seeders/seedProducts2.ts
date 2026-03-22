import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import Product, { IImage, IVariant } from '../models/Product';

// ─── Clients ──────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY! // service_role key required for storage uploads
);

const BUCKET = process.env.SUPABASE_BUCKET ?? 'products';

// ─── Color palette per category ───────────────────────────────────────────────
// Each entry: [colorName, hexCode, promptDescription]

type ColorDef = [string, string, string];

const COLOR_PALETTES: Record<string, ColorDef[]> = {
  hat: [
    ['Black', '#1A1A1A', 'matte black'],
    ['Beige', '#C9B99A', 'warm beige cream'],
    ['Navy',  '#1B2A4A', 'dark navy blue'],
  ],
  shirt: [
    ['White', '#F5F5F5', 'clean white'],
    ['Sage',  '#8FAF8A', 'sage green'],
    ['Slate', '#708090', 'slate grey blue'],
  ],
  pant: [
    ['Khaki',    '#C3B091', 'warm khaki tan'],
    ['Charcoal', '#36454F', 'dark charcoal grey'],
    ['Olive',    '#556B2F', 'army olive green'],
  ],
  shoe: [
    ['White', '#F5F5F5', 'clean white leather'],
    ['Black', '#1A1A1A', 'matte black'],
    ['Tan',   '#D2B48C', 'cognac tan leather'],
  ],
  accessory: [
    ['Black',  '#1A1A1A', 'classic black'],
    ['Brown',  '#8B4513', 'rich chocolate brown'],
    ['Silver', '#C0C0C0', 'brushed silver'],
  ],
};

// ─── Size sets per category ───────────────────────────────────────────────────

const SIZES: Record<string, string[]> = {
  hat:       ['S/M', 'L/XL'],
  shirt:     ['XS', 'S', 'M', 'L', 'XL'],
  pant:      ['28x30', '30x30', '32x30', '32x32', '34x32'],
  shoe:      ['38', '39', '40', '41', '42', '43', '44'],
  accessory: ['One Size'],
};

// ─── Product template per category x gender ───────────────────────────────────

interface ProductTemplate {
  name: string;
  description: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  brand: string;
  tags: string[];
  isFeatured?: boolean;
}

const TEMPLATES: Record<string, Record<string, ProductTemplate>> = {
  hat: {
    men: {
      name: 'Classic Structured Cap',
      description: 'A clean 6-panel structured cap with a pre-curved brim. Made from premium cotton twill.',
      priceInCents: 2900, compareAtPriceInCents: 3900, brand: 'CapCo',
      tags: ['cap', 'streetwear', 'men'], isFeatured: true,
    },
    women: {
      name: 'Soft Bucket Hat',
      description: 'Relaxed unstructured bucket hat in washed cotton. Perfect for casual and beach looks.',
      priceInCents: 2500, brand: 'CapCo',
      tags: ['bucket', 'casual', 'women'],
    },
    kids: {
      name: 'Kids Snapback Cap',
      description: 'Adjustable snapback cap designed for kids. Lightweight and breathable.',
      priceInCents: 1800, brand: 'CapCo',
      tags: ['kids', 'cap', 'snapback'],
    },
    unisex: {
      name: 'Minimalist Beanie',
      description: 'Fine ribbed knit beanie with a folded cuff. Versatile and warm.',
      priceInCents: 2200, brand: 'CapCo',
      tags: ['beanie', 'winter', 'unisex'],
    },
  },
  shirt: {
    men: {
      name: 'Oversized Cotton Tee',
      description: 'Relaxed oversized fit t-shirt in 100% organic cotton. Garment-dyed for a lived-in feel.',
      priceInCents: 3500, compareAtPriceInCents: 4500, brand: 'Basics Co.',
      tags: ['tshirt', 'cotton', 'men'], isFeatured: true,
    },
    women: {
      name: 'Cropped Ribbed Tank',
      description: 'Form-fitting cropped tank top in soft ribbed cotton. Pairs perfectly with high-waist bottoms.',
      priceInCents: 2800, brand: 'Basics Co.',
      tags: ['tank', 'cropped', 'women'],
    },
    kids: {
      name: 'Kids Graphic Tee',
      description: 'Soft cotton tee with a fun minimal graphic print. Easy care, machine washable.',
      priceInCents: 1900, brand: 'Basics Co.',
      tags: ['kids', 'tshirt', 'graphic'],
    },
    unisex: {
      name: 'Classic Crew Sweatshirt',
      description: 'Heavyweight fleece crew-neck sweatshirt. Brushed interior for maximum comfort.',
      priceInCents: 5900, compareAtPriceInCents: 7500, brand: 'Basics Co.',
      tags: ['sweatshirt', 'fleece', 'unisex'], isFeatured: true,
    },
  },
  pant: {
    men: {
      name: 'Slim Fit Chino',
      description: 'Versatile slim-fit chino in stretch cotton. Smart enough for the office, casual for weekends.',
      priceInCents: 5900, brand: 'FitForm',
      tags: ['chino', 'slim', 'men'], isFeatured: true,
    },
    women: {
      name: 'High-Waist Wide Leg Trouser',
      description: 'Elegant wide-leg trouser with a high-rise waist. Flowing fabric with side pockets.',
      priceInCents: 6500, compareAtPriceInCents: 8500, brand: 'FitForm',
      tags: ['trouser', 'wide-leg', 'women'],
    },
    kids: {
      name: 'Kids Jogger Pants',
      description: 'Comfortable pull-on joggers with elastic waist and ankle cuffs. Durable and easy to move in.',
      priceInCents: 2500, brand: 'FitForm',
      tags: ['kids', 'jogger', 'pants'],
    },
    unisex: {
      name: 'Relaxed Cargo Pant',
      description: 'Roomy cargo pants with side utility pockets and a relaxed straight fit.',
      priceInCents: 6900, brand: 'FitForm',
      tags: ['cargo', 'relaxed', 'unisex'],
    },
  },
  shoe: {
    men: {
      name: 'Low-Top Leather Sneaker',
      description: 'Clean minimal low-top sneaker in full-grain leather with a cupsole construction.',
      priceInCents: 11900, compareAtPriceInCents: 14900, brand: 'StrideX',
      tags: ['sneaker', 'leather', 'men'], isFeatured: true,
    },
    women: {
      name: 'Leather Ballet Flat',
      description: 'Classic ballet flat in soft nappa leather with a thin flexible sole. All-day comfort.',
      priceInCents: 9500, brand: 'StrideX',
      tags: ['flat', 'leather', 'women'],
    },
    kids: {
      name: 'Kids Velcro Sneaker',
      description: 'Easy velcro closure sneaker for active kids. Padded collar and cushioned footbed.',
      priceInCents: 4500, brand: 'StrideX',
      tags: ['kids', 'sneaker', 'velcro'],
    },
    unisex: {
      name: 'Minimalist Runner',
      description: 'Lightweight running sneaker with breathable mesh upper and responsive foam sole.',
      priceInCents: 8900, compareAtPriceInCents: 10900, brand: 'StrideX',
      tags: ['running', 'sneaker', 'unisex'],
    },
  },
  accessory: {
    men: {
      name: 'Slim Bifold Wallet',
      description: 'Slim bifold wallet in full-grain leather with 6 card slots and a cash compartment.',
      priceInCents: 3900, brand: 'Carry Co.',
      tags: ['wallet', 'leather', 'men'],
    },
    women: {
      name: 'Leather Mini Crossbody',
      description: 'Compact crossbody bag in pebbled leather with an adjustable strap and zip closure.',
      priceInCents: 7900, compareAtPriceInCents: 9900, brand: 'Carry Co.',
      tags: ['bag', 'crossbody', 'women'], isFeatured: true,
    },
    kids: {
      name: 'Kids Mini Backpack',
      description: 'Adorable mini backpack sized just right for kids. Padded straps and front zip pocket.',
      priceInCents: 2900, brand: 'Carry Co.',
      tags: ['kids', 'backpack', 'bag'],
    },
    unisex: {
      name: 'Canvas Tote Bag',
      description: 'Heavy-duty canvas tote with reinforced handles and an interior zip pocket.',
      priceInCents: 2500, brand: 'Carry Co.',
      tags: ['tote', 'canvas', 'unisex'],
    },
  },
};

// ─── Step 1: GENERATE IMAGES via Direct REST API ──────────────────────────────

async function generateImages(
  productName: string,
  category: string,
  gender: string,
  colorDescription: string,
  count: number = 2
): Promise<Buffer[]> {
  console.log(`    Generating ${count} image(s) for ${colorDescription} ${productName}`);

  const prompt = `
    Professional ecommerce product photo of ${colorDescription} ${productName},
    ${gender} ${category} fashion item, flat lay, perfectly centered,
    solid light grey background color #F5F5F5,
    soft diffused studio lighting, no model, no shadows, no props,
    clean minimal style, high resolution, sharp focus,
    commercial product photography
  `.trim();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      instances: [{ prompt }],
      parameters: {
        sampleCount: count,
        aspectRatio: '1:1',
      },
    });

    if (!response.data || !response.data.predictions) {
      throw new Error(`Imagen API Error: ${JSON.stringify(response.data)}`);
    }

    return response.data.predictions.map((pred: any) =>
      Buffer.from(pred.bytesBase64Encoded, 'base64')
    );
  } catch (err: any) {
    if (err.response) {
      console.error(`    API Response Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`    Request Error: ${err.message}`);
    }
    throw err;
  }
}

// ─── Step 2: UPLOAD TO SUPABASE STORAGE ──────────────────────────────────────

async function uploadToSupabase(
  imageBuffer: Buffer,
  filePath: string // e.g. "shoe/men/low-top-leather-sneaker-white-1.jpg"
): Promise<IImage> {
  console.log(`    Uploading -> ${filePath}`);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true, // safe to re-run seed without duplicates
    });

  if (error) throw new Error(`Supabase upload error: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    publicId: filePath, // path acts as publicId (like Cloudinary)
  };
}

// ─── Build variants for a single color + all sizes ───────────────────────────

function buildVariants(
  category: string,
  colorName: string,
  colorHex: string,
  brand: string,
  gender: string
): IVariant[] {
  const sizes = SIZES[category] ?? ['One Size'];
  const skuPrefix = [
    brand.replace(/\s/g, '').substring(0, 3),
    category.substring(0, 3),
    gender.substring(0, 1),
    colorName.substring(0, 3),
  ]
    .join('-')
    .toUpperCase();

  return sizes.map((size) => ({
    size,
    color: colorName,
    colorHex,
    stock: Math.floor(Math.random() * 20) + 5, // random 5-25 units
    reservedStock: 0,
    sku: `${skuPrefix}-${size.replace(/[^a-zA-Z0-9]/g, '')}`.toUpperCase(),
  }));
}

// ─── Step 3: SAVE PRODUCT TO MONGODB ─────────────────────────────────────────

async function saveProduct(
  template: ProductTemplate,
  category: string,
  gender: string,
  variants: IVariant[],
  images: IImage[]
): Promise<void> {
  const existing = await Product.findOne({
    name: template.name,
    brand: template.brand,
    gender,
  });

  if (existing) {
    console.log(`    Updating: ${template.name} (${gender})`);
    existing.images   = images;
    existing.variants = variants;
    await existing.save();
    return;
  }

  await Product.create({ ...template, category, gender, images, variants });
  console.log(`    Saved: ${template.name} (${gender})`);
}

// ─── Utility: sleep to respect Gemini free-tier rate limits ──────────────────
// Free tier = ~10 requests/minute for Imagen
// 3 colors x 1 generate call each = 3 calls per product
// 7s delay between calls keeps us safely under the limit

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\nProduct Seeder');
  console.log('─'.repeat(55));
  console.log('  Categories : hat, shirt, pant, shoe, accessory');
  console.log('  Genders    : men, women, kids, unisex');
  console.log('  Colors     : 3 per product (2 images each)');
  console.log('  Total imgs : 20 products x 3 colors x 2 = 120 images');
  console.log('─'.repeat(55) + '\n');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not set in .env');
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected\n');

  const categories = ['hat', 'shirt', 'pant', 'shoe', 'accessory'] as const;
  const genders    = ['men', 'women', 'kids', 'unisex'] as const;

  let count      = 0;
  let errorCount = 0;

  for (const category of categories) {
    for (const gender of genders) {
      count++;
      const template = TEMPLATES[category][gender];
      const colors   = COLOR_PALETTES[category];

      console.log(`\n[${count}/20] ${template.name} - ${gender} ${category}`);
      console.log('─'.repeat(55));

      try {
        const allImages:   IImage[]   = [];
        const allVariants: IVariant[] = [];

        for (const [colorName, colorHex, colorDesc] of colors) {
          console.log(`\n  Color: ${colorName} (${colorHex})`);

          // STEP 1: Generate
          const buffers = await generateImages(
            template.name,
            category,
            gender,
            colorDesc,
            2 // 2 images per color
          );

          // STEP 2: Upload each to Supabase
          const slug      = template.name.toLowerCase().replace(/\s+/g, '-');
          const colorSlug = colorName.toLowerCase();

          for (let i = 0; i < buffers.length; i++) {
            const filePath = `${category}/${gender}/${slug}-${colorSlug}-${i + 1}.jpg`;
            const image    = await uploadToSupabase(buffers[i], filePath);
            allImages.push(image);
          }

          // Build variants for this color
          allVariants.push(...buildVariants(category, colorName, colorHex, template.brand, gender));

          // Delay to stay within Gemini free-tier rate limits
          console.log('    Waiting 7s (rate limit)...');
          await sleep(7000);
        }

        // STEP 3: Save one product doc with all colors/variants/images
        await saveProduct(template, category, gender, allVariants, allImages);

      } catch (err: any) {
        errorCount++;
        console.error(`  Failed [${template.name}]: ${err.message}`);
      }
    }
  }

  await mongoose.disconnect();

  console.log('\n' + '='.repeat(55));
  console.log('Seed complete!');
  console.log(`   Saved  : ${count - errorCount}/20 products`);
  console.log(`   Errors : ${errorCount}`);
  console.log('='.repeat(55) + '\n');
}

seed().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});

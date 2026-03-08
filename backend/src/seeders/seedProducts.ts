import mongoose from 'mongoose';
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import supabase from '../config/supabase';
import Product from '../models/Product';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ISeedImage {
  url:      string;
  publicId: string;
}

interface ISeedVariant {
  size:          string;
  color:         string;
  colorHex:      string;
  stock:         number;
  reservedStock: number;
  sku:           string;
}

interface ISeedProduct {
  name:                    string;
  description:             string;
  priceInCents:            number;
  compareAtPriceInCents?:  number;
  category:                'hat' | 'shirt' | 'pant' | 'shoe' | 'accessory';
  gender:                  'men' | 'women' | 'kids' | 'unisex';
  brand:                   string;
  images:                  ISeedImage[];
  variants:                ISeedVariant[];
  tags:                    string[];
}

// ─── Fictional Brands ─────────────────────────────────────────────────────────
const BRANDS: Record<string, string[]> = {
  hat:       ['Apex Wear', 'Crest Athletic'],
  shirt:     ['Urban Thread', 'Apex Wear', 'Crest Athletic'],
  pant:      ['Stride Co.', 'Urban Thread'],
  shoe:      ['Stride Co.', 'Nova Goods'],
  accessory: ['Nova Goods', 'Apex Wear'],
};

// ─── Unsplash Search Queries ──────────────────────────────────────────────────
const UNSPLASH_QUERIES: Record<string, string> = {
  hat:       'baseball cap streetwear',
  shirt:     'tshirt apparel fashion product',
  pant:      'jogger pants athletic apparel',
  shoe:      'sneaker running shoe product',
  accessory: 'sport fitness accessory product',
};

// ─── Product Templates ────────────────────────────────────────────────────────
type Gender = 'men' | 'women' | 'kids' | 'unisex';

interface ProductTemplate {
  name:   string;
  tags:   string[];
  gender: Gender;
}

const PRODUCT_TEMPLATES: Record<string, ProductTemplate[]> = {
  hat: [
    { name: 'Classic Logo Cap',       tags: ['cap', 'casual', 'streetwear'],        gender: 'unisex' },
    { name: 'Performance Mesh Cap',   tags: ['cap', 'sport', 'breathable'],          gender: 'men'    },
    { name: 'Retro Snapback',         tags: ['snapback', 'retro', 'streetwear'],     gender: 'unisex' },
    { name: 'Trail Bucket Hat',       tags: ['bucket', 'outdoor', 'sun-protection'], gender: 'unisex' },
    { name: 'Minimalist Dad Hat',     tags: ['dad-hat', 'casual', 'minimalist'],     gender: 'unisex' },
    { name: 'Flex Fit Sport Cap',     tags: ['sport', 'performance', 'flex-fit'],    gender: 'men'    },
    { name: 'Street Strapback',       tags: ['streetwear', 'urban', 'strapback'],    gender: 'unisex' },
    { name: 'Vintage Wash Cap',       tags: ['vintage', 'washed', 'casual'],         gender: 'unisex' },
    { name: 'Youth Training Cap',     tags: ['kids', 'training', 'sport'],           gender: 'kids'   },
    { name: "Women's Chic Cap",       tags: ['women', 'fashion', 'casual'],          gender: 'women'  },
  ],
  shirt: [
    { name: 'Essential Crew Tee',         tags: ['tshirt', 'basic', 'casual'],            gender: 'unisex' },
    { name: 'Performance Dry-Fit Tee',    tags: ['sport', 'dry-fit', 'training'],         gender: 'men'    },
    { name: 'Oversized Street Tee',       tags: ['oversized', 'streetwear', 'urban'],     gender: 'unisex' },
    { name: 'Graphic Logo Tee',           tags: ['graphic', 'logo', 'casual'],            gender: 'unisex' },
    { name: "Women's Fitted Tee",         tags: ['women', 'fitted', 'casual'],            gender: 'women'  },
    { name: 'Long Sleeve Training Top',   tags: ['long-sleeve', 'training', 'sport'],     gender: 'men'    },
    { name: 'Kids Graphic Tee',           tags: ['kids', 'graphic', 'casual'],            gender: 'kids'   },
    { name: 'Henley Sport Shirt',         tags: ['henley', 'sport', 'casual'],            gender: 'men'    },
    { name: 'Racerback Tank Top',         tags: ['tank', 'women', 'training'],            gender: 'women'  },
    { name: 'Polo Sport Shirt',           tags: ['polo', 'sport', 'classic'],             gender: 'men'    },
  ],
  pant: [
    { name: 'Tapered Jogger',           tags: ['jogger', 'casual', 'streetwear'],         gender: 'unisex' },
    { name: 'Training Track Pant',      tags: ['track', 'training', 'sport'],             gender: 'men'    },
    { name: "Women's Yoga Legging",     tags: ['legging', 'yoga', 'women'],               gender: 'women'  },
    { name: 'Cargo Utility Pant',       tags: ['cargo', 'utility', 'outdoor'],            gender: 'men'    },
    { name: 'Slim Chino',               tags: ['chino', 'slim', 'casual'],                gender: 'men'    },
    { name: 'High-Rise Legging',        tags: ['legging', 'high-rise', 'women'],          gender: 'women'  },
    { name: 'Kids Active Jogger',       tags: ['kids', 'jogger', 'active'],               gender: 'kids'   },
    { name: 'Wind Shell Pant',          tags: ['shell', 'outdoor', 'wind-resistant'],     gender: 'unisex' },
    { name: 'Fleece Sweatpant',         tags: ['fleece', 'sweatpant', 'casual'],          gender: 'unisex' },
    { name: 'Compression Tight',        tags: ['compression', 'training', 'performance'], gender: 'men'    },
  ],
  shoe: [
    { name: 'Everyday Runner',       tags: ['running', 'daily-trainer', 'cushion'], gender: 'unisex' },
    { name: 'Court Classic Low',     tags: ['court', 'classic', 'casual'],          gender: 'unisex' },
    { name: 'Trail Blazer GTX',      tags: ['trail', 'outdoor', 'waterproof'],      gender: 'men'    },
    { name: 'Speed Pro Racer',       tags: ['racing', 'performance', 'speed'],      gender: 'men'    },
    { name: "Women's Cloud Walker",  tags: ['women', 'comfort', 'casual'],          gender: 'women'  },
    { name: 'Street Skate Low',      tags: ['skate', 'streetwear', 'casual'],       gender: 'unisex' },
    { name: 'Kids Flash Runner',     tags: ['kids', 'running', 'velcro'],           gender: 'kids'   },
    { name: 'Hiker Mid Boot',        tags: ['hiking', 'boot', 'outdoor'],           gender: 'unisex' },
    { name: 'Cross Trainer XT',      tags: ['cross-training', 'gym', 'versatile'],  gender: 'men'    },
    { name: 'Slide Recovery Sandal', tags: ['slide', 'recovery', 'casual'],         gender: 'unisex' },
  ],
  accessory: [
    { name: 'Sport Training Socks 3-Pack', tags: ['socks', 'training', 'comfort'],    gender: 'unisex' },
    { name: 'Performance Wristband',       tags: ['wristband', 'sweat', 'training'],  gender: 'unisex' },
    { name: 'Athletic Duffle Bag',         tags: ['bag', 'gym', 'duffle'],            gender: 'unisex' },
    { name: 'Sport Sunglasses',            tags: ['sunglasses', 'sport', 'uv'],       gender: 'unisex' },
    { name: 'Lightweight Running Belt',    tags: ['belt', 'running', 'storage'],      gender: 'unisex' },
    { name: 'Fitness Tracker Band',        tags: ['tracker', 'fitness', 'wearable'],  gender: 'unisex' },
    { name: 'Compression Arm Sleeve',      tags: ['sleeve', 'compression', 'sport'],  gender: 'unisex' },
    { name: 'Sport Snapback Beanie',       tags: ['beanie', 'winter', 'casual'],      gender: 'unisex' },
    { name: 'Team Logo Backpack',          tags: ['backpack', 'team', 'storage'],     gender: 'unisex' },
    { name: 'Headband Pro',               tags: ['headband', 'training', 'sweat'],    gender: 'unisex' },
  ],
};

// ─── Variants Config ──────────────────────────────────────────────────────────
const COLORS: Record<string, Array<{ name: string; hex: string }>> = {
  hat: [
    { name: 'Black',        hex: '#000000' },
    { name: 'Navy',         hex: '#1B2A4A' },
    { name: 'White',        hex: '#FFFFFF' },
    { name: 'Red',          hex: '#CC2200' },
    { name: 'Forest Green', hex: '#2D5A27' },
    { name: 'Stone Grey',   hex: '#8B8680' },
  ],
  shirt: [
    { name: 'Black',        hex: '#000000' },
    { name: 'White',        hex: '#FFFFFF' },
    { name: 'Navy',         hex: '#1B2A4A' },
    { name: 'Heather Grey', hex: '#9E9E9E' },
    { name: 'Royal Blue',   hex: '#2B52BE' },
    { name: 'Forest Green', hex: '#2D5A27' },
  ],
  pant: [
    { name: 'Black',        hex: '#000000' },
    { name: 'Charcoal',     hex: '#36454F' },
    { name: 'Navy',         hex: '#1B2A4A' },
    { name: 'Olive',        hex: '#6B6B35' },
    { name: 'Heather Grey', hex: '#9E9E9E' },
  ],
  shoe: [
    { name: 'Black/White', hex: '#1A1A1A' },
    { name: 'White/Grey',  hex: '#F5F5F5' },
    { name: 'Navy/Red',    hex: '#1B2A4A' },
    { name: 'All Black',   hex: '#000000' },
    { name: 'White/Navy',  hex: '#FAFAFA' },
  ],
  accessory: [
    { name: 'Black',    hex: '#000000' },
    { name: 'White',    hex: '#FFFFFF' },
    { name: 'Navy',     hex: '#1B2A4A' },
    { name: 'Red',      hex: '#CC2200' },
    { name: 'Charcoal', hex: '#36454F' },
  ],
};

const SIZES: Record<string, string[]> = {
  hat:       ['S/M', 'L/XL', 'One Size'],
  shirt:     ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  pant:      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoe:      ['6', '7', '8', '9', '10', '11', '12', '13'],
  accessory: ['One Size', 'S/M', 'L/XL'],
};

// ─── Descriptions ─────────────────────────────────────────────────────────────
const DESCRIPTIONS: Record<string, string> = {
  hat:       "Crafted for all-day comfort and style. Features a structured crown, adjustable closure, and a moisture-wicking sweatband. Built for training sessions and casual streetwear alike.",
  shirt:     "Built with high-performance fabric that wicks moisture and allows full range of motion. Versatile enough for the gym, the streets, or anything in between.",
  pant:      "Engineered for movement and comfort with an elastic waistband, tapered fit, and functional side pockets. Your go-to for training days and rest days.",
  shoe:      "Designed for peak performance with responsive cushioning and a durable outsole. Lightweight construction keeps you moving fast without sacrificing support.",
  accessory: "The perfect complement to your kit. Crafted with performance-grade materials and thoughtful design details built for the active lifestyle.",
};

// ─── Price Ranges (in cents) ──────────────────────────────────────────────────
const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  hat:       { min: 2499, max: 5999  },
  shirt:     { min: 1999, max: 5999  },
  pant:      { min: 3999, max: 9999  },
  shoe:      { min: 7999, max: 19999 },
  accessory: { min: 999,  max: 7999  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

function priceToXX99(n: number): number {
  return Math.floor(n / 100) * 100 + 99;
}

function generatePrice(category: string): { price: number; compareAt?: number } {
  const { min, max } = PRICE_RANGES[category];
  const price      = priceToXX99(randomBetween(min, max));
  const hasCompare = Math.random() > 0.45;
  const compareAt  = hasCompare ? priceToXX99(price + randomBetween(500, 3000)) : undefined;
  return { price, compareAt };
}

function generateVariants(category: string): ISeedVariant[] {
  const colorPool    = COLORS[category];
  const sizes        = SIZES[category];
  const pickedColors = pickRandom(colorPool, randomBetween(2, Math.min(4, colorPool.length)));
  const variants: ISeedVariant[] = [];

  for (const { name: color, hex: colorHex } of pickedColors) {
    const pickedSizes = pickRandom(sizes, randomBetween(Math.ceil(sizes.length / 2), sizes.length));
    for (const size of pickedSizes) {
      const skuColor = color.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
      const skuSize  = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
      variants.push({
        size,
        color,
        colorHex,
        stock:         randomBetween(0, 60),
        reservedStock: 0,
        sku: `${category.toUpperCase()}-${skuColor}-${skuSize}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      });
    }
  }
  return variants;
}

// ─── Unsplash ─────────────────────────────────────────────────────────────────
async function fetchUnsplashUrls(query: string, count = 10): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY is not set in .env');

  const { data } = await axios.get('https://api.unsplash.com/search/photos', {
    params: { query, per_page: count, orientation: 'squarish', client_id: accessKey },
  });

  if (!data.results?.length) throw new Error(`No Unsplash results for: "${query}"`);
  return data.results.map((r: { urls: { regular: string } }) => r.urls.regular as string);
}

// ─── Retry ────────────────────────────────────────────────────────────────────
async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.warn(`      Attempt ${i + 1} failed (${msg}), retrying in ${delayMs}ms...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error('Retry exhausted');
}

// ─── Supabase Storage Upload ───────────────────────────────────────────────────
const BUCKET = 'Products';

async function uploadToSupabase(imageUrl: string, productName: string, index: number): Promise<ISeedImage> {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');

  const filePath = `ecom-products/${slug}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Fetch image bytes from Unsplash
  const response = await axios.get<Buffer>(imageUrl, { responseType: 'arraybuffer' });
  const contentType = (response.headers['content-type'] as string) || 'image/jpeg';
  const buffer = Buffer.from(response.data);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType, upsert: false });

  if (error) throw new Error(`Supabase upload error: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return { url: publicUrl, publicId: filePath };
}

// ─── Core Generator ───────────────────────────────────────────────────────────
async function generateProducts(): Promise<ISeedProduct[]> {
  const products: ISeedProduct[] = [];
  const categories = ['hat', 'shirt', 'pant', 'shoe', 'accessory'] as const;

  for (const category of categories) {
    console.log(`\nCategory: ${category.toUpperCase()}`);

    let imagePool: string[] = [];
    try {
      console.log(`    Fetching Unsplash images for "${UNSPLASH_QUERIES[category]}"...`);
      imagePool = await fetchUnsplashUrls(UNSPLASH_QUERIES[category], 10);
      console.log(`    Got ${imagePool.length} image URLs`);
    } catch (err) {
      console.error(`    Unsplash failed — skipping category. Error: ${err}`);
      continue;
    }

    const templates = PRODUCT_TEMPLATES[category];
    const brandList = BRANDS[category];

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const brand    = brandList[i % brandList.length];
      const fullName = `${brand} ${template.name}`;
      const { price, compareAt } = generatePrice(category);

      const pickedUrls = [
        imagePool[i % imagePool.length],
        imagePool[(i + 1) % imagePool.length],
      ];

      const images: ISeedImage[] = [];
      for (let j = 0; j < pickedUrls.length; j++) {
        try {
          const img = await retry(() => uploadToSupabase(pickedUrls[j], fullName, j));
          images.push(img);
        } catch (err) {
          const msg = err instanceof Error ? err.message : JSON.stringify(err);
          console.error(`      Upload failed for image ${j + 1}: ${msg}`);
        }
      }

      if (images.length === 0) {
        console.warn(`    Skipping "${fullName}" — all uploads failed`);
        continue;
      }

      products.push({
        name:         fullName,
        description:  DESCRIPTIONS[category],
        priceInCents: price,
        ...(compareAt && { compareAtPriceInCents: compareAt }),
        category,
        gender:   template.gender,
        brand,
        images,
        variants: generateVariants(category),
        tags: [
          ...template.tags,
          category,
          brand.toLowerCase().replace(/[\s.]/g, '-'),
          template.gender,
        ],
      });

      console.log(`    [${i + 1}/10] ${fullName} — $${(price / 100).toFixed(2)}`);
    }
  }

  return products;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not set in .env');

  console.log('Starting product seed\n');
  console.log('   Supabase URL:    ', process.env.SUPERBASE_URL);
  console.log('   Unsplash key:    ', process.env.UNSPLASH_ACCESS_KEY ? 'set' : 'missing');

  const products = await generateProducts();

  if (products.length === 0) {
    console.error('\nNo products generated — aborting DB insert');
    process.exit(1);
  }

  console.log(`\nConnecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  console.log('   Connected');

  try {
    console.log('   Clearing existing products...');
    await Product.deleteMany({});

    console.log(`   Inserting ${products.length} products...`);
    await Product.insertMany(products);

    console.log(`\nDone! Seeded ${products.length} products`);
  } catch (err) {
    console.error('\nDB insert failed:', err);
    throw err;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

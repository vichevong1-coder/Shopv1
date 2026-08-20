import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

const MOCKDATA_DIR = path.resolve(__dirname, './mock-images');
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
const APP_URL = process.env.CLIENT_URL ? 'http://localhost:5000' : 'http://localhost:5000';

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
  category: string;
  gender: string;
  brand: string;
  tags: string[];
  isFeatured?: boolean;
  sizes: string[];
  colorImages: ColorImage[];
}

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
      { file: 'Gemini_Generated_Image_12ogj512ogj512og.png', color: 'Burgundy',  colorHex: '#800020' },
      { file: 'Gemini_Generated_Image_dfpmxqdfpmxqdfpm.png', color: 'Grey Marl', colorHex: '#8A8D8F' },
      { file: 'Gemini_Generated_Image_pssvjopssvjopssv.png', color: 'Oatmeal',   colorHex: '#D8C8B8' },
    ],
  },
  {
    name: 'Camp Collar Linen Shirt',
    description:
      'Breezy short-sleeve shirt crafted from 100% garment-washed French linen. Features a relaxed camp collar, straight hem, and side vents.',
    priceInCents: 5900,
    compareAtPriceInCents: 7200,
    category: 'shirt',
    gender: 'men',
    brand: 'Basics Co.',
    tags: ['linen', 'summer', 'camp-collar', 'men', 'short-sleeve'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_8m8bih8m8bih8m8b.png', color: 'Terracotta', colorHex: '#C85A32' },
      { file: 'Gemini_Generated_Image_gw45qpgw45qpgw45.png', color: 'Natural',    colorHex: '#EAE6DF' },
      { file: 'Gemini_Generated_Image_y5trdfy5trdfy5tr.png', color: 'Teal',       colorHex: '#006D77' },
    ],
  },
  {
    name: 'Oxford Dress Shirt',
    description:
      'Classic tailored button-down in durable pinpoint Oxford cotton. Features a button-down collar, chest pocket, and curved shirttail hem.',
    priceInCents: 6500,
    category: 'shirt',
    gender: 'men',
    brand: 'Basics Co.',
    tags: ['oxford', 'formal', 'button-down', 'men', 'office'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_5deyjm5deyjm5dey.png', color: 'White',      colorHex: '#FFFFFF' },
      { file: 'Gemini_Generated_Image_otmfdqotmfdqotmf.png', color: 'Blush Pink', colorHex: '#E8C5C8' },
      { file: 'Gemini_Generated_Image_xsa4zlxsa4zlxsa4.png', color: 'Slate Grey', colorHex: '#5C6B73' },
    ],
  },
  {
    name: 'Piqué Polo Shirt',
    description:
      'Classic piqué cotton polo with a two-button placket and ribbed collar and cuffs. A wardrobe staple that goes from casual Fridays to weekend outings.',
    priceInCents: 4500,
    category: 'shirt',
    gender: 'men',
    brand: 'FitForm',
    tags: ['polo', 'casual', 'pique', 'men'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_5lc5cq5lc5cq5lc5.png', color: 'Black',        colorHex: '#1C1C1E' },
      { file: 'Gemini_Generated_Image_e0o85le0o85le0o8.png', color: 'Forest Green', colorHex: '#1E3F20' },
      { file: 'Gemini_Generated_Image_xpxttyxpxttyxpxt.png', color: 'Mustard',      colorHex: '#D4A017' },
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
    brand: 'Basics Co.',
    tags: ['jacket', 'outerwear', 'harrington', 'men'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_63cwlp63cwlp63cw.png', color: 'Black',       colorHex: '#1C1C1E' },
      { file: 'Gemini_Generated_Image_98dqcv98dqcv98dq.png', color: 'Khaki Olive', colorHex: '#6B705C' },
      { file: 'Gemini_Generated_Image_zfl9pmzfl9pmzfl9.png', color: 'Navy',        colorHex: '#1B2A4A' },
    ],
  },

  // ── Women's Tops & Shirts ──────────────────────────────────────────────────
  {
    name: 'Ribbed Turtleneck Sweater',
    description:
      'Fitted fine-rib knit turtleneck in a featherweight modal-cotton blend. The essential base layer for cold-weather dressing.',
    priceInCents: 6800,
    category: 'shirt',
    gender: 'women',
    brand: 'Aura',
    tags: ['turtleneck', 'sweater', 'ribbed', 'women', 'knit'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_40hqjt40hqjt40hq.png', color: 'Camel',        colorHex: '#C49A6C' },
      { file: 'Gemini_Generated_Image_fzhlybfzhlybfzhl.png', color: 'Ivory',        colorHex: '#FFFFF0' },
      { file: 'Gemini_Generated_Image_ut5m1sut5m1sut5m.png', color: 'Forest Green', colorHex: '#1E3F20' },
    ],
  },
  {
    name: 'Wrap Blouse',
    description:
      'Elegant true wrap blouse in fluid matte crepe with a flattering V-neckline, self-tie sash at the waist, and billowy long sleeves with button cuffs.',
    priceInCents: 6200,
    compareAtPriceInCents: 7800,
    category: 'shirt',
    gender: 'women',
    brand: 'Aura',
    tags: ['blouse', 'wrap', 'workwear', 'women', 'elegant'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_7h8til7h8til7h8t.png', color: 'Dusty Rose', colorHex: '#DCAE96' },
      { file: 'Gemini_Generated_Image_j7v6krj7v6krj7v6.png', color: 'White',      colorHex: '#FFFFFF' },
      { file: 'Gemini_Generated_Image_r4ec17r4ec17r4ec.png', color: 'Slate Grey', colorHex: '#5C6B73' },
    ],
  },
  {
    name: 'Boxy Crop Tee',
    description:
      'Heavyweight 100% organic cotton tee with a modern boxy cut and subtle cropped hem. Dropped shoulders and ribbed crew neck.',
    priceInCents: 3500,
    category: 'shirt',
    gender: 'women',
    brand: 'Basics Co.',
    tags: ['crop', 'tee', 'cotton', 'women', 'casual'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_h8qwloh8qwloh8qw.png', color: 'Sky Blue', colorHex: '#87CEEB' },
      { file: 'Gemini_Generated_Image_q8aecpq8aecpq8ae.png', color: 'Mocha',    colorHex: '#6F4E37' },
      { file: 'Gemini_Generated_Image_vfh63qvfh63qvfh6.png', color: 'White',    colorHex: '#FFFFFF' },
    ],
  },
  {
    name: 'Layered Peplum Top',
    description:
      'Sculptural peplum top crafted from structured poplin cotton with delicate puff shoulders, a hidden back zip, and tiered ruffle hem.',
    priceInCents: 5800,
    compareAtPriceInCents: 7400,
    category: 'shirt',
    gender: 'women',
    brand: 'Aura',
    tags: ['peplum', 'poplin', 'women', 'blouse'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_iimlzbiimlzbiiml.png', color: 'Emerald',    colorHex: '#046307' },
      { file: 'Gemini_Generated_Image_qe3ssaqe3ssaqe3s.png', color: 'Blush Pink', colorHex: '#E8C5C8' },
      { file: 'Gemini_Generated_Image_v6oxwv6oxwv6oxwv.png', color: 'Lavender',   colorHex: '#967BB6' },
    ],
  },

  // ── Men's Pants ────────────────────────────────────────────────────────────
  {
    name: 'Slim-Fit Chino Pant',
    description:
      'Modern slim chino cut from washed stretch-cotton twill. Mid-rise with a clean flat front, slant pockets, and a tapered leg opening.',
    priceInCents: 6900,
    compareAtPriceInCents: 8500,
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
    name: 'Tailored Flat-Front Trouser',
    description:
      'Smart dress trouser in a tropical-weight wool blend with natural stretch. Features belt loops, pressed creases, and blind-stitched hem.',
    priceInCents: 9500,
    category: 'pant',
    gender: 'men',
    brand: 'Basics Co.',
    tags: ['trouser', 'tailored', 'dress-pants', 'men', 'wool'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_jgrq88jgrq88jgrq.png', color: 'Steel Blue', colorHex: '#4682B4' },
      { file: 'Gemini_Generated_Image_mtp2xvmtp2xvmtp2.png', color: 'Olive',      colorHex: '#556B2F' },
      { file: 'Gemini_Generated_Image_ub142fub142fub14.png', color: 'Navy',       colorHex: '#1B2A4A' },
    ],
  },
  {
    name: 'Slim Casual Chino',
    description:
      'Versatile everyday chino made with soft garment-dyed stretch cotton. Straight fit through the thigh with a slight taper below the knee.',
    priceInCents: 6200,
    compareAtPriceInCents: 7800,
    category: 'pant',
    gender: 'men',
    brand: 'FitForm',
    tags: ['chino', 'casual', 'men', 'pants'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_g6gnog6gnog6gnog.png', color: 'Stone Grey', colorHex: '#928E85' },
      { file: 'Gemini_Generated_Image_hkso5phkso5phkso.png', color: 'Dark Brown', colorHex: '#4A2E18' },
      { file: 'Gemini_Generated_Image_xk77mxxk77mxxk77.png', color: 'Khaki',      colorHex: '#C3A882' },
    ],
  },

  // ── Women's Pants ──────────────────────────────────────────────────────────
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
    name: 'Wide-Leg Linen Trouser',
    description:
      'Relaxed, effortless wide-leg pant in breathable pre-washed linen. Elasticated back waistband with a flat front and deep side pockets.',
    priceInCents: 7500,
    category: 'pant',
    gender: 'women',
    brand: 'Aura',
    tags: ['linen', 'wide-leg', 'summer', 'women', 'trousers'],
    isFeatured: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_6rba4i6rba4i6rba.png', color: 'Rust',  colorHex: '#B7410E' },
      { file: 'Gemini_Generated_Image_okcoe1okcoe1okco.png', color: 'Ivory', colorHex: '#FFFFF0' },
      { file: 'Gemini_Generated_Image_s9hvfbs9hvfbs9hv.png', color: 'Taupe', colorHex: '#8B8589' },
    ],
  },

  // ── Kids ───────────────────────────────────────────────────────────────────
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
      'Soft 100% cotton crewneck tee featuring an original mountain-trail graphic print on the chest. Tagless neckline for itch-free comfort.',
    priceInCents: 2200,
    category: 'shirt',
    gender: 'kids',
    brand: 'Basics Co.',
    tags: ['kids', 'tee', 'graphic', 'cotton'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorImages: [
      { file: 'Gemini_Generated_Image_luhxuyluhxuyluhx.png', color: 'Steel Blue', colorHex: '#607D8B' },
      { file: 'Gemini_Generated_Image_nypfjqnypfjqnypf.png', color: 'White',      colorHex: '#F5F5F5' },
      { file: 'Gemini_Generated_Image_qifqunqifqunqifq.png', color: 'Sage',       colorHex: '#8FAE97' },
    ],
  },
];

function buildVariants(def: ProductDef, color: string, colorHex: string) {
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

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'vichevong1@gmail.com';
  const name = process.env.ADMIN_NAME || 'Viche Vong';
  const rawPassword = process.env.ADMIN_PASSWORD || 'cctpoNAg5dcNovdDkWmx';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`👤 Admin user already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 12);
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log(`✅ Admin created: ${email}`);
}

async function main() {
  console.log('=====================================================');
  console.log('🌱 POSTGRESQL DATABASE SEEDER (PRISMA)');
  console.log('=====================================================');

  await seedAdmin();

  console.log(`\n📦 Seeding ${PRODUCTS.length} products with 54 local images...`);

  let count = 0;
  for (const def of PRODUCTS) {
    const slug = def.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: { name: def.name, gender: def.gender },
    });

    if (existing) {
      console.log(`  ℹ️ Skipping existing product: ${def.name} (${def.gender})`);
      continue;
    }

    // Build all variants
    const allVariants: any[] = [];
    const allImages: any[] = [];

    let sortOrder = 0;
    for (const { file, color, colorHex } of def.colorImages) {
      const colorSlug = color.toLowerCase().replace(/\s+/g, '-');
      const storagePath = `${def.category}/${def.gender}/${slug}-${colorSlug}.png`;
      const imageUrl = `${APP_URL}/uploads/${storagePath}`;

      // Ensure upload directory exists and copy mock image if needed
      const sourcePath = path.join(MOCKDATA_DIR, file);
      const destPath = path.join(UPLOADS_DIR, storagePath);
      if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(sourcePath, destPath);
      }

      allImages.push({
        url: imageUrl,
        publicId: storagePath,
        sortOrder: sortOrder++,
      });

      const colorVariants = buildVariants(def, color, colorHex);
      allVariants.push(...colorVariants);
    }

    await prisma.product.create({
      data: {
        name: def.name,
        description: def.description,
        priceInCents: def.priceInCents,
        compareAtPriceInCents: def.compareAtPriceInCents,
        category: def.category,
        gender: def.gender,
        brand: def.brand,
        tags: def.tags,
        isFeatured: def.isFeatured ?? false,
        isActive: true,
        isDeleted: false,
        images: {
          create: allImages,
        },
        variants: {
          create: allVariants,
        },
      },
    });

    count++;
    console.log(`  ✅ [${count}/${PRODUCTS.length}] Seeded: ${def.name} (${def.gender}) - ${allImages.length} images, ${allVariants.length} variants`);
  }

  console.log('\n=====================================================');
  console.log('🎉 PostgreSQL Seeding Completed Successfully!');
  console.log('=====================================================');
}

main()
  .catch((err) => {
    console.error('💥 Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

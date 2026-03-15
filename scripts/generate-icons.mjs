import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Create assets directory
const assetsDir = join(projectRoot, 'assets');
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

// Read SVG file
const svgBuffer = readFileSync(join(projectRoot, 'public', 'app-icon.svg'));

// Generate icons
async function generateIcons() {
  console.log('Generating app icons...');

  // Main icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'icon-only.png'));
  console.log('  - icon-only.png (1024x1024)');

  // Icon foreground for adaptive icons
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'icon-foreground.png'));
  console.log('  - icon-foreground.png (1024x1024)');

  // Icon background (solid teal)
  const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#0D9488"/>
  </svg>`;
  await sharp(Buffer.from(bgSvg))
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'icon-background.png'));
  console.log('  - icon-background.png (1024x1024)');

  // Splash screen (2732x2732 - largest needed for iOS)
  const splashSvg = `<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#14B8A6"/>
        <stop offset="100%" style="stop-color:#0D9488"/>
      </linearGradient>
    </defs>
    <rect width="2732" height="2732" fill="url(#bgGradient)"/>
    <g transform="translate(1366, 1200)">
      <path d="M0 50 C-30 -10 -100 -20 -100 50 C-100 120 0 170 0 170 C0 170 100 120 100 50 C100 -20 30 -10 0 50"
            fill="white" fill-opacity="0.95"
            transform="translate(0, -20) scale(3)"/>
      <path d="M-350 130 L-150 130 L-90 0 L-30 240 L30 60 L90 130 L350 130"
            fill="none"
            stroke="#0D9488"
            stroke-width="28"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    </g>
    <text x="1366" y="1650" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="90" font-weight="600" fill="white">MedCare HealthAI</text>
  </svg>`;
  await sharp(Buffer.from(splashSvg))
    .resize(2732, 2732)
    .png()
    .toFile(join(assetsDir, 'splash.png'));
  console.log('  - splash.png (2732x2732)');

  // Dark splash (same but with darker background)
  const splashDarkSvg = `<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0F766E"/>
        <stop offset="100%" style="stop-color:#0D5D56"/>
      </linearGradient>
    </defs>
    <rect width="2732" height="2732" fill="url(#bgGradient)"/>
    <g transform="translate(1366, 1200)">
      <path d="M0 50 C-30 -10 -100 -20 -100 50 C-100 120 0 170 0 170 C0 170 100 120 100 50 C100 -20 30 -10 0 50"
            fill="white" fill-opacity="0.95"
            transform="translate(0, -20) scale(3)"/>
      <path d="M-350 130 L-150 130 L-90 0 L-30 240 L30 60 L90 130 L350 130"
            fill="none"
            stroke="#0D5D56"
            stroke-width="28"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    </g>
    <text x="1366" y="1650" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="90" font-weight="600" fill="white">MedCare HealthAI</text>
  </svg>`;
  await sharp(Buffer.from(splashDarkSvg))
    .resize(2732, 2732)
    .png()
    .toFile(join(assetsDir, 'splash-dark.png'));
  console.log('  - splash-dark.png (2732x2732)');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);

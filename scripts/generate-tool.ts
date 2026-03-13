#!/usr/bin/env ts-node
/**
 * SwapTure Tool Generator Script
 * Usage: npm run generate-tool -- --name <tool-name> --description "<description>" --domain <subdomain>
 */

import * as fs from 'fs';
import * as path from 'path';

interface ToolOptions {
  name: string;
  description: string;
  domain: string;
}

function parseArgs(): ToolOptions {
  const args = process.argv.slice(2);
  const opts: Partial<ToolOptions> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) opts.name = args[++i];
    if (args[i] === '--description' && args[i + 1]) opts.description = args[++i];
    if (args[i] === '--domain' && args[i + 1]) opts.domain = args[++i];
  }

  if (!opts.name || !opts.description || !opts.domain) {
    console.error('Usage: npm run generate-tool -- --name <tool-name> --description "<description>" --domain <subdomain>');
    console.error('Example: npm run generate-tool -- --name color-picker --description "Pick and convert colors" --domain color');
    process.exit(1);
  }

  return opts as ToolOptions;
}

function kebabToTitle(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateIndexHtml(opts: ToolOptions): string {
  const title = kebabToTitle(opts.name);
  const url = `https://${opts.domain}.swapture.com`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - SwapTure</title>
  <meta name="description" content="${opts.description}" />
  <meta name="keywords" content="${title.toLowerCase()}, tool, calculator, swapture" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title} - SwapTure" />
  <meta property="og:description" content="${opts.description}" />
  <meta property="og:url" content="${url}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} - SwapTure" />
  <meta name="twitter:description" content="${opts.description}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "${title}",
    "description": "${opts.description}",
    "url": "${url}",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the ${title}?",
        "acceptedAnswer": { "@type": "Answer", "text": "${opts.description}" }
      },
      {
        "@type": "Question",
        "name": "Is the ${title} free to use?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes, the ${title} is completely free to use on SwapTure." }
      },
      {
        "@type": "Question",
        "name": "Does the ${title} store my data?",
        "acceptedAnswer": { "@type": "Answer", "text": "No, all calculations are done in your browser. We do not store any of your data." }
      }
    ]
  }
  </script>
  <!-- Google Analytics -->
  <!-- Replace G-XXXXXXXXXX with your Measurement ID -->
  <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script> -->

  <!-- Microsoft Clarity -->
  <!-- Replace XXXXXXXXXX with your Clarity Project ID -->

  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen font-sans">

  <!-- Header -->
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="https://swapture.com" class="flex items-center gap-2 text-indigo-600 font-bold text-xl">
        SwapTure
      </a>
      <nav class="hidden md:flex items-center gap-6 text-sm text-gray-600">
        <a href="https://password.swapture.com" class="hover:text-indigo-600">Password</a>
        <a href="https://bmi.swapture.com" class="hover:text-indigo-600">BMI</a>
        <a href="https://convert.swapture.com" class="hover:text-indigo-600">Converter</a>
      </nav>
    </div>
  </header>

  <!-- Top Ad Banner -->
  <div class="max-w-6xl mx-auto px-4">
    <div class="w-full h-16 bg-gray-100 border border-dashed border-gray-300 rounded-lg my-4 flex items-center justify-center">
      <span class="text-gray-400 text-xs">Advertisement</span>
    </div>
  </div>

  <main class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-3">${title}</h1>
    <p class="text-gray-600 mb-8">${opts.description}</p>

    <!-- Tool Interface -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <!-- TODO: Add tool-specific inputs here -->
      <p class="text-gray-400 text-sm">Tool interface goes here</p>
    </div>

    <!-- Result -->
    <div id="result" class="hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Results</h2>
      <div id="result-content"></div>
    </div>

    <!-- Inline Ad Banner -->
    <div class="w-full h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg my-6 flex items-center justify-center">
      <span class="text-gray-400 text-xs">Advertisement</span>
    </div>

    <!-- SEO Content -->
    <section class="prose prose-gray max-w-none mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">About ${title}</h2>
      <p class="text-gray-600">${opts.description} This free online tool is available 24/7 and works directly in your browser — no installation required.</p>
    </section>

    <!-- FAQ -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
      <div class="space-y-3">
        <details class="bg-white rounded-xl border border-gray-100 p-4">
          <summary class="font-medium text-gray-800 cursor-pointer">What is the ${title}?</summary>
          <p class="text-gray-600 mt-2 text-sm">${opts.description}</p>
        </details>
        <details class="bg-white rounded-xl border border-gray-100 p-4">
          <summary class="font-medium text-gray-800 cursor-pointer">Is it free to use?</summary>
          <p class="text-gray-600 mt-2 text-sm">Yes, the ${title} is completely free to use on SwapTure. No registration required.</p>
        </details>
        <details class="bg-white rounded-xl border border-gray-100 p-4">
          <summary class="font-medium text-gray-800 cursor-pointer">Is my data private?</summary>
          <p class="text-gray-600 mt-2 text-sm">Yes. All calculations happen in your browser. We never store or transmit your data.</p>
        </details>
      </div>
    </section>
  </main>

  <!-- Footer Ad Banner -->
  <div class="max-w-6xl mx-auto px-4">
    <div class="w-full h-16 bg-gray-100 border border-dashed border-gray-300 rounded-lg my-4 flex items-center justify-center">
      <span class="text-gray-400 text-xs">Advertisement</span>
    </div>
  </div>

  <!-- Footer -->
  <footer class="bg-gray-800 text-gray-300 mt-8">
    <div class="max-w-6xl mx-auto px-4 py-8 text-center text-sm">
      <p>&copy; ${new Date().getFullYear()} SwapTure MicroTools. All rights reserved.</p>
      <div class="mt-2 flex justify-center gap-4">
        <a href="https://swapture.com/privacy" class="hover:text-white">Privacy Policy</a>
        <a href="https://swapture.com/terms" class="hover:text-white">Terms of Use</a>
      </div>
    </div>
  </footer>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;
}

function generateMainTs(opts: ToolOptions): string {
  const title = kebabToTitle(opts.name);

  return `/**
 * ${title} - SwapTure
 * ${opts.description}
 */

// TODO: Implement tool logic

function init(): void {
  console.log('${title} initialized');
  // Add your tool logic here
}

document.addEventListener('DOMContentLoaded', init);
`;
}

function generateViteConfig(): string {
  return `import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
`;
}

function generateTsConfig(): string {
  return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`;
}

function generatePackageJson(opts: ToolOptions): string {
  return JSON.stringify(
    {
      name: `@swapture/${opts.name}`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
      },
      devDependencies: {
        vite: '^5.0.0',
        typescript: '^5.0.0',
      },
    },
    null,
    2
  );
}

function updateSitemap(opts: ToolOptions): void {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.warn('sitemap.xml not found, skipping update');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const newEntry = `  <url>
    <loc>https://${opts.domain}.swapture.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

  let content = fs.readFileSync(sitemapPath, 'utf-8');

  if (content.includes(`${opts.domain}.swapture.com`)) {
    console.log(`⚠ ${opts.domain}.swapture.com already in sitemap, skipping`);
    return;
  }

  content = content.replace('</urlset>', `${newEntry}\n</urlset>`);
  fs.writeFileSync(sitemapPath, content);
  console.log(`✓ Updated sitemap.xml with ${opts.domain}.swapture.com`);
}

function main(): void {
  const opts = parseArgs();
  const appsDir = path.join(__dirname, '..', 'apps');
  const toolDir = path.join(appsDir, opts.name);
  const srcDir = path.join(toolDir, 'src');

  if (fs.existsSync(toolDir)) {
    console.error(`Error: Tool directory already exists: ${toolDir}`);
    process.exit(1);
  }

  fs.mkdirSync(srcDir, { recursive: true });

  const files: Record<string, string> = {
    'index.html': generateIndexHtml(opts),
    'src/main.ts': generateMainTs(opts),
    'vite.config.ts': generateViteConfig(),
    'tsconfig.json': generateTsConfig(),
    'package.json': generatePackageJson(opts),
  };

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(toolDir, filePath);
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Created ${filePath}`);
  }

  updateSitemap(opts);

  console.log(`\n✅ Tool "${opts.name}" created successfully!`);
  console.log(`📁 Location: ${toolDir}`);
  console.log(`🌐 Domain: https://${opts.domain}.swapture.com`);
  console.log(`\nNext steps:`);
  console.log(`  cd apps/${opts.name}`);
  console.log(`  npm install`);
  console.log(`  npm run dev`);
}

main();

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const esbuild = require('esbuild');

const DIST_DIR = 'dist';

async function build() {
    console.log('Starting build process...');

    // 1. Clean up the previous build
    if (fs.existsSync(DIST_DIR)) {
        console.log(`Removing old ${DIST_DIR} directory...`);
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_DIR, { recursive: true });

    // 2. Bundle and minify JS and CSS with esbuild
    console.log('Bundling and minifying assets...');
    await esbuild.build({
        entryPoints: ['js/main.js', 'css/main.css'],
        bundle: true,
        minify: true,
        sourcemap: true,
        outdir: `${DIST_DIR}/assets`,
        entryNames: '[name].min',
        drop: ['console'],
    }).catch(() => process.exit(1));

    // 3. Copy static assets
    console.log('Copying static assets...');
    execSync(`npx cpx "js/lib/**/*" "${DIST_DIR}/js/lib"`, { stdio: 'inherit' });
    execSync(`npx cpx "images/**/*" "${DIST_DIR}/images"`, { stdio: 'inherit' });
    execSync(`npx cpx "data/**/*" "${DIST_DIR}/data"`, { stdio: 'inherit' });

    // 4. Copy and modify index.html to point to the new asset paths
    console.log('Processing index.html...');
    let html = fs.readFileSync('index.html', 'utf-8');
    html = html
        .replace('css/main.css', 'assets/main.min.css')
        .replace('js/main.js', 'assets/main.min.js');

    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);

    console.log('\nBuild complete!');
    console.log(`Your optimized site is ready in the "${DIST_DIR}" directory.`);
}

build();
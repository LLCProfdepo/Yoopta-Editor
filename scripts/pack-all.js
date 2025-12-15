#!/usr/bin/env node

/**
 * pack-all.js
 *
 * Packs all non-private packages into .tgz bundles and moves them to dist-packages/
 *
 * Usage:
 *   node scripts/pack-all.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to run commands with output
function run(command, options = {}) {
  console.log(`\n> ${command}`);
  return execSync(command, {
    encoding: 'utf8',
    stdio: 'inherit',
    ...options
  });
}

// Helper to run commands and capture output
function runCapture(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

// Main script
function main() {
  console.log('📦 Packing all non-private packages...\n');

  const repoRoot = path.resolve(__dirname, '..');
  const distPackagesDir = path.join(repoRoot, 'dist-packages');

  // Create dist-packages directory if it doesn't exist
  if (!fs.existsSync(distPackagesDir)) {
    console.log(`Creating ${distPackagesDir}...`);
    fs.mkdirSync(distPackagesDir, { recursive: true });
  }

  // Get list of all non-private packages from lerna
  console.log('Getting list of packages from lerna...');
  const packagesJson = runCapture('npx lerna ls --json');
  const packages = JSON.parse(packagesJson);

  // Filter out private packages (lerna ls already excludes them by default)
  const nonPrivatePackages = packages.filter(pkg => !pkg.private);

  console.log(`\nFound ${nonPrivatePackages.length} non-private packages to pack:\n`);
  nonPrivatePackages.forEach(pkg => {
    console.log(`  - ${pkg.name}@${pkg.version}`);
  });

  // Pack each package
  console.log('\n' + '='.repeat(60));
  console.log('Starting pack process...');
  console.log('='.repeat(60));

  nonPrivatePackages.forEach((pkg, index) => {
    console.log(`\n[${index + 1}/${nonPrivatePackages.length}] Packing ${pkg.name}...`);

    const packageDir = pkg.location;

    // Run npm pack in the package directory
    const originalCwd = process.cwd();
    process.chdir(packageDir);

    try {
      // Run npm pack and capture the output (which contains the tarball filename)
      const packOutput = runCapture('npm pack');
      const tarballName = packOutput.split('\n').pop(); // Last line is the tarball name

      if (!tarballName || !tarballName.endsWith('.tgz')) {
        throw new Error(`Failed to get tarball name from npm pack output: ${packOutput}`);
      }

      const tarballPath = path.join(packageDir, tarballName);
      const destPath = path.join(distPackagesDir, tarballName);

      // Check if tarball was created
      if (!fs.existsSync(tarballPath)) {
        throw new Error(`Tarball not found at ${tarballPath}`);
      }

      // Remove existing tarball in dist-packages if it exists
      if (fs.existsSync(destPath)) {
        console.log(`  Removing existing ${tarballName}...`);
        fs.unlinkSync(destPath);
      }

      // Move tarball to dist-packages
      fs.renameSync(tarballPath, destPath);
      console.log(`  ✓ Moved ${tarballName} -> dist-packages/`);

    } catch (error) {
      console.error(`  ✗ Failed to pack ${pkg.name}:`, error.message);
      process.chdir(originalCwd);
      process.exit(1);
    }

    process.chdir(originalCwd);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✓ All packages packed successfully!');
  console.log('='.repeat(60));
  console.log(`\nTarballs location: ${distPackagesDir}`);

  // List all tarballs
  const tarballs = fs.readdirSync(distPackagesDir).filter(f => f.endsWith('.tgz'));
  console.log(`\nGenerated ${tarballs.length} tarball(s):`);
  tarballs.forEach(tarball => {
    console.log(`  - ${tarball}`);
  });
}

// Run the script
try {
  main();
} catch (error) {
  console.error('\n❌ Pack failed:', error.message);
  process.exit(1);
}

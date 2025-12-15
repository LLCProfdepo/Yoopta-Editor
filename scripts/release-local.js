#!/usr/bin/env node

/**
 * release-local.js
 *
 * Orchestrates a complete local release workflow:
 * 1. Bump versions using lerna
 * 2. Build all packages
 * 3. Pack all non-private packages
 * 4. Commit dist bundles
 * 5. Push everything to GitHub
 *
 * Usage:
 *   node scripts/release-local.js <new-version>
 *
 * Example:
 *   node scripts/release-local.js 4.10.0-llc.1
 */

const { execSync } = require('child_process');
const path = require('path');

// Helper to run commands with output
function run(command, options = {}) {
  console.log(`\n> ${command}`);
  execSync(command, {
    encoding: 'utf8',
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    ...options
  });
}

// Helper to run commands and capture output
function runCapture(command, options = {}) {
  return execSync(command, {
    encoding: 'utf8',
    cwd: path.resolve(__dirname, '..'),
    ...options
  }).trim();
}

// Main script
function main() {
  // Step 1: Validate arguments
  const newVersion = process.argv[2];

  if (!newVersion) {
    console.error('\n❌ Error: Version argument is required\n');
    console.log('Usage:');
    console.log('  node scripts/release-local.js <new-version>\n');
    console.log('Example:');
    console.log('  node scripts/release-local.js 4.10.0-llc.1\n');
    process.exit(1);
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           Yoopta Editor - Local Release Workflow          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTarget Version: ${newVersion}\n`);

  // Step 2: Version bump with lerna
  console.log('\n' + '='.repeat(60));
  console.log('STEP 1/5: Bumping package versions with lerna');
  console.log('='.repeat(60));

  try {
    run(`npx lerna version ${newVersion} --no-push --yes --no-private`);
    console.log('\n✓ Version bump complete');
  } catch (error) {
    console.error('\n❌ Failed to bump versions');
    process.exit(1);
  }

  // Step 3: Build all packages
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2/5: Building all packages');
  console.log('='.repeat(60));

  try {
    run('yarn build');
    console.log('\n✓ Build complete');
  } catch (error) {
    console.error('\n❌ Failed to build packages');
    process.exit(1);
  }

  // Step 4: Pack all packages
  console.log('\n' + '='.repeat(60));
  console.log('STEP 3/5: Packing all non-private packages');
  console.log('='.repeat(60));

  try {
    run('node scripts/pack-all.js');
    console.log('\n✓ Packing complete');
  } catch (error) {
    console.error('\n❌ Failed to pack packages');
    process.exit(1);
  }

  // Step 5: Commit dist bundles
  console.log('\n' + '='.repeat(60));
  console.log('STEP 4/5: Committing dist bundles');
  console.log('='.repeat(60));

  try {
    // Add dist-packages to git
    run('git add dist-packages');

    // Check if there are changes to commit
    let hasChanges = false;
    try {
      const status = runCapture('git status --porcelain dist-packages');
      hasChanges = status.length > 0;
    } catch (error) {
      // If git status fails, assume no changes
      hasChanges = false;
    }

    if (hasChanges) {
      const commitMessage = `chore: add dist bundles for ${newVersion}`;
      run(`git commit -m "${commitMessage}"`);
      console.log('\n✓ Dist bundles committed');
    } else {
      console.log('\n⚠️  No changes to commit (dist bundles may already be up-to-date)');
    }
  } catch (error) {
    console.error('\n❌ Failed to commit dist bundles');
    process.exit(1);
  }

  // Step 6: Push everything
  console.log('\n' + '='.repeat(60));
  console.log('STEP 5/5: Pushing to GitHub');
  console.log('='.repeat(60));

  try {
    run('git push origin HEAD --follow-tags');
    console.log('\n✓ Push complete');
  } catch (error) {
    console.error('\n❌ Failed to push to GitHub');
    console.error('\nNote: You may need to push manually with:');
    console.error('  git push origin HEAD --follow-tags');
    process.exit(1);
  }

  // Success!
  console.log('\n' + '═'.repeat(60));
  console.log('✓ Local release workflow completed successfully!');
  console.log('═'.repeat(60));
  console.log(`\nVersion ${newVersion} has been:`);
  console.log('  ✓ Bumped in all non-private packages');
  console.log('  ✓ Built');
  console.log('  ✓ Packed into .tgz bundles');
  console.log('  ✓ Committed to git');
  console.log('  ✓ Pushed to GitHub');
  console.log('\nYour .tgz bundles are available in: dist-packages/');
  console.log('\nYou can now install them in other projects via raw GitHub URLs:');
  console.log(`  "@yoopta/editor": "https://raw.githubusercontent.com/LLCProfdepo/Yoopta-Editor/master/dist-packages/yoopta-editor-${newVersion}.tgz"`);
  console.log('');
}

// Run the script
try {
  main();
} catch (error) {
  console.error('\n❌ Release failed:', error.message);
  process.exit(1);
}

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const functionsDir = join(process.cwd(), 'supabase', 'functions');

async function deployAllFunctions() {
  try {
    const entries = await readdir(functionsDir);
    const functions = [];

    for (const entry of entries) {
      const entryPath = join(functionsDir, entry);
      const stats = await stat(entryPath);
      
      // Only include directories, exclude _shared and files like deno.json
      if (stats.isDirectory() && entry !== '_shared') {
        functions.push(entry);
      }
    }

    if (functions.length === 0) {
      console.log('No functions found to deploy.');
      return;
    }

    console.log(`Found ${functions.length} functions to deploy:\n`);
    functions.forEach(func => console.log(`  - ${func}`));
    console.log('\nStarting deployment...\n');

    for (const func of functions) {
      console.log(`\n[${new Date().toLocaleTimeString()}] Deploying ${func}...`);
      try {
        execSync(`supabase functions deploy ${func}`, { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log(`✓ Successfully deployed ${func}`);
      } catch (error) {
        console.error(`✗ Failed to deploy ${func}`);
        console.error(error.message);
        process.exit(1);
      }
    }

    console.log(`\n✓ All ${functions.length} functions deployed successfully!`);
  } catch (error) {
    console.error('Error deploying functions:', error.message);
    process.exit(1);
  }
}

deployAllFunctions();


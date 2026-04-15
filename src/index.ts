#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import * as path from 'path';

const program = new Command();

import { parseFragment, mergeFragmentWithOptions } from './parser.js';
import { ChangelogManager } from './manager.js';

program
  .name('chlog-push')
  .description('Insert changelog fragments into CHANGELOG.md')
  .version('1.0.0')
  .argument('[fragment]', 'Changelog fragment text')
  .option('-v, --version-num <v>', 'Version number')
  .option('-s, --section <s>', 'Section name')
  .option('-k, --kind <k>', 'Kind name')
  .option('-b, --body <text>', 'Insertion fragment body')
  .option('--new-version', 'Error if version already exists')
  .option('--new-section', 'Error if section already exists in version')
  .option('--new-kind', 'Error if kind already exists in section')
  .option('--existing-version', 'Error if version does not exist')
  .option('--existing-section', 'Error if section does not exist in version')
  .option('--existing-kind', 'Error if kind does not exist in section')
  .option('-i, --input <path>', 'Read fragment from file')
  .option('--file <path>', 'Path to CHANGELOG.md', './CHANGELOG.md')
  .option('--dry-run', 'Dry run without changing files')
  .option('--quiet', 'Minimize output')
  .action(async (fragmentArg, options) => {
    try {
      let fragmentText = fragmentArg || '';

      if (options.input) {
        fragmentText = fs.readFileSync(options.input, 'utf8');
      }

      const parsedFragment = parseFragment(fragmentText);
      const finalFragment = mergeFragmentWithOptions(parsedFragment, options);

      if (!finalFragment.body) {
        throw new Error('BODY_REQUIRED: Body is required either in fragment or via options');
      }

      if (!options.quiet) {
        console.log(`Pushing to ${options.file}...`);
        console.log(`Version: ${finalFragment.version ?? 'Unreleased'}`);
        console.log(`Section: ${finalFragment.section ?? '(Default)'}`);
        console.log(`Kind: ${finalFragment.kind ?? '(None)'}`);
        console.log(`Body: ${finalFragment.body}`);
      }

      const manager = new ChangelogManager(options.file);
      const newContent = await manager.push(finalFragment, options);

      if (options.dryRun) {
        if (!options.quiet) {
          console.log('\n--- DRY RUN: No changes saved ---');
          console.log(newContent);
        }
      } else {
        manager.save(newContent);
        if (!options.quiet) {
          console.log('\nSuccessfully updated CHANGELOG.md');
        }
      }
      
    } catch (error: any) {
      if (!options.quiet) {
        console.error(`\nError: ${error.message}`);
      }
      process.exit(1);
    }
  });

program.parse();

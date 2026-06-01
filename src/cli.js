#!/usr/bin/env node

import { main } from './index.js';
import { parseArgs } from './lib/arg_parser.js';
import FWGU_VERSION from './lib/version.js';

const HELP_TEXT = `
fwgu - Forked winget update on steroids

USAGE:
  fwgu [options]

OPTIONS:
  --help, -h              Show this help message
  --version, -v           Show version
  --ignore-file <path>    Use custom ignore file instead of ~/.fwguignore

DESCRIPTION:
  Interactive CLI for managing Windows package updates via winget.
  Provides a menu-driven interface to select and update packages.
  
  Fwgu can load package IDs to ignore from ~/.fwguignore if this file exists.
  The ignore file supports comments (lines starting with #).

EXAMPLES:
  fwgu                              Run the interactive updater
  fwgu --help                       Display help
  fwgu --version                    Show version
  fwgu --ignore-file myignore.txt   Use custom ignore file
`;

async function cli() {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  if (parsed.error) {
    console.error(`Error: ${parsed.error}`);
    console.error('Use --help for usage information');
    process.exit(2);
  }

  if (parsed.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (parsed.version) {
    console.log(`fwgu v${FWGU_VERSION}`);
    process.exit(0);
  }

  const options = {};
  if (parsed.ignoreFilePath) {
    options.ignoreFilePath = parsed.ignoreFilePath;
  }

  const exitCode = await main(options);
  process.exit(exitCode);
}

cli().catch((err) => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});

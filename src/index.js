import { homedir } from 'node:os';
import { join } from 'node:path';
import { getUpdateCandidates, runUpdates } from './lib/winget.js';
import { interactiveSelect } from './lib/menu.js';
import FWGU_VERSION from './lib/version.js';
import { askPermissionToContinue } from './lib/console_commons.js';
import { assertWindows, assertWingetAvailable } from './lib/os.js';
import { getWindowsUserLang, isLocaleSupported } from './lib/fwgu_i18n.js';
import { loadIgnoreList } from './lib/ignore.js';

const DEFAULT_LOCALE = 'en';

const IGNORE_FILE_NAME_DEFAULT = '.fwguignore';
/**
 * Main application logic
 * @param {Object} options - Configuration options
 * @param {NodeJS.WriteStream} options.stdout - Output stream
 * @param {NodeJS.WriteStream} options.stderr - Error stream
 * @param {NodeJS.ReadStream} options.stdin - Input stream
 * @param {Object} options.logger - Logger object with log and error methods
 * @param {string|null} options.ignoreFilePath - Path to custom ignore file
 * @returns {Promise<number>} Exit code
 */
export async function main({ stdout = process.stdout, stderr = process.stderr, stdin = process.stdin, logger = console, ignoreFilePath = null } = {}) {
  assertWindows();
  assertWingetAvailable();

  try {
    // Set cursor to underline
    stdout.write('\x1b[4 q');

    // Restore default cursor on exit
    const restoreCursor = () => {
      stdout.write('\x1b[6 q');
    };
    process.on('exit', restoreCursor);
    process.on('SIGINT', () => {
      restoreCursor();
      return 0;
    });

    logger.log(`This is FWGU v${FWGU_VERSION}`);

    let windowsUserLang = getWindowsUserLang();
    if (windowsUserLang === null) {
      logger.log(`Could not determine Windows user language. Falling back to ${DEFAULT_LOCALE}.`);
      windowsUserLang = DEFAULT_LOCALE;
    }
    logger.log(`Detected Windows User language: ${windowsUserLang}`);
    logger.log('');

    if (!isLocaleSupported(windowsUserLang)) {
      logger.log(`Locale '${windowsUserLang}' is not supported. Falling back to ${DEFAULT_LOCALE}.`);
      windowsUserLang = DEFAULT_LOCALE;
    }

    let ignoreList = [];
    const filePath = ignoreFilePath || join(homedir(), IGNORE_FILE_NAME_DEFAULT);
    try {
      ignoreList = loadIgnoreList(filePath);
      logger.log(`Using ignore file: ${filePath}`);
    } catch (error) {
      const isDefaultPath = ignoreFilePath === null;
      const isFileNotFound = error.code === 'ENOENT';
      const isFatalError = !isDefaultPath || !isFileNotFound;

      if (isFatalError) {
        logger.log(`Error: Failed to load ignore file ${filePath}: ${error.message}`);
        return 1;
      }
    }

    logger.log('Retrieving list of updatable packages..');
    const candidates = getUpdateCandidates(windowsUserLang, ignoreList);

    if (candidates.length === 0) {
      logger.log('No packages available to update.');
      return 0;
    }

    const selectedIds = await interactiveSelect(candidates, { stdout, stdin });

    if (selectedIds === null) {
      logger.log('Caught signal to exit.');
      return 0;
    } else if (selectedIds.length === 0) {
      logger.log('Nothing left to update. Exiting.');
      return 0;
    }
    logger.log('Ok, running updates..');
    await runUpdates(
      selectedIds,
      async (id, err) => {
        logger.error(`Failed to update package ${id}: ${err.message}`);
        return askPermissionToContinue({ input: stdin, output: stdout });
      },
      logger
    );
  } catch (err) {
    stderr.write(`Error: ${err.message}\n`);
    return 1;
  }

  return 0;
}

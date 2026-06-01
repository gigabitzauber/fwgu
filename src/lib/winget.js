import { getColName, WINGET_COLS_TO_I18N_KEY_MAP } from './fwgu_i18n.js';
import { spawnSyncProcess } from './system.js';

/**
 * Parses winget output to extract package update candidates
 * @param {string} output - Raw winget output string
 * @param {string} locale - The locale to use for parsing winget's localized column headers
 * @param {string[]} ignoreList - Package IDs to exclude from the results
 * @returns {Array<{name: string, id: string, currentVersion: string, availableVersion: string}>} Array of update candidates
 */
export function parseWingetOutput(output, locale, ignoreList = []) {
  const NAME_COL_NAME = getColName(WINGET_COLS_TO_I18N_KEY_MAP.NAME, locale);
  const ID_COL_NAME = getColName(WINGET_COLS_TO_I18N_KEY_MAP.ID, locale);
  const VERSION_COL_NAME = getColName(WINGET_COLS_TO_I18N_KEY_MAP.VERSION, locale);
  const AVAILABLE_COL_NAME = getColName(WINGET_COLS_TO_I18N_KEY_MAP.AVAILABLE, locale);
  const SOURCE_COL_NAME = getColName(WINGET_COLS_TO_I18N_KEY_MAP.SOURCE, locale);
  const tableHeaderRegex = new RegExp(`.*${NAME_COL_NAME}\\s+${ID_COL_NAME}\\s+${VERSION_COL_NAME}\\s+${AVAILABLE_COL_NAME}\\s+${SOURCE_COL_NAME}.*`);

  // Remove last 2 lines (summary info + newline)
  const lines = output
    .split('\n')
    .slice(0, -2)
    .map((line) => line.trim());

  const outputLineCount = lines.length;
  const tableHeaderIndex = lines.findIndex((line) => line.match(tableHeaderRegex) !== null);
  if (tableHeaderIndex === -1) {
    return [];
  }
  const headerRow = lines[tableHeaderIndex].trim();
  const headerRowPosOffset = headerRow.indexOf(NAME_COL_NAME);
  const idColPos = headerRow.indexOf(ID_COL_NAME) - headerRowPosOffset;
  const versionColPos = headerRow.indexOf(VERSION_COL_NAME) - headerRowPosOffset;
  const availableColPos = headerRow.indexOf(AVAILABLE_COL_NAME) - headerRowPosOffset;
  const sourcePos = headerRow.indexOf(SOURCE_COL_NAME) - headerRowPosOffset;
  if (headerRowPosOffset === -1 || idColPos === -1 || versionColPos === -1 || availableColPos === -1 || sourcePos === -1) {
    throw new Error('Could not find expected column headers in winget output');
  }

  const idColLength = versionColPos - idColPos;
  const versionColLength = availableColPos - versionColPos;
  const availableColLength = sourcePos - availableColPos;

  const packageListStartLineIndex = tableHeaderIndex + 2; // Skip header and separator line
  const candidates = [];

  for (let i = packageListStartLineIndex; i < outputLineCount; i++) {
    const line = lines[i];
    if (!line || line.trim().length === 0) {
      continue;
    }
    const name = line.substring(0, idColPos).trim();
    const id = line.substring(idColPos, idColPos + idColLength).trim();
    const currentVersion = line.substring(versionColPos, versionColPos + versionColLength).trim();
    const availableVersion = line.substring(availableColPos, availableColPos + availableColLength).trim();
    if (id) {
      candidates.push({ name, id, currentVersion, availableVersion });
    }
  }

  return candidates.filter((candidate) => !ignoreList.includes(candidate.id));
}

/**
 * Retrieves available package updates from winget
 * @param {string} locale - The locale to use for parsing winget's localized column headers
 * @param {string[]} ignoreList - Package IDs to exclude from the results
 * @returns {Array<{name: string, id: string, currentVersion: string, availableVersion: string}>} Array of update candidates
 * @throws {Error} If winget command fails or returns empty output
 */
export function getUpdateCandidates(locale, ignoreList = []) {
  const wgOutput = spawnSyncProcess('winget', ['upgrade', '--include-unknown']);
  if (!wgOutput || wgOutput.trim().length === 0) {
    throw new Error('winget update command failed or returned empty output');
  }

  return parseWingetOutput(wgOutput, locale, ignoreList);
}

/**
 * Runs winget update commands for the provided package IDs
 * @param {string[]} ids - Package IDs to update
 * @param {Function} errorHandler - Optional error handler function (id, err) => Promise<boolean>. Returns true to continue, false to abort.
 * @param {Object} logger - Logger object with log and error methods
 * @returns {Promise<void>}
 */
export async function runUpdates(ids, errorHandler = async (_id, _err) => false, logger = console) {
  for (const id of ids) {
    logger.log(`Updating package: ${id}`);
    // prettier-ignore
    try {
      spawnSyncProcess('winget', [
        'upgrade',
        '-i',
        '--id',
        id,
        '--accept-source-agreements',
        '--accept-package-agreements'
      ], true);
      logger.log(`Package ${id} updated successfully.`);
    } catch (err) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await errorHandler(id, err))) {
        throw err;
      }
    }
  }
}

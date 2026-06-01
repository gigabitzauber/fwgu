import { describe, it, expect, vi, beforeEach } from 'vitest';

// prettier-ignore
const expectedIds = [
  'Package.One',
  'Package.Two',
  'Package.Three'
];
const fileContent = expectedIds.join('\n');

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(() => fileContent),
}));

import { loadIgnoreList } from '../src/lib/ignore.js';
import { readFileSync } from 'node:fs';

describe('loadIgnoreList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns_package_ids_from_fwguignore_file_in_home_directory', () => {
    const ignoreFilePath = 'C:\\Users\\testuser\\.fwguignore';

    const result = loadIgnoreList(ignoreFilePath);

    expect(readFileSync).toHaveBeenCalledWith(ignoreFilePath, 'utf8');
    expect(result).toEqual(expectedIds);
  });

  it('filters_out_comment_lines_starting_with_hash', () => {
    const ignoreFilePath = 'C:\\Users\\testuser\\.fwguignore';
    const contentWithComments = 'Package.One\n# This is a comment\nPackage.Two\n# Another comment\nPackage.Three';

    readFileSync.mockReturnValueOnce(contentWithComments);

    const result = loadIgnoreList(ignoreFilePath);

    // prettier-ignore
    expect(result).toEqual([
      'Package.One',
      'Package.Two',
      'Package.Three'
    ]);
    expect(result).not.toContain('# This is a comment');
    expect(result).not.toContain('# Another comment');
  });

  it('trims_whitespace_from_package_ids', () => {
    const ignoreFilePath = 'C:\\Users\\testuser\\.fwguignore';
    const contentWithWhitespace = '  Package.One  \n\tPackage.Two\t\n   Package.Three   ';

    readFileSync.mockReturnValueOnce(contentWithWhitespace);

    const result = loadIgnoreList(ignoreFilePath);

    // prettier-ignore
    expect(result).toEqual([
      'Package.One',
      'Package.Two',
      'Package.Three'
    ]);
  });

  it('filters_out_empty_lines', () => {
    const ignoreFilePath = 'C:\\Users\\testuser\\.fwguignore';
    const contentWithEmptyLines = 'Package.A\n\n  \n\t\nPackage.B\n';

    readFileSync.mockReturnValueOnce(contentWithEmptyLines);

    const result = loadIgnoreList(ignoreFilePath);

    expect(result).toEqual(['Package.A', 'Package.B']);
    expect(result).not.toContain('');
  });
});

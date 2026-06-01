import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fwgu_i18n from '../src/lib/fwgu_i18n.js';

describe('fwgu_i18n', () => {
  describe('isLocaleSupported', () => {
    it('returns_true_for_supported_locale_en', () => {
      const result = fwgu_i18n.isLocaleSupported('en');

      expect(result).toBe(true);
    });

    it('returns_true_for_supported_locale_de', () => {
      const result = fwgu_i18n.isLocaleSupported('de');

      expect(result).toBe(true);
    });

    it('returns_false_for_unsupported_locale', () => {
      const result = fwgu_i18n.isLocaleSupported('fr');

      expect(result).toBe(false);
    });

    it('returns_false_for_invalid_locale', () => {
      const result = fwgu_i18n.isLocaleSupported('xx-XX');

      expect(result).toBe(false);
    });
  });

  describe('getColName', () => {
    it('returns_english_name_for_name_col_with_en_locale', () => {
      const result = fwgu_i18n.getColName('name_col', 'en');

      expect(result).toBe('Name');
    });

    it('returns_german_name_for_available_col_with_de_locale', () => {
      const result = fwgu_i18n.getColName('available_col', 'de');

      expect(result).toBe('Verfügbar');
    });

    it('returns_english_for_id_col_with_en_locale', () => {
      const result = fwgu_i18n.getColName('id_col', 'en');

      expect(result).toBe('ID');
    });

    it('returns_german_for_version_col_with_de_locale', () => {
      const result = fwgu_i18n.getColName('version_col', 'de');

      expect(result).toBe('Version');
    });

    it('returns_german_for_source_col_with_de_locale', () => {
      const result = fwgu_i18n.getColName('source_col', 'de');

      expect(result).toBe('Quelle');
    });

    it('throws_error_when_locale_not_found', () => {
      expect(() => fwgu_i18n.getColName('name_col', 'fr')).toThrow('Missing localization for locale: fr');
    });

    it('throws_error_for_missing_key', () => {
      expect(() => fwgu_i18n.getColName('invalid_key', 'en')).toThrow('Missing localization for key: invalid_key');
    });

    it('throws_error_for_unsupported_locale_on_valid_key', () => {
      expect(() => fwgu_i18n.getColName('version_col', 'es')).toThrow('Missing localization for locale: es');
    });
  });

  describe('getWindowsUserLang', () => {
    let mockSpawnSyncProcess;

    beforeEach(async () => {
      const systemModule = await import('../src/lib/system.js');
      mockSpawnSyncProcess = vi.spyOn(systemModule, 'spawnSyncProcess');
    });

    afterEach(() => {
      mockSpawnSyncProcess.mockRestore();
    });

    it('returns_language_code_from_windows_user_lang_tag', () => {
      mockSpawnSyncProcess.mockReturnValue('de-DE');

      const result = fwgu_i18n.getWindowsUserLang();

      expect(result).toBe('de');
      expect(mockSpawnSyncProcess).toHaveBeenCalledWith('powershell', ['-c', '(Get-WinUserLanguageList)[0].LanguageTag']);
    });

    it('returns_null_when_powershell_command_fails', () => {
      mockSpawnSyncProcess.mockImplementation(() => {
        throw new Error('PowerShell not available');
      });

      const result = fwgu_i18n.getWindowsUserLang();

      expect(result).toBe(null);
    });

    it('extracts_language_from_complex_locale_tag', () => {
      mockSpawnSyncProcess.mockReturnValue('en-US');

      const result = fwgu_i18n.getWindowsUserLang();

      expect(result).toBe('en');
    });
  });
});

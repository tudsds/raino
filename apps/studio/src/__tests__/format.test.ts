import { describe, it, expect } from 'vitest';
import { formatCurrency, formatBytes, formatDate } from '../lib/format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('formats USD currency', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
    });

    it('formats zero', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('formats decimals', () => {
      expect(formatCurrency(12.5, 'USD')).toBe('$12.50');
    });
  });

  describe('formatBytes', () => {
    it('formats zero bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes', () => {
      expect(formatBytes(512)).toBe('512 B');
    });

    it('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('formats gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDate', () => {
    it('formats a Date object', () => {
      const d = new Date('2024-06-15T12:00:00Z');
      const result = formatDate(d);
      expect(result).toContain('Jun');
      expect(result).toContain('2024');
    });

    it('formats an ISO date string', () => {
      const result = formatDate('2024-12-25T12:00:00Z');
      expect(result).toContain('Dec');
      expect(result).toContain('2024');
    });
  });
});

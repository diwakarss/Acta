import { formatDate, formatTime, formatDateTime } from '@/src/utils/formatting';

describe('Date Formatting Utilities', () => {
  // Set up a test date (January 15, 2023 at 14:30:45)
  const testDate = new Date(2023, 0, 15, 14, 30, 45);

  beforeEach(() => {
    // Mock the toLocaleDateString and toLocaleTimeString methods to ensure consistent results
    const originalDateToLocaleDateString = Date.prototype.toLocaleDateString;
    const originalDateToLocaleTimeString = Date.prototype.toLocaleTimeString;

    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function(this: Date, _locale, options) {
      // Simple implementation for testing
      const month = options?.month === 'short' ? 'Jan' : '01';
      const day = this.getDate();
      const year = this.getFullYear();
      return `${month} ${day}, ${year}`;
    });

    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockImplementation(function(this: Date) {
      // Simple implementation for testing
      const hours = this.getHours() % 12 || 12;
      const minutes = String(this.getMinutes()).padStart(2, '0');
      const ampm = this.getHours() >= 12 ? 'PM' : 'AM';
      return `${hours}:${minutes} ${ampm}`;
    });

    return () => {
      // Restore the original methods after each test
      Date.prototype.toLocaleDateString = originalDateToLocaleDateString;
      Date.prototype.toLocaleTimeString = originalDateToLocaleTimeString;
    };
  });

  describe('formatDate', () => {
    it('formats a date correctly', () => {
      const result = formatDate(testDate);
      expect(result).toBe('Jan 15, 2023');
    });

    it('handles the current date', () => {
      const now = new Date();
      const result = formatDate(now);
      // We know the implementation will call toLocaleDateString with these options
      expect(result).toContain(now.getFullYear().toString());
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const result = formatTime(testDate);
      expect(result).toBe('2:30 PM');
    });

    it('handles midnight correctly', () => {
      const midnight = new Date(2023, 0, 15, 0, 0, 0);
      const result = formatTime(midnight);
      expect(result).toBe('12:00 AM');
    });

    it('handles noon correctly', () => {
      const noon = new Date(2023, 0, 15, 12, 0, 0);
      const result = formatTime(noon);
      expect(result).toBe('12:00 PM');
    });
  });

  describe('formatDateTime', () => {
    it('combines date and time formatting correctly', () => {
      const result = formatDateTime(testDate);
      expect(result).toBe('Jan 15, 2023 at 2:30 PM');
    });

    it('works with midnight', () => {
      const midnight = new Date(2023, 0, 15, 0, 0, 0);
      const result = formatDateTime(midnight);
      expect(result).toBe('Jan 15, 2023 at 12:00 AM');
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('handles invalid date', () => {
      // This is a feature test - we're verifying that the function doesn't throw
      // when given an invalid date (implementation might produce "Invalid Date" output)
      const invalidDate = new Date('not a date');
      expect(() => formatDate(invalidDate)).not.toThrow();
      expect(() => formatTime(invalidDate)).not.toThrow();
      expect(() => formatDateTime(invalidDate)).not.toThrow();
    });
  });
}); 
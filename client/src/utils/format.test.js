import { describeDue, formatSalary, toDateInput } from './format.js';

const NOW = new Date('2026-10-08T10:00:00Z');

describe('describeDue', () => {
  it('describes today, overdue and upcoming dates in calendar days', () => {
    expect(describeDue('2026-10-08T00:00:00Z', NOW)).toBe('Due today');
    expect(describeDue('2026-10-07T23:00:00Z', NOW)).toBe('1 day overdue');
    expect(describeDue('2026-10-05', NOW)).toBe('3 days overdue');
    expect(describeDue('2026-10-09', NOW)).toBe('Due in 1 day');
  });
});

describe('formatSalary', () => {
  it('formats ranges and open-ended values in lakhs', () => {
    expect(formatSalary(600000, 1250000)).toBe('₹6L – ₹12.5L');
    expect(formatSalary(800000, null)).toBe('from ₹8L');
    expect(formatSalary(null, null)).toBe('—');
  });
});

describe('toDateInput', () => {
  it('converts API dates to the yyyy-mm-dd format date inputs need', () => {
    expect(toDateInput('2026-10-08T00:00:00.000Z')).toBe('2026-10-08');
    expect(toDateInput(null)).toBe('');
  });
});

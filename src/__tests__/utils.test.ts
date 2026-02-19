import {
  cn,
  formatDuration,
  formatDate,
  formatTime,
  formatRelativeTime,
  getInitials,
} from '../lib/utils';

describe('cn (classnames utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes properly', () => {
    // twMerge should handle conflicting classes
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatDuration', () => {
  it('formats seconds to mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(600)).toBe('10:00');
    expect(formatDuration(3661)).toBe('61:01');
  });
});

describe('formatDate', () => {
  it('formats date to readable string', () => {
    const date = new Date('2026-02-19T12:00:00Z');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Feb/);
    expect(formatted).toMatch(/19/);
    expect(formatted).toMatch(/2026/);
  });

  it('handles string input', () => {
    const formatted = formatDate('2026-01-15');
    expect(formatted).toMatch(/Jan/);
    expect(formatted).toMatch(/15/);
  });
});

describe('formatTime', () => {
  it('formats time with AM/PM', () => {
    const morning = new Date('2026-02-19T09:30:00');
    expect(formatTime(morning)).toMatch(/9:30/);
    expect(formatTime(morning)).toMatch(/AM/);

    const afternoon = new Date('2026-02-19T14:45:00');
    expect(formatTime(afternoon)).toMatch(/2:45/);
    expect(formatTime(afternoon)).toMatch(/PM/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-19T15:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "just now" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago for times within an hour', () => {
    const thirtyMinsAgo = new Date('2026-02-19T14:30:00Z');
    expect(formatRelativeTime(thirtyMinsAgo)).toBe('30m ago');
  });

  it('returns hours ago for times within a day', () => {
    const fiveHoursAgo = new Date('2026-02-19T10:00:00Z');
    expect(formatRelativeTime(fiveHoursAgo)).toBe('5h ago');
  });

  it('returns days ago for times within a week', () => {
    const threeDaysAgo = new Date('2026-02-16T15:00:00Z');
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });

  it('returns formatted date for older times', () => {
    const twoWeeksAgo = new Date('2026-02-05T15:00:00Z');
    const result = formatRelativeTime(twoWeeksAgo);
    expect(result).toMatch(/Feb/);
    expect(result).toMatch(/5/);
  });
});

describe('getInitials', () => {
  it('returns initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Alice Bob Charlie')).toBe('AB');
    expect(getInitials('Single')).toBe('S');
  });

  it('handles single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('returns uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('limits to 2 characters', () => {
    expect(getInitials('A B C D')).toBe('AB');
  });
});

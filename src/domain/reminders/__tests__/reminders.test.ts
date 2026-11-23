import { defaultReminderTimes, type ReminderTimes } from '../../tasks/definitions';
import { buildSchedule, firstReminderTime, validateReminderTimes } from '../schedule';
import { snoozeUntil, SNOOZE_MINUTES } from '../snooze';
import { parseTime, timeOfEpoch } from '../time';

const times = (patch: Partial<ReminderTimes>): ReminderTimes => ({
  ...defaultReminderTimes(),
  ...patch,
});

describe('buildSchedule', () => {
  it('lists the default reminders in time order', () => {
    const s = buildSchedule(defaultReminderTimes());
    expect(s.map((r) => `${r.time} ${r.taskId}`)).toEqual([
      '09:00 water',
      '10:00 stretch',
      '11:00 bathroom',
      '12:00 water',
      '15:00 stand',
      '16:00 bathroom',
      '17:00 water',
    ]);
  });

  it('marks only the earliest reminder of each task as firstOfDay', () => {
    const s = buildSchedule(defaultReminderTimes());
    const first = s.filter((r) => r.firstOfDay).map((r) => r.id);
    expect(first.sort()).toEqual(['bathroom-11:00', 'stand-15:00', 'stretch-10:00', 'water-09:00']);
  });

  it('sorts unsorted input and skips invalid times', () => {
    const s = buildSchedule(times({ water: ['17:00', '08:00', 'bad'] }));
    expect(s.filter((r) => r.taskId === 'water').map((r) => r.time)).toEqual(['08:00', '17:00']);
    expect(s.find((r) => r.id === 'water-08:00')?.firstOfDay).toBe(true);
  });

  it('gives the first reminder of the day', () => {
    expect(firstReminderTime(defaultReminderTimes())).toBe('09:00');
  });
});

describe('validateReminderTimes', () => {
  it('accepts the defaults', () => {
    expect(validateReminderTimes(defaultReminderTimes())).toBeNull();
  });

  it('rejects a bad format', () => {
    expect(validateReminderTimes(times({ stand: ['3pm'] }))).toEqual({
      error: 'badFormat',
      taskId: 'stand',
      time: '3pm',
    });
  });

  it('rejects duplicates within a task', () => {
    expect(validateReminderTimes(times({ water: ['09:00', '09:00'] }))?.error).toBe('duplicate');
  });

  it('rejects two reminders at the same minute across tasks', () => {
    expect(validateReminderTimes(times({ stretch: ['09:00'] }))).toEqual({
      error: 'sameMinute',
      taskId: 'stretch',
      otherTaskId: 'water',
      time: '09:00',
    });
  });

  it('rejects more than 3 times per task, and none', () => {
    expect(
      validateReminderTimes(times({ water: ['07:00', '08:00', '13:00', '14:00'] }))?.error,
    ).toBe('tooMany');
    expect(validateReminderTimes(times({ stand: [] }))?.error).toBe('noTimes');
  });
});

describe('snooze and time', () => {
  it('snoozes for 10 minutes by default', () => {
    expect(SNOOZE_MINUTES).toBe(10);
    expect(snoozeUntil(1_000)).toBe(1_000 + 10 * 60_000);
  });

  it('parses times', () => {
    expect(parseTime('07:45')).toEqual({ hour: 7, minute: 45 });
    expect(parseTime('24:00')).toBeNull();
    expect(timeOfEpoch(new Date(2026, 10, 23, 7, 5).getTime())).toBe('07:05');
  });
});

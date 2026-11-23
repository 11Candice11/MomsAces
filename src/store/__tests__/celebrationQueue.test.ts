import { daySeed, pickLine } from '@/domain/shared/pickLine';
import {
  dequeue,
  enqueue,
  type CelebrationEvent,
  type QueuedCelebration,
} from '../celebrationQueue';

let id = 0;
const q = (event: CelebrationEvent): QueuedCelebration => ({ id: ++id, event });
const task = () => q({ kind: 'taskComplete', taskId: 'water', tickets: 1, stars: 5 });
const rank = () => q({ kind: 'rankUp', rank: 'queen', level: 1, rankUp: true });
const flush = () => q({ kind: 'royalFlush', tickets: 2, stars: 20, mysteryId: 'm' });
const mystery = () => q({ kind: 'mysteryReveal', pendingId: 'm' });
const ace = () => q({ kind: 'aceMessage', message: 'hi', pose: 'waving' });
const kinds = (list: QueuedCelebration[]) => list.map((x) => x.event.kind);

describe('celebration queue', () => {
  it('orders task complete, rank-up, Royal Flush, mystery reveal', () => {
    expect(kinds(enqueue([], [mystery(), flush(), rank(), task()]))).toEqual([
      'mysteryReveal', // first in became the head and is on screen
      'taskComplete',
      'rankUp',
      'royalFlush',
    ]);
    expect(kinds(enqueue([task()], [mystery(), flush(), rank()]))).toEqual([
      'taskComplete',
      'rankUp',
      'royalFlush',
      'mysteryReveal',
    ]);
  });

  it('never moves the celebration on screen', () => {
    const head = flush();
    expect(enqueue([head], [task()])[0]).toBe(head);
  });

  it('shows an Ace message only alone', () => {
    expect(kinds(enqueue([task()], [ace()]))).toEqual(['taskComplete']);
    expect(kinds(enqueue([], [ace()]))).toEqual(['aceMessage']);
    const first = ace();
    const second = ace();
    expect(enqueue([first], [ace(), second])).toEqual([first, second]);
    expect(kinds(enqueue([first, ace()], [task()]))).toEqual(['aceMessage', 'taskComplete']);
  });

  it('dequeues the head', () => {
    expect(kinds(dequeue(enqueue([task()], [rank()])))).toEqual(['rankUp']);
    expect(dequeue([])).toEqual([]);
  });
});

describe('pickLine', () => {
  it('is stable for a day and rotates by day', () => {
    const pool = ['a', 'b', 'c'];
    const today = daySeed('2026-11-23');
    expect(pickLine(pool, today)).toBe(pickLine(pool, today));
    expect(daySeed('2026-11-24') - today).toBe(1);
    expect(new Set([0, 1, 2].map((i) => pickLine(pool, today + i))).size).toBe(3);
    expect(pickLine(pool, -1)).toBe('c');
    expect(() => pickLine([], 1)).toThrow(RangeError);
  });
});

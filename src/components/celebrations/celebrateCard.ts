import type { TaskCardOutcome } from '@/domain/play/session';
import { celebrate, type CelebrationEvent } from '@/store';

/**
 * Turns a played card's saved outcome into celebrations, in the R18.3 order: task complete,
 * rank-up, Royal Flush. New mystery cards stay pending (saved) and are opened from the Royal
 * Flush chest, the Path, or the launch recovery (tasks 10 and 11).
 */
export function celebrateCard(outcome: TaskCardOutcome) {
  const events: CelebrationEvent[] = [
    {
      kind: 'taskComplete',
      taskId: outcome.taskId,
      tickets: outcome.reward.tickets,
      stars: outcome.reward.stars,
      headline: outcome.taskId === 'stretch' ? 'sessionComplete' : 'taskCompleted',
    },
  ];
  if (outcome.rankChange) {
    events.push({
      kind: 'rankUp',
      rank: outcome.rankChange.rank,
      level: outcome.rankChange.level,
      rankUp: outcome.rankChange.rankUp,
    });
  }
  if (outcome.royalFlush) {
    events.push({
      kind: 'royalFlush',
      tickets: outcome.royalFlush.tickets,
      stars: outcome.royalFlush.stars,
      mysteryId: outcome.royalFlush.mystery.id,
    });
  }
  celebrate(events);
}

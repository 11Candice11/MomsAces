import { useCallback } from 'react';
import {
  dismissCelebration,
  gameActions,
  useCelebrationStore,
  type QueuedCelebration,
} from '@/store';
import { MotionOverride } from '@/theme';
import { AceMessage } from './variants/AceMessage';
import { MysteryReveal } from './variants/MysteryReveal';
import { RankUp } from './variants/RankUp';
import { RoyalFlush } from './variants/RoyalFlush';
import { TaskComplete } from './variants/TaskComplete';
import { Win } from './variants/Win';

/**
 * Mounted once at the app root (design section 9). Shows the head of the celebration queue, one
 * at a time; "Collect" moves to the next. Rewards are already saved, so Collect only dismisses.
 */
export function CelebrationHost() {
  const current = useCelebrationStore((s) => s.queue[0]);
  if (!current) return null;
  return (
    <MotionOverride level={current.motionOverride}>
      {/* key: a new celebration always starts its animation from the beginning */}
      <Celebration key={current.id} item={current} />
    </MotionOverride>
  );
}

function Celebration({ item }: { item: QueuedCelebration }) {
  const { event } = item;
  const onCollect = useCallback(() => {
    if (event.kind === 'royalFlush' && !item.motionOverride) gameActions.markRoyalFlushSeen();
    dismissCelebration();
  }, [event.kind, item.motionOverride]);

  switch (event.kind) {
    case 'taskComplete':
      return (
        <TaskComplete
          taskId={event.taskId}
          tickets={event.tickets}
          stars={event.stars}
          headline={event.headline}
          onCollect={onCollect}
        />
      );
    case 'rankUp':
      return <RankUp rank={event.rank} level={event.level} onCollect={onCollect} />;
    case 'royalFlush':
      return <RoyalFlush tickets={event.tickets} stars={event.stars} onCollect={onCollect} />;
    case 'mysteryReveal':
      return <MysteryReveal onCollect={onCollect} />;
    case 'win':
      return <Win stars={event.stars} onCollect={onCollect} />;
    case 'aceMessage':
      return (
        <AceMessage
          message={event.message}
          pose={event.pose}
          stars={event.stars}
          onCollect={onCollect}
        />
      );
  }
}

import type { TaskId } from '@/domain/tasks/definitions';
import { strings } from '@/strings';
import type { IconName } from './Icon';

/** One icon per task card. Always shown with the task's label. */
export const TASK_ICONS: Record<TaskId, IconName> = {
  water: 'water',
  bathroom: 'human-male-female',
  stretch: 'meditation',
  stand: 'human-handsup',
};

/** The task's names from strings: `name` ("Drink Water") and `short` ("Water"). */
export const taskStrings = (taskId: TaskId) => strings.tasks[taskId];

import { ref, computed } from 'vue';
import type { Subtask } from '../types';

export function useTaskState() {
  const taskInstruction = ref('');
  const results = ref<Array<{ value: string }>>([{ value: '' }]);
  const subtasks = ref<Subtask[]>([]);
  const subtasksExpanded = ref<string[]>([]);

  const hasSelectedSubtasks = computed(() => 
    subtasks.value.some(subtask => subtask.checked)
  );

  const clearTaskData = () => {
    taskInstruction.value = '';
    results.value = [{ value: '' }];
    subtasks.value = [];
    subtasksExpanded.value = [];
  };

  return {
    taskInstruction,
    results,
    subtasks,
    subtasksExpanded,
    hasSelectedSubtasks,
    clearTaskData
  };
}


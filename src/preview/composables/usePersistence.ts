import { watch } from 'vue';
import type { Ref } from 'vue';
import type { Subtask } from '../types';
import type { Action } from '../types';
import { STORAGE_KEY } from '../constants';

export function usePersistence(
  recordingSessionId: Ref<string>,
  taskInstruction: Ref<string>,
  results: Ref<Array<{ value: string }>>,
  subtasks: Ref<Subtask[]>,
  deletedActions: Ref<Action[]>,
  savedAssociations: Ref<Array<[string, string]>>,
  actionStack: Ref<Action[]>,
  url: Ref<string>
) {
  // Save state to chrome.storage.local
  const saveStateToStorage = () => {
    const state = {
      recordingSessionId: recordingSessionId.value,
      taskInstruction: taskInstruction.value,
      results: JSON.parse(JSON.stringify(results.value)),
      subtasks: subtasks.value.map(subtask => ({
        id: subtask.id,
        order: subtask.order,
        instruction: subtask.instruction,
        results: JSON.parse(JSON.stringify(subtask.results)),
        actionIds: subtask.actions.map(action => action.id),
        checked: subtask.checked
      })),
      deletedActionIds: deletedActions.value.map(action => action.id),
      savedAssociations: JSON.parse(JSON.stringify(savedAssociations.value)),
      firstActionId: actionStack.value[0]?.id,
      url: url.value,
    };
    
    const stateSize = (new Blob([JSON.stringify(state)]).size / 1024).toFixed(2);
    console.log('💾 Cache write:', {
      recordingSessionId: recordingSessionId.value,
      subtasks: state.subtasks.length,
      associations: state.savedAssociations.length,
      deletedActions: state.deletedActionIds.length,
      size: stateSize + ' KB'
    });
    
    chrome.storage.local.set({ [STORAGE_KEY]: state });
  };

  // Watch for changes and auto-save
  watch(
    [recordingSessionId, taskInstruction, results, subtasks, deletedActions, savedAssociations],
    () => {
      saveStateToStorage();
    },
    { deep: true }
  );

  const loadStateFromStorage = async () => {
    const savedState = await chrome.storage.local.get(STORAGE_KEY);
    return savedState[STORAGE_KEY] || null;
  };

  return {
    saveStateToStorage,
    loadStateFromStorage
  };
}


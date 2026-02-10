import { ref, computed } from 'vue';
import type { Action } from '../types';

export function useActionManagement() {
  const actionStack = ref<Action[]>([]);
  const selectedActions = ref<Set<string>>(new Set());
  const lastSelectedActionId = ref<string | null>(null);
  const isShiftPressed = ref(false);
  const chunks = ref<Record<string, any>>({});
  const deletedActions = ref<Action[]>([]);

  const hasSelectedActions = computed(() => selectedActions.value.size > 0);

  const generateUUID = () => {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const clearActions = () => {
    actionStack.value = [];
    selectedActions.value.clear();
    lastSelectedActionId.value = null;
    deletedActions.value = [];
    chunks.value = {};
  };

  return {
    actionStack,
    selectedActions,
    lastSelectedActionId,
    isShiftPressed,
    chunks,
    deletedActions,
    hasSelectedActions,
    generateUUID,
    clearActions
  };
}


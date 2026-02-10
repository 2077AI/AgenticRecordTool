<template>
  <Loading v-if="loading" />
  <div class="wrap">
    <TaskSidebar
      :subtasks="subtasks"
      :is-associating="isAssociating"
      :associations="associations"
      :selected-subtask-for-association="selectedSubtaskForAssociation"
      @update:associations="handleUpdateAssociations"
      @update:selected-subtask-for-association="selectedSubtaskForAssociation = $event"
      @open-recycle-bin="handleOpenRecycleBin"
      @scroll-to-subtask="handleScrollToSubtask"
      @scroll-to-task="handleScrollToTask"
    />
    <div class="w-content">
      <div class="w-header">
        <template v-if="showRecycleBin">
          <div class="w-header-left">
            <span class="w-back-link" @click="handleBackFromRecycleBin">Home Page</span>
            <span>Recycle Bin</span>
          </div>
        </template>
        <template v-else>
          <NButton class="action-button action-button-normal" @click="handleDownloadData">{{ i18nTexts.downloadData }}</NButton>
          <NButton class="action-button action-button-normal" @click="handleAssociate">{{ isAssociating ? i18nTexts.saveAssociate : i18nTexts.associate }}</NButton>
          <NButton class="action-button action-button-normal" :disabled="!hasSelectedSubtasks" @click="handleUngroupActions">{{ i18nTexts.ungroup }}</NButton>
          <NButton class="action-button action-button-normal" :disabled="!hasSelectedActions" @click="handleGroupActions">{{ i18nTexts.group }}</NButton>
        </template>
      </div>
      <!-- --------- List Section --------- -->
      <div class="w-info">
        <RecycleBin
          v-if="showRecycleBin"
          :deleted-actions="deletedActions"
          @open-tab="handleOpenTab"
          @check="handleCheck"
          @restore="handleRestoreAction"
        />
        <div v-else class="w-list">
          <TaskSection
            :task-instruction="taskInstruction"
            :results="results"
            @update:instruction="taskInstruction = $event"
            @update:results="results = $event"
          />
          <SubtasksSection
            :subtasks="subtasks"
            :subtasks-expanded="subtasksExpanded"
            @update:subtasks-expanded="subtasksExpanded = $event"
            @update-subtask-checked="handleUpdateSubtaskChecked"
            @update-subtask-instruction="handleUpdateSubtaskInstruction"
            @update-subtask-results="handleUpdateSubtaskResults"
            @open-tab="handleOpenTab"
            @check="handleCheck"
            @remove-subtask-action="handleRemoveSubtaskAction"
          />
          <ActionsSection
            :visible-actions="visibleActions"
            :actions-collapse-expanded="actionsCollapseExpanded"
            :instruction-description="i18nTexts.instructionDescription"
            :empty-actions="i18nTexts.emptyActions"
            :is-action-selected="isActionSelected"
            @update:actions-collapse-expanded="actionsCollapseExpanded = $event"
            @toggle-action="handleToggleAction"
            @open-tab="handleOpenTab"
            @check="handleCheck"
            @remove-action="handleRemoveAction"
          />
        </div>
        <VideoSection
          :current-time="currentTime"
          :recording-screen="i18nTexts.recordingScreen"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from "vue";
import { NButton, useMessage } from "naive-ui";
import { saveAs } from "file-saver";
import Loading from "./Loading.vue";
import TaskSidebar from "./components/sidebar/TaskSidebar.vue";
import RecycleBin from "./components/sidebar/RecycleBin.vue";
import TaskSection from "./components/task/TaskSection.vue";
import SubtasksSection from "./components/task/SubtasksSection.vue";
import ActionsSection from "./components/task/ActionsSection.vue";
import VideoSection from "./components/video/VideoSection.vue";
import { t } from '../utils/i18n';
import { useTaskState } from './composables/useTaskState';
import { useActionManagement } from './composables/useActionManagement';
import { usePersistence } from './composables/usePersistence';
import { useVideoPlayer } from './composables/useVideoPlayer';
import { useDataLoader } from './composables/useDataLoader';
import type { Subtask } from './types';

const message = useMessage();

const i18nTexts = computed(() => ({
  saveData: t('save_data'),
  saveSuccess: t('save_success'),
  uploadProgress: t('upload_progress'),
  eventType: t('event_type'),
  timeLabel: t('time_label'),
  openLink: t('open_link'),
  viewButton: t('view_button'),
  removeButton: t('remove_button'),
  contentLabel: t('content_label'),
  xpathLabel: t('xpath_label'),
  altKeyLabel: t('alt_key_label'),
  ctrlKeyLabel: t('ctrl_key_label'),
  metaKeyLabel: t('meta_key_label'),
  keyLabel: t('key_label'),
  recordingScreen: t('recording_screen'),
  downloadData: t('download_data'),
  associate: t('associate'),
  saveAssociate: t('save_associate'),
  ungroup: t('ungroup'),
  group: t('group'),
  recycleBin: t('recycle_bin'),
  restore: t('restore'),
  linkingModeMessage: t('linking_mode_message'),
  operationSuccessful: t('operation_successful'),
  downloadSuccessful: t('download_successful'),
  instructionDescription: t('instruction_description'),
  noSubtasksForAssociation: t('no_subtasks_for_association'),
  back: t('back'),
  emptyActions: t('empty_actions')
}));

// Use composables
const {
  taskInstruction,
  results,
  subtasks,
  subtasksExpanded,
  hasSelectedSubtasks,
  clearTaskData
} = useTaskState();

const {
  actionStack,
  selectedActions,
  lastSelectedActionId,
  isShiftPressed,
  chunks,
  deletedActions,
  hasSelectedActions,
  generateUUID,
  clearActions
} = useActionManagement();

const { url, currentTime, initPlayer, seekTo } = useVideoPlayer();
const actionsCollapseExpanded = ref<string[]>(['actions']);

const isAssociating = ref(false);
const associations = ref<Array<[string, string]>>([]);
const savedAssociations = ref<Array<[string, string]>>([]);
const selectedSubtaskForAssociation = ref<string | null>(null);

const showRecycleBin = ref(false);
const recordingSessionId = ref<string>('');

// Use persistence composable
usePersistence(
  recordingSessionId,
  taskInstruction,
  results,
  subtasks,
  deletedActions,
  savedAssociations,
  actionStack,
  url
);

watch(
  () => subtasks.value.map(s => s.id),
  (newSubtaskIds, oldSubtaskIds) => {
    if (!oldSubtaskIds) {
      return;
    }
    
    const deletedSubtaskIds = oldSubtaskIds.filter(id => !newSubtaskIds.includes(id));
    if (deletedSubtaskIds.length > 0) {
      const validAssociations = associations.value.filter(assoc => {
        const [id1, id2] = assoc;
        return !deletedSubtaskIds.includes(id1) && !deletedSubtaskIds.includes(id2);
      });
      if (validAssociations.length !== associations.value.length) {
        associations.value = validAssociations;
      }
      
      const validSavedAssociations = savedAssociations.value.filter(assoc => {
        const [id1, id2] = assoc;
        return !deletedSubtaskIds.includes(id1) && !deletedSubtaskIds.includes(id2);
      });
      if (validSavedAssociations.length !== savedAssociations.value.length) {
        savedAssociations.value = validSavedAssociations;
      }
    }
  },
  { immediate: false }
);

const visibleActions = computed(() => {
  const groupedActionIds = new Set<string>();
  subtasks.value.forEach(subtask => {
    subtask.actions.forEach(action => {
      if (action.id) {
        groupedActionIds.add(action.id);
      }
    });
  });
  
  // Also collect deleted action IDs
  const deletedActionIds = new Set<string>();
  deletedActions.value.forEach(action => {
    if (action.id) {
      deletedActionIds.add(action.id);
    }
  });
  
  // Filter out both grouped and deleted actions
  return actionStack.value.filter(action => 
    action.id && 
    !groupedActionIds.has(action.id) && 
    !deletedActionIds.has(action.id)
  );
});

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Shift') {
    isShiftPressed.value = true;
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Shift') {
    isShiftPressed.value = false;
  }
};

onMounted(async () => {
  document.title = __APP_TITLE__;
  
  await loadMetadata();

  // Send message to service worker, but handle errors gracefully
  chrome.runtime.sendMessage({
    action: "previewLoaded",
  }).catch((error) => {
    // Service worker might not be ready or may have closed
    console.debug('Could not send previewLoaded message:', error.message);
  });
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

// Clear all task data
const clearAllTaskData = () => {
  clearTaskData();
  clearActions();
  associations.value = [];
  savedAssociations.value = [];
  selectedSubtaskForAssociation.value = null;
  isAssociating.value = false;
};

const loading = ref(true);

// Use data loader composable
const { loadMetadata, processActionChunks } = useDataLoader(
  actionStack,
  chunks,
  generateUUID,
  clearAllTaskData,
  recordingSessionId,
  taskInstruction,
  results,
  subtasks,
  subtasksExpanded,
  deletedActions,
  savedAssociations,
  associations,
  url,
  initPlayer,
  i18nTexts,
  loading
);

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.action === "actionChunks") {
    processActionChunks(msg);
  }
  return false;
});

const handleOpenTab = (url: string) => {
  chrome.tabs.create({ url });
};
const handleCheck = (time: number) => {
  seekTo(time);
};
const handleToggleAction = (index: number, checked: boolean, event?: MouseEvent) => {
  const action = visibleActions.value[index];
  
  if (action && action.id) {
    const shiftKeyActive = event?.shiftKey ?? isShiftPressed.value;
    
    // Range selection with Shift key
    if (shiftKeyActive && lastSelectedActionId.value !== null && checked) {
      const lastSelectedIndex = visibleActions.value.findIndex(a => a.id === lastSelectedActionId.value);
      
      if (lastSelectedIndex !== -1) {
        const startIndex = Math.min(lastSelectedIndex, index);
        const endIndex = Math.max(lastSelectedIndex, index);
        
        for (let i = startIndex; i <= endIndex; i++) {
          const rangeAction = visibleActions.value[i];
          if (rangeAction && rangeAction.id) {
            selectedActions.value.add(rangeAction.id);
          }
        }
      }
      lastSelectedActionId.value = action.id;
    } else {
      // Normal selection/deselection
      if (checked) {
        selectedActions.value.add(action.id);
        lastSelectedActionId.value = action.id;
      } else {
        selectedActions.value.delete(action.id);
        if (lastSelectedActionId.value === action.id) {
          let otherSelectedAction: any = null;
          let minDistance = Infinity;
          
          visibleActions.value.forEach((a: any, i: number) => {
            if (a.id && a.id !== action.id && selectedActions.value.has(a.id)) {
              const distance = Math.abs(i - index);
              if (distance < minDistance) {
                minDistance = distance;
                otherSelectedAction = a;
              }
            }
          });
          
          lastSelectedActionId.value = otherSelectedAction?.id || null;
        }
      }
    }
  }
};

// ----------- Remove Action -----------------
const handleRemoveAction = (index: number) => {
  const action = visibleActions.value[index];
  if (action && action.id) {
    const actionIndex = actionStack.value.findIndex(a => a.id === action.id);
    if (actionIndex !== -1) {
      console.log('🗑️ Remove action:', { id: action.id, order: action.order });
      deletedActions.value.push({ ...action });
      actionStack.value.splice(actionIndex, 1);
      selectedActions.value.delete(action.id);
      if (lastSelectedActionId.value === action.id) {
        const otherSelectedAction = visibleActions.value.find(a => 
          a.id && a.id !== action.id && selectedActions.value.has(a.id)
        );
        lastSelectedActionId.value = otherSelectedAction?.id || null;
      }
      message.success(i18nTexts.value.operationSuccessful, { showIcon: false });
    }
  }
};

const isActionSelected = (_index: number, item: any) => {
  return item.id ? selectedActions.value.has(item.id) : false;
};

// Handlers for subtask updates
const handleUpdateSubtaskChecked = (subtaskId: string, checked: boolean) => {
  const subtask = subtasks.value.find(s => s.id === subtaskId);
  if (subtask) {
    subtask.checked = checked;
  }
};

const handleUpdateSubtaskInstruction = (subtaskId: string, instruction: string) => {
  const subtask = subtasks.value.find(s => s.id === subtaskId);
  if (subtask) {
    subtask.instruction = instruction;
  }
};

const handleUpdateSubtaskResults = (subtaskId: string, results: Array<{ value: string }>) => {
  const subtask = subtasks.value.find(s => s.id === subtaskId);
  if (subtask) {
    subtask.results = results;
  }
};

// --------------- Group Actions -----------------
const handleGroupActions = () => {
  if (selectedActions.value.size === 0) return;
  
  const selectedActionIds = Array.from(selectedActions.value);
  const selectedActionsList = actionStack.value
    .filter(action => action.id && selectedActionIds.includes(action.id))
    .sort((a, b) => {
      const indexA = actionStack.value.findIndex(action => action.id === a.id);
      const indexB = actionStack.value.findIndex(action => action.id === b.id);
      return indexA - indexB;
    });
  
  selectedActionsList.forEach(action => {
    if (!action.id) {
      action.id = generateUUID();
    }
  });
  
  const maxOrder = subtasks.value.reduce((max, s) => Math.max(max, s.order || 0), 0);
  
  // Create new subtask
  const newSubtask: Subtask = {
    id: generateUUID(),
    order: maxOrder + 1,
    instruction: '',
    results: [{ value: '' }],
    actions: selectedActionsList,
    checked: false
  };
  
  subtasks.value.push(newSubtask);
  subtasksExpanded.value.push(newSubtask.id);
  selectedActions.value.clear();
  lastSelectedActionId.value = null;
  message.success(i18nTexts.value.operationSuccessful, { showIcon: false });
};

// ----------- Ungroup Actions -----------------
const handleUngroupActions = () => {
  const selectedSubtasks = subtasks.value.filter(subtask => subtask.checked);
  if (selectedSubtasks.length === 0) return;
  const actionsToUngroup: any[] = [];
  selectedSubtasks.forEach(subtask => {
    subtask.actions.forEach(action => {
      if (action.id) {
        const existingActionIndex = actionStack.value.findIndex(a => a.id === action.id);
        if (existingActionIndex === -1) {
          actionsToUngroup.push(action);
        }
      }
    });
  });
  
  if (actionsToUngroup.length > 0) {
    actionStack.value.push(...actionsToUngroup);
  }
  
  selectedSubtasks.forEach(selectedSubtask => {
    const index = subtasks.value.findIndex(s => s.id === selectedSubtask.id);
    if (index !== -1) {
      const expandedIndex = subtasksExpanded.value.indexOf(selectedSubtask.id);
      if (expandedIndex !== -1) {
        subtasksExpanded.value.splice(expandedIndex, 1);
      }
      subtasks.value.splice(index, 1);
    }
  });
  
  message.success(i18nTexts.value.operationSuccessful, { showIcon: false });
};

// ----------- Remove Subtask Action -----------------
const handleRemoveSubtaskAction = (subtaskId: string, actionIndex: number) => {
  const subtaskIndex = subtasks.value.findIndex(s => s.id === subtaskId);
  if (subtaskIndex === -1) return;
  
  const action = subtasks.value[subtaskIndex].actions[actionIndex];
  if (action && action.id) {
    console.log('🗑️ Remove subtask action:', { 
      subtaskId, 
      actionId: action.id, 
      remainingInSubtask: subtasks.value[subtaskIndex].actions.length - 1 
    });
    
    deletedActions.value.push({ ...action });
    
    subtasks.value[subtaskIndex].actions.splice(actionIndex, 1);
    
    if (subtasks.value[subtaskIndex].actions.length === 0) {
      console.log('🗑️ Remove empty subtask:', { subtaskId });
      subtasks.value.splice(subtaskIndex, 1);
    }
    
    const stackIndex = actionStack.value.findIndex(a => a.id === action.id);
    if (stackIndex !== -1) {
      actionStack.value.splice(stackIndex, 1);
    }
    
    message.success(i18nTexts.value.operationSuccessful, { showIcon: false });
  }
};


// ------------- Associate Actions -----------------
// Handle association updates from AssociationLayer (e.g., delete line)
const handleUpdateAssociations = (newAssociations: Array<[string, string]>) => {
  associations.value = newAssociations;
  // Only save to savedAssociations when NOT in editing mode
  // In editing mode, changes are saved when user clicks "Save" button
  if (!isAssociating.value) {
    savedAssociations.value = [...newAssociations];
    console.log('💾 Association change saved (view mode)');
  } else {
    console.log('✏️ Association changed (edit mode, not saved yet)');
  }
};

const handleAssociate = () => {
  if (isAssociating.value) {
    savedAssociations.value = [...associations.value];
    isAssociating.value = false;
    selectedSubtaskForAssociation.value = null;
    message.success(i18nTexts.value.operationSuccessful, { showIcon: false });
  } else {
    if (subtasks.value.length < 2) {
      message.warning(i18nTexts.value.noSubtasksForAssociation, { showIcon: false });
      return;
    }
    selectedSubtaskForAssociation.value = null;
    isAssociating.value = true;
    message.info(i18nTexts.value.linkingModeMessage, { showIcon: false });
    nextTick(() => {
      const currentSubtaskIds = subtasks.value.map(s => s.id);
      const validSavedAssociations = savedAssociations.value.filter(assoc => {
        const [id1, id2] = assoc;
        return currentSubtaskIds.includes(id1) && currentSubtaskIds.includes(id2);
      });
      associations.value = validSavedAssociations;
    });
  }
};

// ----------------- Recycle Bin -----------------
const handleOpenRecycleBin = () => {
  showRecycleBin.value = true;
};

const handleBackFromRecycleBin = () => {
  showRecycleBin.value = false;
};

// Scroll to subtask by id
const handleScrollToSubtask = (subtaskId: string) => {
  nextTick(() => {
    const element = document.getElementById(`subtask-${subtaskId}`);
    if (element) {
      const scrollContainer = element.closest('.w-list');
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 20;
        
        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        
        if (!subtasksExpanded.value.includes(subtaskId)) {
          subtasksExpanded.value.push(subtaskId);
        }
      }
    }
  });
};

// Scroll to Task section
const handleScrollToTask = () => {
  nextTick(() => {
    const element = document.getElementById('task-section');
    if (element) {
      const scrollContainer = element.closest('.w-list');
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 20;
        
        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  });
};

const handleRestoreAction = (action: any) => {
  if (!action.id) return;
  
  const deletedIndex = deletedActions.value.findIndex(a => a.id === action.id);
  if (deletedIndex !== -1) {
    deletedActions.value.splice(deletedIndex, 1);
  }
  
  const existingIndex = actionStack.value.findIndex(a => a.id === action.id);
  if (existingIndex === -1) {
    const actionTime = action.time ?? 0;
    const insertIndex = actionStack.value.findIndex(a => (a.time ?? 0) > actionTime);
    if (insertIndex === -1) {
      actionStack.value.push(action);
    } else {
      actionStack.value.splice(insertIndex, 0, action);
    }
  }
  
  message.success(i18nTexts.value.operationSuccessful, { showIcon: false });
};

// ----------------- Download Data -----------------
const handleDownloadData = () => {
  try {
    // Get IDs of deleted actions to exclude them from export
    const deletedActionIds = new Set(deletedActions.value.map(action => action.id));
    
    // Separate actions into different categories
    const subtaskActions: any[] = [];
    const otherActions: any[] = [];
    
    // Collect actions from subtasks (excluding deleted ones)
    subtasks.value.forEach(subtask => {
      subtask.actions.forEach((action: any) => {
        if (!deletedActionIds.has(action.id)) {
          subtaskActions.push(action);
        }
      });
    });
    
    // Collect other actions (excluding deleted ones)
    actionStack.value.forEach((action: any) => {
      if (!deletedActionIds.has(action.id)) {
        otherActions.push(action);
      }
    });
    
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        statistics: {
          totalActions: subtaskActions.length + otherActions.length,
          subtaskActions: subtaskActions.length,
          otherActions: otherActions.length,
          deletedActions: deletedActions.value.length,
          subtasks: subtasks.value.length,
          associations: associations.value.length
        }
      },
      task: {
        instruction: taskInstruction.value,
        results: results.value,
        subtasks: subtasks.value.map(subtask => ({
          id: subtask.id,
          order: subtask.order,
          instruction: subtask.instruction,
          results: subtask.results,
          // Only include non-deleted actions
          subaction: subtask.actions
            .filter((action: any) => !deletedActionIds.has(action.id))
            .map((action: any) => ({
              id: action.id,
              type: action.type,
              time: action.time,
              url: action.url,
              info: action.info,
              rawHtml: action.rawHtml
            }))
        })),
        associations: savedAssociations.value,
        // Only include non-deleted actions
        other_actions: actionStack.value
          .filter((action: any) => !deletedActionIds.has(action.id))
          .map((action: any) => ({
            id: action.id,
            type: action.type,
            time: action.time,
            url: action.url,
            info: action.info,
            rawHtml: action.rawHtml
          }))
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const fileName = `cgat_task_${recordingSessionId.value}.json`;
    
    saveAs(blob, fileName);
    
    console.log('📥 Data exported:', {
      fileName,
      subtasks: exportData.task.subtasks.length,
      actions: {
        inSubtasks: subtaskActions.length,
        others: otherActions.length,
        total: subtaskActions.length + otherActions.length
      },
      deletedActions: deletedActions.value.length,
      associations: savedAssociations.value.length
    });
    
    message.success(i18nTexts.value.downloadSuccessful);
  } catch (error) {
    message.error('Operation failed', { showIcon: false });
    console.error('Export failed:', error);
  }
};
</script>

<style lang="less" scoped>
.wrap {
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  box-sizing: border-box;
  overflow-x: hidden;
  .w-top {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 12px;
    padding: 20px 14px;
    background: white;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.10);
    
    .w-title {
      font-size: 20px;
      line-height: 24px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .w-instruction {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .w-instruction-label {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
      }
      
      .w-instruction-input {
        width: 100%;
        height: 40px;
      }
    }
    
    .w-result-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .w-result-label {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
      }
      
      .w-result-group-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .w-result-index {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #1f2937;
          flex-shrink: 0;
        }
        
        .w-result-input {
          flex: 1;
          height: 40px;
        }
        
      }
    }
  }
  .w-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .w-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 12px 13px;
    height: 60px;
    background: white;
    box-sizing: border-box;
    border-bottom: 1px solid #E2E2E2;

    .action-button {
      padding: 0 12px;
      border-radius: 6px;
      backdrop-filter: blur(8px);
      white-space: nowrap;
    }
    
    :deep(.action-button-normal) {
      --n-border-radius: 6px !important;
      --n-border: 1px solid rgba(118, 116, 233, 0.40) !important;
      --n-border-hover: 1px solid rgba(158, 157, 239, 0.40) !important;
      --n-border-pressed: 1px solid rgba(118, 116, 233, 0.40) !important;
      --n-border-focus: 1px solid rgba(118, 116, 233, 0.40) !important;
      --n-color: #5E5CE5 !important;
      --n-color-hover: #7C7AE8 !important;
      --n-color-pressed: #4B49D1 !important;
      --n-color-focus: #5E5CE5 !important;
      --n-color-disabled: #6E6E6E80 !important;
      --n-text-color: white !important;
      --n-text-color-hover: white !important;
      --n-text-color-pressed: white !important;
      --n-text-color-focus: white !important;
      --n-text-color-disabled: white !important;
      backdrop-filter: blur(8px);
    }

    .w-header-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      
      svg {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }
      
      span {
        color: rgba(0, 0, 0, 0.70);
        font-family: "PingFang SC";
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
      }
      
      .w-back-link {
        color: #000;
        font-family: "PingFang SC";
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        border-right: 1px solid #E2E2E2;
        padding: 0 12px;
        margin-right: 8px;
        height: 30px;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: color 0.2s ease;
        
        &:hover {
          color: #4B49D1;
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }

  }

  .w-info {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;
    .w-list {
      flex: 6;
      min-width: 400px;
      overflow-y: auto;
      height: 100%;
      scrollbar-width: none;
      -ms-overflow-style: none;
      
      &::-webkit-scrollbar {
        display: none;
      }
      .w-subtasks-container {
        margin-bottom: 12px;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.10);
        background: #FFF;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        :deep(.n-collapse) {
          border: none;
          background: transparent;
          width: 100%;
        }
      }
      .w-list-container {
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.10);
        background: #FFF;
        padding: 14px;
        
        :deep(.n-collapse) {
          border: none;
          background: transparent;
          width: 100%;
        }

        .w-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px;
          color: #9ca3af;
          font-style: italic;
          font-size: 14px;
          border-radius: 12px;
          border: 1px solid #E6E6E6;
          background: #F9F9F9;
          margin-top: 10px;
        }
      }
      .w-subtask-collapse {
        margin-bottom: 12px;
        :deep(.n-collapse-item) {
          border: 1px solid rgba(0, 0, 0, 0.10);
          background: white;
          border-radius: 12px;
        }
        
        :deep(.n-collapse-item__header) {
          // padding: 12px 14px;
          background: transparent;
        }
        
        :deep(.n-collapse-item__content-wrapper) {
          .n-collapse-item__content-inner {
            // padding: 20px 14px;
            padding-top: 12px;
          }
        }
        
        .w-subtask-header {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          
          > span {
            color: #000;
            font-family: "PingFang SC";
            font-size: 20px;
            font-style: normal;
            font-weight: 500;
            line-height: 24px; /* 120% */
            letter-spacing: 0.2px;
          }
        }
        
        .w-subtask-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          
          .w-subtask-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            
            .w-subtask-actions-title {
              font-size: 16px;
              font-weight: 500;
              color: #1f2937;
              margin-bottom: 4px;
            }
          }
        }
      }
      
      .w-actions-collapse {
        :deep(.n-collapse-item) {
          border: none;
          background: transparent;
        }
        
        :deep(.n-collapse-item__header) {
          padding: 0;
          background: transparent;
        }
        
        :deep(.n-collapse-item__content-wrapper) {
          .n-collapse-item__content-inner {
            padding: 0;
            padding-top: 12px;
          }
        }
      }
      
      .w-list-title-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        width: 100%;
        
        > span {
          color: #000;
          font-size: 20px;
          font-weight: 500;
          line-height: 24px; /* 120% */
          letter-spacing: 0.2px;
        }
        
        .w-list-title-container-right {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6b7280;
          margin-left: auto;
          
          svg {
            flex-shrink: 0;
          }
        }
      }
      .l-item {
        position: relative;
        width: 100%;
        margin-bottom: 10px;
        border-radius: 12px;
        border: 1px solid #E6E6E6;
        background: #F9F9F9;
        box-sizing: border-box;
        .i-head {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
            .h-left {
              display: flex;
              align-items: center;
              .h-index {
                background: #5e5ce5;
                width: 22px;
                height: 22px;
                min-width: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                color: #fff;
                font-size: 12px;
                font-weight: 500;
              }
            }
        }

        .i-desc {
          margin-bottom: 10px;
          width: 400px;
          margin-right: 10px;
        }
        .i-inneractions {
            .i-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 10px;
              border-bottom: 1px solid #e5e7eb;
              background: #F9F9F9;
              border-radius: 12px 12px 0 0;
              .h-left {
                display: flex;
                align-items: center;
                gap: 12px;
                .h-index {
                  background: #5e5ce5;
                  width: 22px;
                  height: 22px;
                  min-width: 22px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                  color: #fff;
                  font-size: 14px;
                  line-height: 18px;
                  font-weight: 400;
                }
                .event-label {
                  color: #0E0E0E99;
                }
              }
              .button-wrap {
                display: flex;
                align-items: center;
                gap: 8px;
              }
            }
            .i-info {
              display: flex;
              flex-direction: column;
              padding: 8px 10px;
              background: #F9F9F9;
              border-radius: 0 0 12px 12px;
              font-size: 14px;
              line-height: 1.5;
              color: #374151;
              gap: 8px;
              .i-info-item {
                display: flex;
                align-items: flex-start;
                gap: 4px;
                > :first-child {
                  color: #0E0E0E99;
                }
              }
          }
        }
      }
    }
    .w-video {
      flex: 5;
      min-width: 300px;
      width: 100%;
      height: 100%;
      align-self: stretch;
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;

      .w-video-title {
        font-size: 20px;
        line-height: 24px;
        font-weight: 600;
        color: #1f2937;
        line-height: 24px; 
        margin-bottom: 16px;
        text-align: left;
      }
      .w-video-container {
        flex: 1;
        border: 1px solid #E6E6E6;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .w-video-time {
        text-align: left;
        width: fit-content;
        color: #000;
        font-family: "PingFang SC";
        font-size: 16px;
        font-weight: 400;
        padding: 2px 16px;
        line-height: 20px; /* 125% */
        letter-spacing: 1px;
        margin-top: 12px;
        border-radius: 6px;
        border: 1px solid #E6E6E6;
        background: #F4F4F4;
      }
    }
  }
}
</style>
<style lang="less">
.n-message-container .n-message-wrapper .n-message {
  display: inline-flex !important;
  padding: 7.2px 9.6px !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: -4px !important;
  color: #5E5CE5 !important;
  border-radius: 7.2px !important;
  border: 0.6px solid #5E5CE5 !important;
  background: rgba(243, 243, 243, 0.50) !important;
  box-shadow: 0 3.6px 4.8px 0 rgba(99, 99, 99, 0.29) !important;
  backdrop-filter: blur(16.309690475463867px) !important;
  
  /* Ensure icon and text stay on same line */
  .n-message__icon {
    flex-shrink: 0 !important;
  }
  
  .n-message__content {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
}
</style>

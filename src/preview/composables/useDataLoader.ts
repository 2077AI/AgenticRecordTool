import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { nextTick } from 'vue';
import type { Action } from '../types';
import type { Subtask } from '../types';
import { STORAGE_KEY } from '../constants';

export function useDataLoader(
  actionStack: { value: Action[] },
  chunks: { value: Record<string, any> },
  generateUUID: () => string,
  clearAllTaskData: () => void,
  recordingSessionId: { value: string },
  taskInstruction: { value: string },
  results: { value: Array<{ value: string }> },
  subtasks: { value: Subtask[] },
  subtasksExpanded: { value: string[] },
  deletedActions: { value: Action[] },
  savedAssociations: { value: Array<[string, string]> },
  associations: { value: Array<[string, string]> },
  url: { value: string },
  initPlayer: (url: string) => void,
  i18nTexts: { value: { emptyActions: string } },
  loading: { value: boolean }
) {
  const message = useMessage();
  const savedMetadata = ref<any>(null);
  const isProcessing = ref(false);

  const loadMetadata = async () => {
    const savedState = await chrome.storage.local.get(STORAGE_KEY);
    if (savedState[STORAGE_KEY]) {
      savedMetadata.value = savedState[STORAGE_KEY];
    }
  };

  const processActionChunks = (msg: any) => {
    const index = msg.data.id;
    const chunk = msg.data.chunk;
    chunks.value[index] = JSON.parse(chunk);
    
    const receivedChunks = Object.keys(chunks.value).length;
    const totalChunks = msg.data.total;
    
    // Only log progress for large datasets (>10 chunks) or final chunk
    if (totalChunks > 10 && receivedChunks % 10 === 0) {
      console.log(`📦 Loading... ${receivedChunks}/${totalChunks} chunks`);
    }
    
    if (receivedChunks === totalChunks) {
      // Prevent duplicate processing if already in progress
      if (isProcessing.value) {
        console.warn('⚠️ Duplicate processing attempt blocked (already processing)');
        return;
      }
      
      console.log(`🔄 Processing ${receivedChunks} chunks...`);
      isProcessing.value = true;
      const sortedKeys = Object.keys(chunks.value).sort(
        (a, b) => Number(a) - Number(b)
      );
      
      const newActions = sortedKeys.flatMap((key) => chunks.value[key]).map((action: any, index: number) => {
        if (!action.id) {
          action.id = generateUUID();
        }
        if (action.order === undefined) {
          action.order = index + 1;
        }
        return action;
      });

      const newUrl = msg.data.url;
      const currentRecordingSessionId = msg.data.recordingSessionId;
      const savedRecordingSessionId = savedMetadata.value?.recordingSessionId;
      
      // Use recordingSessionId to determine if it's the same task recording
      // Each recording session has a unique ID generated at recording start
      const isSameTask = savedMetadata.value && 
                        savedRecordingSessionId && 
                        currentRecordingSessionId && 
                        savedRecordingSessionId === currentRecordingSessionId;
      
      // Check if it's new or existing task
      if (!savedMetadata.value) {
        console.log('📝 New task (no cache)');
      } else if (isSameTask) {
        console.log('📝 Same task (restored)', { 
          recordingSessionId: savedRecordingSessionId
        });
      } else {
        console.log('📝 New task (different recording)', {
          oldRecordingSessionId: savedRecordingSessionId,
          newRecordingSessionId: currentRecordingSessionId
        });
        clearAllTaskData();
      }
      
      actionStack.value = newActions;
      url.value = newUrl;
      recordingSessionId.value = currentRecordingSessionId;
      
      if (isSameTask && savedMetadata.value) {
        const data = savedMetadata.value;
        
        taskInstruction.value = data.taskInstruction || '';
        results.value = data.results || [{ value: '' }];
        
        savedAssociations.value = data.savedAssociations || [];
        associations.value = [...savedAssociations.value];
        
        if (data.subtasks && data.subtasks.length > 0) {
          const actionMap = new Map(newActions.map(action => [action.id, action]));
          subtasks.value = data.subtasks.map((savedSubtask: any) => {
            const actions = (savedSubtask.actionIds || [])
              .map((id: string) => actionMap.get(id))
              .filter((action: any) => action !== undefined);
            
            return {
              id: savedSubtask.id,
              order: savedSubtask.order,
              instruction: savedSubtask.instruction || '',
              results: savedSubtask.results || [{ value: '' }],
              actions: actions,
              checked: savedSubtask.checked || false
            };
          });
          
          subtasksExpanded.value = subtasks.value.map(s => s.id);
        }
        
        if (data.deletedActionIds && data.deletedActionIds.length > 0) {
          const actionMap = new Map(newActions.map(action => [action.id, action]));
          const existingDeletedIds = new Set(deletedActions.value.map(a => a.id));
          const restoredDeleted = data.deletedActionIds
            .map((id: string) => actionMap.get(id))
            .filter((action: any) => action !== undefined && !existingDeletedIds.has(action.id));
          
          if (restoredDeleted.length > 0) {
            deletedActions.value.push(...restoredDeleted);
          }
        }
        
        console.log('✅ Data loaded (restored):', {
          recordingSessionId: recordingSessionId.value,
          actions: newActions.length,
          subtasks: subtasks.value.length,
          associations: savedAssociations.value.length
        });
      } else if (!savedMetadata.value) {
        console.log('✅ Data loaded (new):', {
          recordingSessionId: recordingSessionId.value,
          actions: newActions.length
        });
      }
      
      savedMetadata.value = null;
      chunks.value = {};
      
      if (newActions.length === 0 && !newUrl) {
        loading.value = false;
        isProcessing.value = false;
        message.warning(i18nTexts.value.emptyActions, {
          duration: 5000
        });
        console.warn('⚠️ No recording data available');
        return;
      }
      
      if (!newUrl) {
        loading.value = false;
        isProcessing.value = false;
        message.error('Video is not generated!', {
          duration: 5000
        });
        console.error('⚠️ Video URL is missing');
        return;
      }
      
      nextTick(() => {
        initPlayer(url.value);
        loading.value = false;
        isProcessing.value = false;
      });
    }
  };

  return {
    savedMetadata,
    loadMetadata,
    processActionChunks
  };
}


<template>
  <div class="w-task-sidebar" @contextmenu.prevent>
    <div class="w-task-sidebar-title" @click="handleTaskTitleClick">
      <i class="icon-task">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24" fill="none">
          <path d="M6.125 15.75H13.125C13.6082 15.75 14 15.3582 14 14.875C14 14.3918 13.6082 14 13.125 14H6.125C5.64175 14 5.25 14.3918 5.25 14.875C5.25 15.3582 5.64175 15.75 6.125 15.75Z" fill="black"/>
          <path d="M6.125 12.25H13.125C13.6082 12.25 14 11.8582 14 11.375C14 10.8918 13.6082 10.5 13.125 10.5H6.125C5.64175 10.5 5.25 10.8918 5.25 11.375C5.25 11.8582 5.64175 12.25 6.125 12.25Z" fill="black"/>
          <path d="M1.75 3.5H6.125C6.60825 3.5 7 3.10825 7 2.625C7 2.14175 6.60825 1.75 6.125 1.75H1.75C1.02513 1.75 0.512563 2.26256 0.512563 2.26256C0 2.77513 0 3.5 0 3.5V21.875C0 22.5999 0.512564 23.1124 0.512564 23.1124C1.02513 23.625 1.75 23.625 1.75 23.625H17.5C18.2249 23.625 18.7374 23.1124 18.7374 23.1124C19.25 22.5999 19.25 21.875 19.25 21.875V3.5C19.25 2.77513 18.7374 2.26256 18.7374 2.26256C18.2249 1.75 17.5 1.75 17.5 1.75H13.125C12.6418 1.75 12.25 2.14175 12.25 2.625C12.25 3.10825 12.6418 3.5 13.125 3.5H17.5V21.875H1.75V3.5Z" fill="black"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.25 7C4.76675 7 4.375 6.60825 4.375 6.125V5.25C4.375 5.25 4.375 3.07538 5.91269 1.53769C5.91269 1.53769 7.45038 0 9.625 0C9.625 0 11.7996 0 13.3373 1.53769C13.3373 1.53769 14.875 3.07538 14.875 5.25V6.125C14.875 6.60825 14.4832 7 14 7H5.25ZM12.0999 2.77513C12.0999 2.77513 13.125 3.80025 13.125 5.25H6.125C6.125 5.25 6.125 3.80025 7.15013 2.77513C7.15013 2.77513 8.17525 1.75 9.625 1.75C9.625 1.75 11.0747 1.75 12.0999 2.77513Z" fill="black"/>
        </svg>
      </i>
      <span class="w-task-title-link">Task</span>
    </div>
    <div class="w-task-sidebar-container" :style="getContainerStyle()">
      <div class="w-task-sidebar-content">
        <div class="w-task-sidebar-content-item" :style="getContentItemStyle()">
          <!-- association layer -->
          <AssociationLayer
            :associations="associations"
            :subtasks="subtasks"
            :subtask-refs="subtaskRefs"
            :line-render-key="lineRenderKey"
            :is-associating="isAssociating"
            @update:associations="$emit('update:associations', $event)"
          />

          <!-- subtasks -->
          <TaskSidebarItem
            v-for="(subtask, index) in subtasks"
            :key="subtask.id"
            :ref="el => setSubtaskRef(el, subtask.id)"
            :subtask="subtask"
            :index="index"
            :is-associating="isAssociating"
            :is-selected="selectedSubtaskForAssociation === subtask.id"
            @click="handleSubtaskClick"
            @association-click="handleSubtaskAssociationClick"
          />

          <!-- empty -->
          <div v-if="subtasks.length === 0" class="w-task-sidebar-empty">
            No subtasks
          </div>
        </div>
      </div>
    </div>
    <div class="w-task-sidebar-recycle-bin" @click="handleRecycleBinClick">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20.25 4.5H3.75C3.33579 4.5 3 4.83579 3 5.25C3 5.66421 3.33579 6 3.75 6H20.25C20.6642 6 21 5.66421 21 5.25C21 4.83579 20.6642 4.5 20.25 4.5Z" fill="#000"/>
        <path d="M9 9.75V15.75C9 16.1642 9.33579 16.5 9.75 16.5C10.1642 16.5 10.5 16.1642 10.5 15.75V9.75C10.5 9.33579 10.1642 9 9.75 9C9.33579 9 9 9.33579 9 9.75Z" fill="#000"/>
        <path d="M13.5 9.75V15.75C13.5 16.1642 13.8358 16.5 14.25 16.5C14.6642 16.5 15 16.1642 15 15.75V9.75C15 9.33579 14.6642 9 14.25 9C13.8358 9 13.5 9.33579 13.5 9.75Z" fill="#000"/>
        <path d="M6 19.5V5.25C6 4.83579 5.66421 4.5 5.25 4.5C4.83579 4.5 4.5 4.83579 4.5 5.25V19.5C4.5 20.1213 4.93934 20.5607 4.93934 20.5607C5.37868 21 6 21 6 21H18C18.6213 21 19.0607 20.5607 19.0607 20.5607C19.5 20.1213 19.5 19.5 19.5 19.5V5.25C19.5 4.83579 19.1642 4.5 18.75 4.5C18.3358 4.5 18 4.83579 18 5.25V19.5H6Z" fill="#000"/>
        <path d="M8.15901 2.15901C7.5 2.81802 7.5 3.75 7.5 3.75V5.25C7.5 5.66421 7.83579 6 8.25 6C8.66421 6 9 5.66421 9 5.25V3.75C9 3.43934 9.21967 3.21967 9.21967 3.21967C9.43934 3 9.75 3 9.75 3H14.25C14.5607 3 14.7803 3.21967 14.7803 3.21967C15 3.43934 15 3.75 15 3.75V5.25C15 5.66421 15.3358 6 15.75 6C16.1642 6 16.5 5.66421 16.5 5.25V3.75C16.5 2.81802 15.841 2.15901 15.841 2.15901C15.182 1.5 14.25 1.5 14.25 1.5H9.75C8.81802 1.5 8.15901 2.15901 8.15901 2.15901Z" fill="#000"/>
      </svg>
      <span>Recycle Bin</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch, toRefs, computed, onUnmounted } from "vue";
import { useAssociations } from "../../composables/useAssociations";
import { type Subtask } from "../../types";
import AssociationLayer from "./AssociationLayer.vue";
import TaskSidebarItem from "./TaskSidebarItem.vue";

const props = defineProps<{
  subtasks: Subtask[];
  isAssociating: boolean;
  associations: Array<[string, string]>;
  selectedSubtaskForAssociation: string | null;
}>();

const emit = defineEmits<{
  'update:associations': [value: Array<[string, string]>];
  'update:selectedSubtaskForAssociation': [value: string | null];
  'open-recycle-bin': [];
  'scroll-to-subtask': [subtaskId: string];
  'scroll-to-task': [];
}>();

const { associations, subtasks } = toRefs(props);
const subtaskRefs = ref<Record<string, HTMLElement>>({});
const { getMaxOverlapLevel, clearCache } = useAssociations(associations, subtasks, subtaskRefs);
const lineRenderKey = ref(0);

let renderThrottleTimer: number | null = null;
const throttleLineRender = () => {
  if (renderThrottleTimer !== null) return;
  renderThrottleTimer = window.setTimeout(() => {
    lineRenderKey.value++;
    renderThrottleTimer = null;
  }, 16);
};

const setSubtaskRef = (el: any, subtaskId: string) => {
  // el is the TaskSidebarItem component, we need the underlying HTMLElement
  if (el && el.$el) {
    subtaskRefs.value[subtaskId] = el.$el;
  }
};

// handle subtask association click
const handleSubtaskAssociationClick = (subtaskId: string) => {
  if (!props.selectedSubtaskForAssociation) {
    emit('update:selectedSubtaskForAssociation', subtaskId);
  } else {
    if (props.selectedSubtaskForAssociation === subtaskId) {
      emit('update:selectedSubtaskForAssociation', null);
    } else {
      const id1 = props.selectedSubtaskForAssociation;
      const id2 = subtaskId;
      const exists = props.associations.some(([a, b]) => a === id1 && b === id2);
      
      if (!exists) {
        const newAssociations = [...props.associations, [id1, id2] as [string, string]];
        emit('update:associations', newAssociations);
        clearCache();
        nextTick(() => { throttleLineRender(); });
      }
      emit('update:selectedSubtaskForAssociation', null);
    }
  }
};

const associationsKey = computed(() => {
  return props.associations.map(a => `${a[0]}-${a[1]}`).join('|');
});

watch(associationsKey, () => {
  clearCache();
  nextTick(() => { throttleLineRender(); });
});

watch(() => props.isAssociating, (newVal) => {
  if (newVal) {
    clearCache();
    nextTick(() => {
      setTimeout(() => {
        lineRenderKey.value++;
      }, 50);
    });
  }
});

const subtaskIdsKey = computed(() => props.subtasks.map(s => s.id).join(','));

// Clear associations when subtask is deleted
watch(subtaskIdsKey, (newKey, oldKey) => {
  if (!oldKey || newKey === oldKey) return;
  
  const newSubtaskIds = props.subtasks.map(s => s.id);
  const oldSubtaskIds = oldKey.split(',').filter(Boolean);
  
  const hasDeleted = oldSubtaskIds.some(id => !newSubtaskIds.includes(id));
  if (!hasDeleted && props.associations.length === 0) return;
  
  // Filter out valid associations (both subtasks exist)
  const validAssociations = props.associations.filter(([id1, id2]) => 
    newSubtaskIds.includes(id1) && newSubtaskIds.includes(id2)
  );
  
  // Only update when association count changes
  if (validAssociations.length !== props.associations.length) {
    emit('update:associations', validAssociations);
    clearCache();
    nextTick(() => { throttleLineRender(); });
  }
  
  // Clear selected subtask (if deleted)
  if (props.selectedSubtaskForAssociation && !newSubtaskIds.includes(props.selectedSubtaskForAssociation)) {
    emit('update:selectedSubtaskForAssociation', null);
  }
}, { immediate: false });

// Get the style of the container (dynamic padding-left based on association mode)
const getContainerStyle = () => {
  const hasConnections = props.associations.length > 0;
  const isEmpty = props.subtasks.length === 0;
  return {
    paddingLeft: (hasConnections || isEmpty) ? '12px' : '32px',
  };
};

// Get the width of the content item
const getContentItemStyle = () => {
  if (props.associations.length === 0) return {};
  const maxOverlapLevel = getMaxOverlapLevel();
  const baseWidth = 7;
  const maxWidth = baseWidth + maxOverlapLevel * 4;
  const areaWidth = maxWidth + 20;
  return {
    paddingLeft: `${areaWidth}px`,
  };
};

const handleRecycleBinClick = () => {
  emit('open-recycle-bin');
};

const handleSubtaskClick = (subtaskId: string) => {
  if (!props.isAssociating) {
    emit('scroll-to-subtask', subtaskId);
  }
};

const handleTaskTitleClick = () => {
  emit('scroll-to-task');
};

onUnmounted(() => {
  if (renderThrottleTimer !== null) {
    clearTimeout(renderThrottleTimer);
  }
});
</script>

<style lang="less" scoped>
.w-task-sidebar {
  min-width: 180px;
  max-width: 200px;
  height: 100%;
  border-right: 1px solid rgba(0, 0, 0, 0.10);
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .w-task-sidebar-title {
    display: flex;
    align-items: center;
    padding-left: 26px;
    height: 59px;
    gap: 8px;
    font-size: 20px;
    font-weight: 400;
    color: #000;
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 1px;
      background: #E2E2E2;
    }
    
    .icon-task {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        width: 100%;
        height: 100%;
      }
    }
    
    .w-task-title-link {
      cursor: pointer;
      transition: color 0.2s ease;
      
      &:hover {
        color: #5E5CE5;
      }
    }
  }
  
  .w-task-sidebar-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    min-height: 0;
    padding: 12px 12px 12px;
    
    /* Custom scrollbar styles */
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
    
    /* Chrome, Safari, Opera */
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
    }
    
    .w-task-sidebar-content {
      min-height: 100%;
      
      .w-task-sidebar-content-item {
        font-size: 16px;
        color: #6b7280;
        line-height: 1.8;
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        min-width: max-content;

        .w-task-sidebar-empty {
          color: #9ca3af;
          font-style: italic;
          text-align: center;
          padding: 20px 0;
        }
      }
    }
  }
  
  .w-task-sidebar-recycle-bin {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 12px;
    border-top: 1px solid #E6E6E6;
    background: #FFF;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s ease;
    
    svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      
      path {
        fill: #000;
        transition: fill 0.2s ease;
      }
    }
    
    span {
      color: #000000B2;
      font-family: "PingFang SC";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
      transition: color 0.2s ease;
    }
    
    &:hover {
      svg path {
        fill: #5E5CE5;
      }
      
      span {
        color: #5E5CE5;
      }
    }
  }
}
</style>

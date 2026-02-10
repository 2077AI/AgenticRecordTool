<template>
  <div 
    class="w-association-area" 
    v-if="associations.length > 0"
    :style="areaStyle"
  >
    <!-- lines -->
    <div 
      v-for="(assoc, index) in associations" 
      :key="`line-${assoc[0]}-${assoc[1]}-${index}-${lineRenderKey}`"
      class="w-association-line"
      :class="{ 
        'w-association-line-hovered': hoveredLineIndex === index,
        'w-association-line-deleting': contextMenuLineIndex === index
      }"
      :style="lineStyles[index]"
      @mouseenter="hoveredLineIndex = index"
      @mouseleave="hoveredLineIndex = null"
      @contextmenu.prevent="handleLineContextMenu($event, index)"
    ></div>

    <!-- arrows -->
    <svg
      v-for="(assoc, index) in associations"
      :key="`arrow-${assoc[0]}-${assoc[1]}-${index}`"
      class="w-association-arrow"
      :class="{ 
        'w-association-arrow-hovered': hoveredLineIndex === index,
        'w-association-arrow-deleting': contextMenuLineIndex === index
      }"
      :style="arrowStyles[index]"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      @mouseenter="hoveredLineIndex = index"
      @mouseleave="hoveredLineIndex = null"
      @contextmenu.prevent="handleLineContextMenu($event, index)"
    >
      <path d="M4 2L8 6L4 10" stroke="#B5B5B5" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>

    <!-- Context menu for deleting association -->
    <div 
      v-if="contextMenuVisible"
      class="w-association-context-menu"
      :style="contextMenuStyle"
      @click.stop
    >
      <NButton 
        class="w-association-delete-btn"
        @click="handleDeleteAssociation"
        :show="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 3H2.5C2.22386 3 2 3.22386 2 3.5C2 3.77614 2.22386 4 2.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3Z" fill="currentColor"/>
          <path d="M6 6.5V10.5C6 10.7761 6.22386 11 6.5 11C6.77614 11 7 10.7761 7 10.5V6.5C7 6.22386 6.77614 6 6.5 6C6.22386 6 6 6.22386 6 6.5Z" fill="currentColor"/>
          <path d="M9 6.5V10.5C9 10.7761 9.22386 11 9.5 11C9.77614 11 10 10.7761 10 10.5V6.5C10 6.22386 9.77614 6 9.5 6C9.22386 6 9 6.22386 9 6.5Z" fill="currentColor"/>
          <path d="M4 13V3.5C4 3.22386 3.77614 3 3.5 3C3.22386 3 3 3.22386 3 3.5V13C3 13.4142 3.29289 13.7071 3.29289 13.7071C3.58579 14 4 14 4 14H12C12.4142 14 12.7071 13.7071 12.7071 13.7071C13 13.4142 13 13 13 13V3.5C13 3.22386 12.7761 3 12.5 3C12.2239 3 12 3.22386 12 3.5V13H4Z" fill="currentColor"/>
          <path d="M5.43934 1.43934C5 1.87868 5 2.5 5 2.5V3.5C5 3.77614 5.22386 4 5.5 4C5.77614 4 6 3.77614 6 3.5V2.5C6 2.29289 6.14645 2.14645 6.14645 2.14645C6.29289 2 6.5 2 6.5 2H9.5C9.70711 2 9.85355 2.14645 9.85355 2.14645C10 2.29289 10 2.5 10 2.5V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V2.5C11 1.87868 10.5607 1.43934 10.5607 1.43934C10.1213 1 9.5 1 9.5 1H6.5C5.87868 1 5.43934 1.43934 5.43934 1.43934Z" fill="currentColor"/>
        </svg>
        <span>Delete</span>
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, toRefs, onMounted, onUnmounted } from "vue";
import { NButton } from "naive-ui";
import { useAssociations } from "../../composables/useAssociations";
import { type Subtask } from "../../types";

const props = defineProps<{
  associations: Array<[string, string]>;
  subtasks: Subtask[];
  subtaskRefs: Record<string, HTMLElement>;
  lineRenderKey: number;
  isAssociating: boolean;
}>();

const emit = defineEmits<{
  'update:associations': [value: Array<[string, string]>];
}>();

const { associations, subtasks, subtaskRefs } = toRefs(props);
const { 
  getAssociationLineStyle, 
  getAssociationArrowStyle, 
  getMaxOverlapLevel 
} = useAssociations(associations, subtasks, subtaskRefs);

const hoveredLineIndex = ref<number | null>(null);
const contextMenuVisible = ref(false);
const contextMenuStyle = ref({ top: '0px', left: '0px' });
const contextMenuLineIndex = ref<number | null>(null);

const lineStyles = computed(() => {
  if (props.associations.length === 0) return [];
  void props.lineRenderKey;
  return props.associations.map((assoc, index) => 
    getAssociationLineStyle(assoc[0], assoc[1], index)
  );
});

const arrowStyles = computed(() => {
  if (props.associations.length === 0) return [];
  void props.lineRenderKey;
  return props.associations.map((assoc, index) => 
    getAssociationArrowStyle(assoc[0], assoc[1], index)
  );
});

const areaStyle = computed(() => {
  if (props.associations.length === 0) return {};
  const maxOverlapLevel = getMaxOverlapLevel();
  const baseWidth = 7;
  const maxWidth = baseWidth + maxOverlapLevel * 4;
  return {
    width: `${maxWidth + 20}px`,
  };
});

const handleLineContextMenu = (event: MouseEvent, lineIndex: number) => {
  event.preventDefault();
  
  // Only show context menu in editing mode
  if (!props.isAssociating) {
    console.log('ℹ️ Cannot delete association in view mode. Enter edit mode first.');
    return;
  }
  
  contextMenuLineIndex.value = lineIndex;

  const containerEl = (event.target as HTMLElement).closest('.w-task-sidebar-content-item');
  if (!containerEl) return;
  
  const containerRect = containerEl.getBoundingClientRect();
  const menuWidth = 63;
  const menuHeight = 32;
  
  let menuX = event.clientX - containerRect.left;
  let menuY = event.clientY - containerRect.top;
  
  if (menuX + menuWidth > containerRect.width) menuX = containerRect.width - menuWidth - 8;
  if (menuY + menuHeight > containerRect.height) menuY = containerRect.height - menuHeight - 8;
  if (menuX < 8) menuX = 8;
  if (menuY < 8) menuY = 8;
  
  contextMenuStyle.value = {
    top: `${menuY}px`,
    left: `${menuX}px`,
  };
  contextMenuVisible.value = true;
};

const handleDeleteAssociation = () => {
  if (contextMenuLineIndex.value === null) return;
  const deletedAssoc = props.associations[contextMenuLineIndex.value];
  const newAssociations = [...props.associations];
  newAssociations.splice(contextMenuLineIndex.value, 1);
  console.log('🗑️ Remove association:', { 
    from: deletedAssoc[0], 
    to: deletedAssoc[1],
    remaining: newAssociations.length 
  });
  emit('update:associations', newAssociations);
  contextMenuVisible.value = false;
  contextMenuLineIndex.value = null;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.w-association-context-menu') && 
      !target.closest('.w-association-line') && 
      !target.closest('.w-association-arrow')) {
    contextMenuVisible.value = false;
    contextMenuLineIndex.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('contextmenu', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('contextmenu', handleClickOutside);
});
</script>

<style lang="less" scoped>
.w-association-area {
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  
  .w-association-line {
    position: absolute;
    border-left: 1px solid #B5B5B5;
    border-top: 1px solid #B5B5B5;
    border-bottom: 1px solid #B5B5B5;
    box-sizing: border-box;
    pointer-events: auto;
    background: transparent;
    cursor: pointer;
    transition: border-color 0.2s ease;
    
    &:hover,
    &.w-association-line-hovered {
      border-left-color: #5C83E5;
      border-top-color: #5C83E5;
      border-bottom-color: #5C83E5;
      z-index: 10000 !important;
    }
    
    &.w-association-line-deleting {
      border-left-color: #FA6464;
      border-top-color: #FA6464;
      border-bottom-color: #FA6464;
      z-index: 10000 !important;
    }
  }
  
  .w-association-arrow {
    position: absolute;
    pointer-events: auto;
    cursor: pointer;
    
    path {
      stroke: #B5B5B5;
      transition: stroke 0.2s ease;
    }
    
    &:hover path,
    &.w-association-arrow-hovered path {
      stroke: #5C83E5;
    }
    
    &:hover,
    &.w-association-arrow-hovered {
      z-index: 10000 !important;
    }
    
    &.w-association-arrow-deleting {
      z-index: 10000 !important;
      path {
        stroke: #FA6464;
      }
    }
  }

  .w-association-context-menu {
    position: absolute;
    width: 63px;
    height: 32px;
    z-index: 10001;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;

    :deep(.w-association-delete-btn) {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      gap: 4px;
      width: 100%;
      height: 100%;
      padding: 0;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.13);
      --n-border-radius: 9px !important;
      --n-border: 1px solid #E6E6E6 !important;
      --n-border-hover: 1px solid #FA6464 !important;
      --n-border-pressed: 1px solid #FA6464 !important;
      --n-border-focus: 1px solid #FA6464 !important;
      --n-color: #FFFFFF !important;
      --n-color-hover: #FFFFFF !important;
      --n-color-pressed: #FFFFFF !important;
      --n-color-focus: #FFFFFF !important;
      --n-text-color: #FA6464 !important;
      --n-text-color-hover: #FA6464 !important;
      --n-text-color-pressed: #FA6464 !important;
      --n-text-color-focus: #FA6464 !important;

      svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      span {
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
      }
    }
  }
}
</style>


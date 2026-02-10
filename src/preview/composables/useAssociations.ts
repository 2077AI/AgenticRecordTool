import { type Ref, computed, ref } from "vue";
import type { Subtask } from '../types';

export function useAssociations(
  associations: Ref<Array<[string, string]>>,
  subtasks: Ref<Subtask[]>,
  subtaskRefs: Ref<Record<string, HTMLElement>>
) {
  // Cache: mapping from subtask ID to index
  const subtaskIdToIndexMap = computed(() => {
    const map = new Map<string, number>();
    subtasks.value.forEach((subtask, index) => {
      map.set(subtask.id, index);
    });
    return map;
  });

  // Cache: overlap level calculation results
  const overlapLevelsCache = ref<Map<string, number>>(new Map());
  const layoutConstantsCache = ref<any>(null);
  const layoutCacheKey = ref<string>('');

  // Generate cache key (based on associations and subtasks)
  const getCacheKey = () => {
    return `${associations.value.map(a => a.join('-')).join('|')}-${subtasks.value.map(s => s.id).join(',')}`;
  };

  // Checks if two connection lines overlap by comparing their subtask index ranges
  const checkOverlapTwo = (line1: [string, string], line2: [string, string]): boolean => {
    const map = subtaskIdToIndexMap.value;
    const index1_1 = map.get(line1[0]) ?? -1;
    const index1_2 = map.get(line1[1]) ?? -1;
    const index2_1 = map.get(line2[0]) ?? -1;
    const index2_2 = map.get(line2[1]) ?? -1;
    
    if (index1_1 === -1 || index1_2 === -1 || index2_1 === -1 || index2_2 === -1) {
      return false;
    }
    
    const min1 = Math.min(index1_1, index1_2);
    const max1 = Math.max(index1_1, index1_2);
    const min2 = Math.min(index2_1, index2_2);
    const max2 = Math.max(index2_1, index2_2);
    
    return !(max1 < min2 || max2 < min1);
  };

  // Calculate the overlap level of the current line (WITH CACHING)
  const getOverlapLevel = (currentLineIndex: number): number => {
    const cacheKey = getCacheKey();
    const levelCacheKey = `${cacheKey}-${currentLineIndex}`;
    
    // Check cache
    if (overlapLevelsCache.value.has(levelCacheKey)) {
      return overlapLevelsCache.value.get(levelCacheKey)!;
    }
    
    const currentLine = associations.value[currentLineIndex];
    
    // Check if it overlaps with previous lines
    let hasOverlap = false;
    for (let i = 0; i < currentLineIndex; i++) {
      if (checkOverlapTwo(associations.value[i], currentLine)) {
        hasOverlap = true;
        break;
      }
    }
    
    if (!hasOverlap) {
      overlapLevelsCache.value.set(levelCacheKey, 0);
      return 0;
    }
    
    // Calculate maximum overlap level (non-recursive version)
    let maxLevel = 0;
    for (let i = 0; i < currentLineIndex; i++) {
      if (checkOverlapTwo(associations.value[i], currentLine)) {
        const prevLevel = getOverlapLevel(i); // Cache will be used here
        maxLevel = Math.max(maxLevel, prevLevel);
      }
    }
    
    const level = maxLevel + 1;
    overlapLevelsCache.value.set(levelCacheKey, level);
    return level;
  };

  // Get the maximum overlap level (WITH CACHING)
  const getMaxOverlapLevel = (): number => {
    const cacheKey = getCacheKey();
    const maxLevelCacheKey = `${cacheKey}-max`;
    
    if (overlapLevelsCache.value.has(maxLevelCacheKey)) {
      return overlapLevelsCache.value.get(maxLevelCacheKey)!;
    }
    
    let maxLevel = 0;
    for (let i = 0; i < associations.value.length; i++) {
      const level = getOverlapLevel(i);
      maxLevel = Math.max(maxLevel, level);
    }
    
    overlapLevelsCache.value.set(maxLevelCacheKey, maxLevel);
    return maxLevel;
  };

  // Helper function to clear cache
  const clearCache = () => {
    overlapLevelsCache.value.clear();
    layoutConstantsCache.value = null;
    layoutCacheKey.value = '';
  };

  // Get common layout constants (WITH CACHING)
  const getLineLayoutConstants = () => {
    const cacheKey = `layout-${subtasks.value.map(s => s.id).join(',')}`;
    
    // If cached key matches and cache exists, return directly
    if (layoutCacheKey.value === cacheKey && layoutConstantsCache.value) {
      return layoutConstantsCache.value;
    }
    
    const firstSubtaskId = subtasks.value[0]?.id;
    if (!firstSubtaskId) return null;
    
    const el1 = subtaskRefs.value[firstSubtaskId];
    if (!el1) return null;
    
    const containerEl = el1.closest('.w-task-sidebar-content-item');
    if (!containerEl) return null;
    
    const areaEl = containerEl.querySelector('.w-association-area');
    if (!areaEl) return null;
    
    // Use offsetLeft and offsetWidth to calculate relative position (not affected by scrolling)
    const firstSubtaskLeft = el1.offsetLeft;
    const areaRight = (areaEl as HTMLElement).offsetLeft + (areaEl as HTMLElement).offsetWidth;
    
    const result = {
      containerEl,
      firstSubtaskLeft,
      areaRight,
    };
    
    // Update cache
    layoutConstantsCache.value = result;
    layoutCacheKey.value = cacheKey;
    
    return result;
  };

  // Get the style of the association line (optimized version - using offsetTop)
  const getAssociationLineStyle = (subtaskId1: string, subtaskId2: string, lineIndex: number) => {
    const el1 = subtaskRefs.value[subtaskId1];
    const el2 = subtaskRefs.value[subtaskId2];
    if (!el1 || !el2) return { display: 'none' };
    
    const layoutConstants = getLineLayoutConstants();
    if (!layoutConstants) return { display: 'none' };
    
    const { containerEl, firstSubtaskLeft, areaRight } = layoutConstants;
    
    // Use offsetTop to calculate position relative to container (not affected by scrolling)
    const getOffsetTop = (element: HTMLElement): number => {
      let top = 0;
      let currentElement: HTMLElement | null = element;
      while (currentElement && currentElement !== containerEl) {
        top += currentElement.offsetTop;
        currentElement = currentElement.offsetParent as HTMLElement;
      }
      return top;
    };
    
    const offset1 = getOffsetTop(el1);
    const offset2 = getOffsetTop(el2);
    const height1 = el1.offsetHeight;
    const height2 = el2.offsetHeight;
    
    const center1 = Math.round(offset1 + height1 / 2);
    const center2 = Math.round(offset2 + height2 / 2);
    const topCenter = Math.min(center1, center2);
    const bottomCenter = Math.max(center1, center2);
    
    const overlapLevel = getOverlapLevel(lineIndex);
    const baseWidth = 7;
    const lineWidth = baseWidth + overlapLevel * 4;
    const distance = firstSubtaskLeft - areaRight;
    const width = distance > 0 ? distance + lineWidth : lineWidth;
    const zIndex = 1000 - overlapLevel;
    
    return {
      top: `${Math.max(0, topCenter)}px`,
      right: '0px',
      height: `${Math.max(1, bottomCenter - topCenter + 1)}px`,
      width: `${Math.max(7, width)}px`,
      zIndex: `${zIndex}`,
    };
  };

  // Get the style of the association arrow (optimized version - using offsetTop)
  const getAssociationArrowStyle = (subtaskId1: string, subtaskId2: string, lineIndex: number) => {
    const el1 = subtaskRefs.value[subtaskId1];
    const el2 = subtaskRefs.value[subtaskId2];
    if (!el1 || !el2) return { display: 'none' };
    
    const layoutConstants = getLineLayoutConstants();
    if (!layoutConstants) return { display: 'none' };
    
    const { containerEl } = layoutConstants;
    
    // Use offsetTop to calculate position relative to container (not affected by scrolling)
    const getOffsetTop = (element: HTMLElement): number => {
      let top = 0;
      let currentElement: HTMLElement | null = element;
      while (currentElement && currentElement !== containerEl) {
        top += currentElement.offsetTop;
        currentElement = currentElement.offsetParent as HTMLElement;
      }
      return top;
    };
    
    const offset2 = getOffsetTop(el2);
    const height2 = el2.offsetHeight;
    const center2 = Math.round(offset2 + height2 / 2);
    
    const overlapLevel = getOverlapLevel(lineIndex);
    const zIndex = 1000 - overlapLevel;
    
    return {
      top: `${center2 - 5.5}px`,
      right: '-4.5px',
      zIndex: `${zIndex}`,
    };
  };

  return {
    getMaxOverlapLevel,
    getOverlapLevel,
    getAssociationLineStyle,
    getAssociationArrowStyle,
    getLineLayoutConstants,
    clearCache,
    subtaskIdToIndexMap
  };
}


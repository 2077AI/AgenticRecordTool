// HTML diff calculation tool
export class HTMLDiffer {
  private previousHTML: string = '';
  private isFirstCapture: boolean = true;

  /**
   * Calculate HTML diff
   * @param currentHTML Current HTML
   * @returns Diff object or full HTML (first time)
   */
  public getDiff(currentHTML: string): HTMLDiffResult {
    if (this.isFirstCapture) {
      this.previousHTML = currentHTML;
      this.isFirstCapture = false;
      return {
        type: 'full',
        content: currentHTML,
        size: currentHTML.length
      };
    }

    if (currentHTML === this.previousHTML) {
      return {
        type: 'no-change',
        content: null,
        size: 0
      };
    }

    const diff = this.calculateStringDiff(this.previousHTML, currentHTML);
    this.previousHTML = currentHTML;

    return {
      type: 'diff',
      content: diff,
      size: JSON.stringify(diff).length
    };
  }

  /**
   * Simple string diff algorithm
   */
  private calculateStringDiff(oldStr: string, newStr: string): StringDiff {
    // Simplified version using LCS (Longest Common Subsequence)
    const changes: DiffOperation[] = [];
    
    // Compare by chunks (split by tags)
    const oldChunks = this.splitByTags(oldStr);
    const newChunks = this.splitByTags(newStr);
    
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldChunks.length || newIndex < newChunks.length) {
      if (oldIndex >= oldChunks.length) {
        // Only new content left
        changes.push({
          type: 'insert',
          position: oldIndex,
          content: newChunks.slice(newIndex).join('')
        });
        break;
      } else if (newIndex >= newChunks.length) {
        // Only old content left to delete
        changes.push({
          type: 'delete',
          position: oldIndex,
          length: oldChunks.length - oldIndex
        });
        break;
      } else if (oldChunks[oldIndex] === newChunks[newIndex]) {
        // Content is the same, continue
        oldIndex++;
        newIndex++;
      } else {
        // Found a difference point
        const commonSuffix = this.findCommonSuffix(
          oldChunks.slice(oldIndex),
          newChunks.slice(newIndex)
        );
        
        if (commonSuffix.length > 0) {
          // Has common suffix, this is a replace operation
          const oldContent = oldChunks.slice(oldIndex, oldChunks.length - commonSuffix.length).join('');
          const newContent = newChunks.slice(newIndex, newChunks.length - commonSuffix.length).join('');
          
          changes.push({
            type: 'replace',
            position: oldIndex,
            oldContent,
            newContent
          });
          
          oldIndex = oldChunks.length - commonSuffix.length;
          newIndex = newChunks.length - commonSuffix.length;
        } else {
          // Simple replace
          changes.push({
            type: 'replace',
            position: oldIndex,
            oldContent: oldChunks[oldIndex],
            newContent: newChunks[newIndex]
          });
          oldIndex++;
          newIndex++;
        }
      }
    }
    
    return {
      changes,
      originalLength: oldStr.length,
      newLength: newStr.length
    };
  }

  private splitByTags(html: string): string[] {
    // Split by HTML tags, keeping tag integrity
    return html.split(/(<[^>]*>)/).filter(chunk => chunk.length > 0);
  }

  private findCommonSuffix(arr1: string[], arr2: string[]): string[] {
    const result: string[] = [];
    let i = arr1.length - 1;
    let j = arr2.length - 1;
    
    while (i >= 0 && j >= 0 && arr1[i] === arr2[j]) {
      result.unshift(arr1[i]);
      i--;
      j--;
    }
    
    return result;
  }

  /**
   * Reset state (called when a new recording session starts)
   */
  public reset(): void {
    this.previousHTML = '';
    this.isFirstCapture = true;
  }
}

// Type definitions
export interface HTMLDiffResult {
  type: 'full' | 'diff' | 'no-change';
  content: string | StringDiff | null;
  size: number;
}

export interface StringDiff {
  changes: DiffOperation[];
  originalLength: number;
  newLength: number;
}

export interface DiffOperation {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
  oldContent?: string;
  newContent?: string;
}

// Global instance
export const htmlDiffer = new HTMLDiffer();
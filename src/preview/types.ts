export interface Subtask {
  id: string;
  order?: number;
  instruction: string;
  results: Array<{ value: string }>;
  actions: any[];
  checked: boolean;
}

export interface Action {
  id?: string;
  type?: string;
  time?: number;
  url?: string;
  info?: any;
  rawHtml?: string;
  order?: number;
  [key: string]: any;
}

export interface TaskState {
  recordingSessionId: string;
  taskInstruction: string;
  results: Array<{ value: string }>;
  subtasks: Array<{
    id: string;
    order?: number;
    instruction: string;
    results: Array<{ value: string }>;
    actionIds: string[];
    checked: boolean;
  }>;
  deletedActionIds: string[];
  savedAssociations: Array<[string, string]>;
  url: string;
}


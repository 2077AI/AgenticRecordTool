export enum EventTypes {
  MOUSE_DOWM = "MOUSE_DOWN",
  MOUSE_UP = "MOUSE_UP",
  KEY_DOWN = "KEY_DOWN",
  MOUSE_DRAG = "MOUSE_DRAG",
  INPUT = "INPUT",
  WHEEL = "WHEEL",
  CONTEXT_MENU = "CONTEXT_MENU",
  TAB_CHANGE = "TAB_CHANGE",
  NAVIGATOR = "NAVIGATOR",
  RESULT_STATE = "RESULT_STATE",
}

export enum DRAW_TYPE {
  CGAT_INSTRUCT_LABLE = "CGAT_INSTRUCT_LABLE",
  CGAT_SUB_TASK_LABLE = "CGAT_SUB_TASK_LABLE",
}
export type RECORD_STATUS = {
  labelId: string;
  taskName: string;
  itemId: String
  recording: boolean
};

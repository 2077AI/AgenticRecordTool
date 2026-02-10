// English-only internationalization manager

interface I18nMessages {
  [key: string]: {
    message: string;
    description?: string;
  };
}

// English internationalization data only
const i18nData: I18nMessages = {
  extension_name: {
    message: "Recording Extension",
    description: "Extension name",
  },
  extension_description: {
    message: "Chrome extension for recording and replaying user actions",
    description: "Extension description",
  },
  status_unlabeled: { message: "Unlabeled", description: "Unlabeled status" },
  status_labeling: { message: "Labeling", description: "Labeling status" },
  status_unfixed: { message: "Unfixed", description: "Unfixed status" },
  status_fixing: { message: "Fixing", description: "Fixing status" },
  open_web_version: {
    message: "Open Web Version",
    description: "Open web version",
  },
  start_capture: {
    message: "Start Capture",
    description: "Start capture button",
  },
  complete_capture: {
    message: "Complete Capture",
    description: "Complete capture button",
  },
  submit_data: { message: "Submit Data", description: "Submit data button" },
  save_data: { message: "Save Data", description: "Save data" },
  upload_progress: {
    message: "Upload Progress",
    description: "Upload progress",
  },
  insert_button: { message: "Insert", description: "Insert button" },
  event_type: { message: "Event Type", description: "Event type" },
  time_label: { message: "Time", description: "Time label" },
  insert_behavior: {
    message: "Insert Behavior",
    description: "Insert Behavior",
  },
  confirm_button: { message: "Confirm", description: "Confirm Button" },
  cancel_button: { message: "Cancel", description: "Cancel Button" },
  text_search: { message: "Text Search", description: "Text Search" },
  item_data: { message: "Item Data", description: "Item Data" },
  select_status: { message: "Select Status", description: "Select Status" },
  input_task_name: {
    message: "Enter task name",
    description: "Enter task name",
  },
  search_button: { message: "Search", description: "Search Button" },
  task_name: { message: "Task Name", description: "Task Name" },
  item_number: { message: "Item Number", description: "Item Number" },
  label_status: { message: "Label Status", description: "Label Status" },
  update_time: { message: "Update Time", description: "Update Time" },
  copy_success: { message: "Copy Success", description: "Copy Success" },
  skip_button: { message: "Skip", description: "Skip Button" },
  confirm_skip: { message: "Confirm Skip?", description: "Confirm Skip" },
  open_link: { message: "Open Link", description: "Open Link" },
  view_button: { message: "View", description: "View Button" },
  remove_button: { message: "Delete", description: "Delete Button" },
  content_label: { message: "Content", description: "Content Label" },
  xpath_label: { message: "XPath", description: "XPath Label" },
  alt_key_label: { message: "Alt Key", description: "Alt Key Label" },
  ctrl_key_label: { message: "Ctrl Key", description: "Ctrl Key Label" },
  meta_key_label: { message: "Meta Key", description: "Meta Key Label" },
  key_label: { message: "Key", description: "Key Label" },
  task_id: { message: "Task ID", description: "Task ID" },
  annotator: { message: "Annotator", description: "Annotator" },
  item_id: { message: "Item ID", description: "Item ID" },
  item_status: { message: "Item Status", description: "Item Status" },
  confirm: { message: "Confirm", description: "Confirm" },
  cancel: { message: "Cancel", description: "Cancel" },
  abandon: { message: "Abandon", description: "Abandon" },
  confirm_abandon: {
    message: "Confirm Abandon?",
    description: "Confirm Abandon",
  },
  skip: { message: "Skip", description: "Skip" },
  task_list: { message: "Task List", description: "Task List" },
  recording: { message: "Recording", description: "Recording" },
  recorded: { message: "Recorded", description: "Recorded" },
  not_recorded: { message: "Not Recorded", description: "Not Recorded" },
  receive_success: {
    message: "Receive Success",
    description: "Receive Success",
  },
  abandon_success: {
    message: "Abandon Success",
    description: "Abandon Success",
  },
  skip_success: { message: "Skip Success", description: "Skip Success" },
  search_count: { message: "Search Count", description: "Search Count" },
  loading_data: { message: "Loading Data", description: "Loading Data" },
  save_success: { message: "Save Success", description: "Save Success" },
  upload_data_title: { message: "Upload Data", description: "Upload Data" },
  uploading_message: {
    message: "Uploading data, please wait patiently...",
    description: "Uploading message",
  },
  complete_button: { message: "Complete", description: "Complete button" },
  annotation_status: { message: "Annotation Status", description: "Annotation status" },
  selected_items: { message: "Selected {count}", description: "Number of selected items" },
  recording_screen: { message: "Screen Recording", description: "Recording screen title" },
  download_data: { message: "Download Data", description: "Download data button" },
  associate: { message: "Associate", description: "Associate button" },
  save_associate: { message: "Save Associate", description: "Save associate button" },
  ungroup: { message: "Ungroup", description: "Ungroup button" },
  group: { message: "Group", description: "Group button" },
  recycle_bin: { message: "Recycle Bin", description: "Recycle bin button" },
  restore: { message: "Restore", description: "Restore button" },
  linking_mode_message: { message: "You are now in associating mode. Click the + before a Subtask to create association.", description: "Associating mode message" },
  operation_successful: { message: "Operation successful", description: "Operation successful message" },
  download_successful: { message: "Data downloaded successfully", description: "Download successful message" },
  instruction_description: { message: "Multiple Actions can be merged into a single Subtask", description: "Instruction description" },
  empty_actions: { message: "No actions recorded", description: "Empty actions message" },
  empty_recycle_bin: { message: "Recycle bin is empty", description: "Empty recycle bin message" },
  no_subtasks_for_association: { message: "At least 2 subtasks are required for association", description: "No subtasks for association alert" },
};

class I18nManager {
  getMessage(key: string, params?: Record<string, any>): string {
    let message = "";

    // Get message from our English data
    if (i18nData[key]) {
      message = i18nData[key].message;
    } else {
      // Fallback to Chrome extension i18n
      try {
        const chromeMessage = chrome.i18n.getMessage(key);
        if (chromeMessage) {
          message = chromeMessage;
        }
      } catch (error) {
        console.warn("Chrome i18n not available:", error);
      }

      // If still no message, return the key itself
      if (!message) {
        message = key;
      }
    }

    // Handle parameter replacement
    if (params && typeof message === 'string') {
      Object.keys(params).forEach(paramKey => {
        const placeholder = `{${paramKey}}`;
        message = message.replace(new RegExp(placeholder, 'g'), String(params[paramKey]));
      });
    }

    return message;
  }

  getCurrentLocale(): string {
    return "en";
  }
}

export const i18n = new I18nManager();

export const t = (key: string, params?: Record<string, any>): string => i18n.getMessage(key, params);

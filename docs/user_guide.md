# Agentic Record Tool - User Guide

> This guide walks you through installing the plugin, recording tasks, annotating actions, and exporting data.

## 1. Create a Task

### 1.1 Install the Plugin

1. Open Chrome Extensions: [chrome://extensions](chrome://extensions).
2. Enable Developer mode in the top-right corner.
3. Click **[Load unpacked]** and select the plugin’s **dist** directory to complete the installation.

![Plugin Installation Screenshot](./images/user-guide/user-guide-01.png)

### 1.2 Start Recording

1. Open extension and Click the plugin icon in the the Chrome toolbar.

![Plugin Icon Screenshot](./images/user-guide/user-guide-02.png)

2. Click **[Start Capture]**.
   
   The plugin will begin recording user interactions and automatically generate Actions.

![Start Capture Screenshot](./images/user-guide/user-guide-03.png)

### 1.3 Stop Recording

After completing all required operations, you can end the recording process in either of the following ways:

1. Click the plugin icon and then click [Complete Capture].
2. Click Chrome’s built-in [Stop Sharing] button.

![Stop Sharing Screenshot](./images/user-guide/user-guide-04.png)

## 2. Perform Annotation

### 2.1 Fill in Task Information

1. Enter the Instruction, which describes the overall task guideline.
2. Enter the **Result**, which describes the expected outcome of the task.
3. Click the **[+]** to add multiple outcome if needed.

![Task Information Screenshot](./images/user-guide/user-guide-05.png)

### 2.2 Create a Subtask

> Multiple Actions that belong to the same step can be merged into a single Subtask.

1. Select the Actions to merge (hold Shift for multi-selection).
2. Click **[Group]** at the top of the page to merge the selected Actions into one Subtask.

![Group Actions Screenshot](./images/user-guide/user-guide-06.png)

3. The created Subtask will appear on the left panel.
4. You can fill in the **Sub-instruction** and **Result** for the Subtask.

![Subtask Details Screenshot](./images/user-guide/user-guide-07.png)

### 2.3 Ungroup a Subtask

1. Select the Subtask you want to ungroup.
2. Click **[Ungroup]** at the top of the page.
3. The Subtask will be split back into independent Actions.

![Ungroup Subtask Screenshot](./images/user-guide/user-guide-08.png)

### 2.4 Create Subtask Associations

> Subtask associations are used to describe the sequence or dependency relationships between Subtasks. 

1. Click **[Associate]** at the top of the page to enter association mode.

![Enter Association Mode Screenshot](./images/user-guide/user-guide-09.png)

2. Click the **[+]** icon to associate two Subtasks in sequence.

![Select Subtasks for Association Screenshot](./images/user-guide/user-guide-10.png)

3. Multiple associations can be created. Hover the line to check your associations.

![Highlight Association Line Screenshot](./images/user-guide/user-guide-11.png)

4. Click **[Save Associate]** to save the association relationships.

![Save Association Screenshot](./images/user-guide/user-guide-12.png)

### 2.5 Delete a Subtask Association

1. Right-click the association line.
2. Click **[Delete]** to remove the association.

![Delete Association Screenshot](./images/user-guide/user-guide-13.png)

## 3. Common Actions Operations

### 3.1 Delete an Action / Sub-action

1. Click **[Delete]** of Action or Sub-action card.
2. The deleted item will be moved to the **Recycle Bin**.

![Delete Action Screenshot](./images/user-guide/user-guide-14.png)

### 3.2 Restore a Deleted Action

1. Click **[Recycle Bin]** at the bottom of panel.

![Open Recycle Bin Screenshot](./images/user-guide/user-guide-15.png)

2. In the Recycle Bin, click **[Restore]** and the Action will be restored to the main Actions list.

![Restore Action Screenshot](./images/user-guide/user-guide-16.png)

3. Click **[Home Page]** to return to the main interface.

![Return to Home Page Screenshot](./images/user-guide/user-guide-17.png)

### 3.3 Open the Page Corresponding to an Action

1. Click **[Open Link]**.
2. The corresponding web page will open in a new tab.

![Open Action Link Screenshot](./images/user-guide/user-guide-18.png)

### 3.4 View the Recording Frame Corresponding to an Action

1. Click **[View]** 
2. The screen recording panel will automatically jump to the frame where the Action occurs.

![View Action Recording Frame Screenshot](./images/user-guide/user-guide-19.png)

## 4. Export Data

1. After completing the annotations, click **[Download Data]**.
2. The full annotation data for the current task will be downloaded.

![Download Data Screenshot](./images/user-guide/user-guide-20.png)

# ART Data Format Guide

This document explains the structure and usage of the JSON data exported by the Agentic Record Tool (ART).

## Table of Contents

- [Overview](#overview)
- [File Naming](#file-naming)
- [Data Structure](#data-structure)
- [Field Descriptions](#field-descriptions)

## Overview

When you click **Download Data** in ART, the tool exports a comprehensive JSON file containing:

- Task instructions and results
- All recorded actions (clicks, inputs, navigation, etc.)
- Subtask groupings with their instructions and results
- Association relationships between subtasks
- Synchronized video recording metadata
- Statistical information about the recording session

## File Naming

Exported files follow this naming convention:

```text
cgat_task_{recordingSessionId}.json
```

Example: `cgat_task_rec_1738656000000_abc123def456.json`

## Data Structure

The exported JSON file has the following top-level structure:

```json
{
  "metadata": { ... },
  "task": { ... }
}
```

### Complete Example

```json
{
  "metadata": {
    "exportTime": "2026-02-04T10:30:00.000Z",
    "statistics": {
      "totalActions": 25,
      "subtaskActions": 18,
      "otherActions": 7,
      "deletedActions": 3,
      "subtasks": 4,
      "associations": 2
    }
  },
  "task": {
    "instruction": "Complete user registration and profile setup",
    "results": [
      { "value": "User account created successfully" },
      { "value": "Profile information saved" }
    ],
    "subtasks": [
      {
        "id": "subtask_1",
        "order": 0,
        "instruction": "Navigate to registration page",
        "results": [
          { "value": "Registration form displayed" }
        ],
        "subaction": [
          {
            "id": "action_001",
            "type": "MOUSE_DOWN",
            "time": 1250,
            "url": "https://example.com/home",
            "info": {
              "tagName": "BUTTON",
              "xpath": "/html/body/div[1]/header/button[2]",
              "text": "Sign Up",
              "attributes": { "class": "btn-primary" }
            },
            "rawHtml": "<button class=\"btn-primary\">Sign Up</button>"
          }
        ]
      }
    ],
    "associations": [
      ["subtask_1", "subtask_2"],
      ["subtask_2", "subtask_3"]
    ],
    "other_actions": [
      {
        "id": "action_025",
        "type": "NAVIGATOR",
        "time": 100,
        "url": "https://example.com/home",
        "info": {},
        "rawHtml": null
      }
    ]
  }
}
```

## Field Descriptions

### Metadata Section

| Field | Type | Description |
| ------- | ------ | ------------- |
| `exportTime` | string (ISO 8601) | Timestamp when the data was exported |
| `statistics.totalActions` | number | Total number of actions (subtask + other) |
| `statistics.subtaskActions` | number | Number of actions grouped into subtasks |
| `statistics.otherActions` | number | Number of ungrouped actions |
| `statistics.deletedActions` | number | Count of deleted actions (not included in export) |
| `statistics.subtasks` | number | Total number of subtasks created |
| `statistics.associations` | number | Number of subtask associations |

### Task Section

#### Task-Level Fields

| Field | Type | Description |
| ------- | ------ | ------------- |
| `instruction` | string | Overall task instruction/goal |
| `results` | array of objects | Expected outcomes of the task |
| `results[].value` | string | Description of a specific result |
| `subtasks` | array of objects | Grouped actions with context |
| `associations` | array of tuples | Relationships between subtasks |
| `other_actions` | array of objects | Ungrouped actions |

#### Subtask Fields

| Field | Type | Description |
| ------- | ------ | ------------- |
| `id` | string | Unique identifier for the subtask |
| `order` | number | Display order of the subtask |
| `instruction` | string | Step-specific instruction |
| `results` | array of objects | Expected outcomes of this step |
| `subaction` | array of objects | Actions belonging to this subtask |

#### Action Fields

| Field | Type | Description |
| ------- | ------ | ------------- |
| `id` | string | Unique identifier for the action |
| `type` | string | Action type (see [Action Types](#action-types)) |
| `time` | number | Timestamp in milliseconds from recording start |
| `url` | string | URL where the action occurred |
| `info` | object | Detailed information about the action |
| `rawHtml` | string or null | HTML snapshot of the target element |

##### Action Types

| Type | Description |
| ------ | ------------- |
| `MOUSE_DOWN` | Mouse button pressed |
| `MOUSE_UP` | Mouse button released |
| `MOUSE_DRAG` | Mouse dragged while button held |
| `KEY_DOWN` | Keyboard key pressed |
| `INPUT` | Text input into a field |
| `WHEEL` | Mouse wheel scrolled |
| `CONTEXT_MENU` | Right-click context menu opened |
| `TAB_CHANGE` | Browser tab switched |
| `NAVIGATOR` | Navigation to a new URL |
| `RESULT_STATE` | Final page state snapshot |

##### Action Info Object

The `info` object structure varies by action type:

**For Mouse Actions (MOUSE_DOWN, MOUSE_UP, MOUSE_DRAG):**

```json
{
  "tagName": "BUTTON",
  "xpath": "/html/body/div[1]/button",
  "text": "Submit",
  "attributes": {
    "id": "submit-btn",
    "class": "btn-primary",
    "type": "submit"
  },
  "position": { "x": 150, "y": 200 }
}
```

**For Input Actions:**

```json
{
  "tagName": "INPUT",
  "xpath": "/html/body/form/input[1]",
  "value": "user@example.com",
  "attributes": {
    "type": "email",
    "name": "email",
    "placeholder": "Enter your email"
  }
}
```

**For Navigation Actions:**

```json
{
  "fromUrl": "https://example.com/page1",
  "toUrl": "https://example.com/page2",
  "method": "link" // or "back", "forward", "reload"
}
```

#### Associations

Associations are represented as tuples `[sourceId, targetId]`:

```json
[
  ["subtask_1", "subtask_2"],  // subtask_1 → subtask_2
  ["subtask_2", "subtask_3"]   // subtask_2 → subtask_3
]
```

This indicates that `subtask_1` should be completed before `subtask_2`, and `subtask_2` before `subtask_3`.


## Additional Resources

- [User Guide](./user_guide.md) - Learn how to record and annotate tasks
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/) - Technical details about browser automation
- [JSON Schema Validator](https://www.jsonschemavalidator.net/) - Validate your exported data

---

**Last Updated**: February 2026 ｜ **Format Version**: 1.0

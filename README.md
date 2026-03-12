# Agentic Record Tool (ART)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D.svg?logo=vuedotjs)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4.svg?logo=googlechrome)](https://developer.chrome.com/docs/extensions/)

🧩 A Chrome extension for recording web interactions with synchronized video, featuring intelligent task grouping and workflow analysis for agent-driven workflows. 🫟 Visit our official website for more information 👉 www.2077ai.com/

## 🖥️ ART Main Page Screenshot
![ART main page](docs/images/art-main-page.png)

## ✨ Features

- **📹 Record & Capture**: Synchronized video recording with all web interactions (clicks, inputs, navigation)
- **📋 Task Annotation**: Organize actions into subtasks with instructions and expected results
- **🔗 Workflow Mapping**: Visualize task dependencies through subtask associations
- **📦 Smart Export**: Download complete task data as structured JSON

## 📖 Documentation

- [User Guide](./docs/user_guide.md) - Complete step-by-step guide
- [Data Format Guide](./docs/data_format.md) - JSON export structure and usage
- [Action Info Guide](./docs/action_info_guide.md) - Reference for action `info` payload fields
- [Commit Guidelines](./docs/commit_guidelines.md) - Git commit message conventions

## 🛠️ Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Naive UI
- **Storage**: Chrome Extension APIs
- **State Management**: Pinia

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Google Chrome or Chromium-based browser

### Installation & Setup

1. **Clone and install dependencies:**

```bash
git clone https://github.com/2077AI/AgenticRecordTool.git
cd AgenticRecordTool
pnpm install
```

2. **Start development server:**

```bash
pnpm run dev
```

3. **Build for Production:**

```bash
pnpm run build
```

4. **Load extension in Chrome:**

- Open Chrome and navigate to chrome://extensions
- Enable **Developer mode**
- Click **Load unpacked** and select the **/dist** directory you just built

See the complete step-by-step guide in the [User Guide](./docs/user_guide.md)

## 📁 Project Structure

```text
agentic-record-tool/
    ├── src/
    │   ├── background/          # Service worker for Chrome extension
    │   │   └── service-worker.ts
    │   ├── content/             # Content scripts injected into web pages
    │   │   └── content.ts
    │   ├── preview/             # Main preview and annotation interface
    │   │   ├── App.vue
    │   │   ├── components/
    │   │   │   ├── sidebar/     # Task sidebar, associations, recycle bin
    │   │   │   ├── task/        # Task sections, actions, subtasks
    │   │   │   └── video/       # Video player component
    │   │   ├── composables/
    │   │   │   ├── useActionManagement.ts
    │   │   │   ├── useAssociations.ts
    │   │   │   ├── useDataLoader.ts
    │   │   │   ├── usePersistence.ts
    │   │   │   ├── useTaskState.ts
    │   │   │   └── useVideoPlayer.ts
    │   │   └── types.ts
    │   ├── sidePanel/           # Extension popup UI
    │   │   ├── App.vue
    │   │   └── RecordActions.vue
    │   ├── offscreen/           # Offscreen document for screen recording
    │   │   └── App.vue
    │   ├── styles/
    │   ├── utils/
    │   │   └── i18n.ts
    │   └── types.ts
    ├── docs/
    │   ├── user_guide.md
    │   ├── data_format.md
    │   ├── action_info_guide.md
    │   └── commit_guidelines.md
    ├── manifest.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

## 🤝 Contributing

Contributions are welcome! Please read our Contributing Guide for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

See the commit message conventions in [Commit Guidelines](./docs/commit_guidelines.md)

## 🐛 Reporting Issues

Found a bug or have a feature request? Please check our [Issues](https://github.com/2077AI/AgenticRecordTool/issues) and search for existing issues before creating a new one.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

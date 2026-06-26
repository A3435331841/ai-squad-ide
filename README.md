# AI Squad IDE

一个用于探索“AI 开发小队”工作流的实验项目。

它的目标不是做一个普通聊天式 AI 编码助手，而是把多个 AI 组织成更接近真实开发团队的协作结构：

- 总负责人 Agent：理解需求、拆解任务、控制流程。
- 架构组 Agent：设计技术方案和执行顺序。
- 开发组 Agent：负责具体实现。
- 验收组 Agent：检查 diff、测试结果和需求完成度。
- 文档组 Agent：整理说明、总结变更和后续方向。

## 当前阶段：MVP 0.1

第一阶段只跑通最小闭环：

```text
VS Code 命令面板
  ↓
用户输入开发任务
  ↓
本地 FastAPI Agent Server
  ↓
返回任务拆解 JSON
  ↓
VS Code Webview 展示 AI 开发小队任务计划
```

这一版暂时不接真实大模型，也不会自动修改代码。

## 项目结构

```text
ai-squad-ide/
├── agent-server/          # Python FastAPI 本地 Agent 服务
│   ├── main.py
│   └── requirements.txt
├── extension/             # VS Code 插件
│   ├── src/
│   │   └── extension.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── mvp-task-plan.md
└── README.md
```

## 快速运行

### 1. 启动后端

```powershell
cd agent-server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
fastapi dev main.py
```

### 2. 启动插件

```powershell
cd extension
npm install
npm run compile
```

用 VS Code 打开 `extension` 目录，按 `F5` 启动 Extension Development Host。

在新窗口中打开命令面板，执行：

```text
AI Squad: Create Task Plan
```

输入任务后，右侧会展示 AI 开发小队任务计划。

更详细说明见：[`docs/mvp-task-plan.md`](docs/mvp-task-plan.md)。

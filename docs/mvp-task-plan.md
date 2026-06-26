# MVP 0.1：任务拆解闭环

这一版先不接真实大模型，也不自动改代码。目标是先跑通产品骨架：

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

## 已包含内容

- `agent-server/main.py`：FastAPI 本地服务，提供 `/api/tasks/plan` 接口。
- `extension/src/extension.ts`：VS Code 插件命令 `AI Squad: Create Task Plan`。
- `extension/package.json`：插件 manifest 和编译脚本。

## 本地运行

### 1. 启动 Agent Server

```powershell
cd agent-server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
fastapi dev main.py
```

访问：

```text
http://127.0.0.1:8000
```

看到下面内容说明后端启动成功：

```json
{"status":"ok","message":"AI Squad Agent Server is running"}
```

### 2. 启动 VS Code 插件

```powershell
cd extension
npm install
npm run compile
```

然后用 VS Code 打开 `extension` 目录，按 `F5` 启动 Extension Development Host。

在新窗口中打开命令面板，执行：

```text
AI Squad: Create Task Plan
```

输入任务，例如：

```text
给这个项目添加登录功能
```

如果后端正在运行，右侧会打开 `AI Squad 任务计划` 面板。

## 第一版验收标准

- [ ] FastAPI 后端可以启动。
- [ ] `/api/tasks/plan` 可以返回任务拆解 JSON。
- [ ] VS Code 命令面板能看到 `AI Squad: Create Task Plan`。
- [ ] 输入任务后能请求本地后端。
- [ ] Webview 能展示总负责人、架构组、开发组、验收组、文档组的拆解结果。

## 下一步方向

1. 把固定任务拆解替换成真实 `Manager Agent`。
2. 增加 `model_router`，先接入一个模型。
3. 加入项目文件结构扫描。
4. 增加任务树状态流转。
5. 后续再做代码修改、Git diff、测试执行和验收门。

import * as vscode from 'vscode';

type SubTask = {
    id: string;
    title: string;
    owner: string;
    difficulty: 'high' | 'medium' | 'low';
    suggested_model_tier: 'expensive' | 'normal' | 'cheap';
    status: string;
    acceptance_criteria: string[];
};

type TaskPlan = {
    summary: string;
    workspace_path: string | null;
    subtasks: SubTask[];
};

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('aiSquad.createTaskPlan', async () => {
        const task = await vscode.window.showInputBox({
            prompt: '请输入你想让 AI 开发小队完成的任务',
            placeHolder: '例如：给这个项目添加登录功能',
            ignoreFocusOut: true
        });

        if (!task?.trim()) {
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspacePath = workspaceFolders?.[0]?.uri.fsPath ?? null;

        try {
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'AI Squad 正在生成任务计划...',
                    cancellable: false
                },
                async () => {
                    const response = await fetch('http://127.0.0.1:8000/api/tasks/plan', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            user_task: task,
                            workspace_path: workspacePath
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Agent Server 请求失败：${response.status} ${response.statusText}`);
                    }

                    const data = (await response.json()) as TaskPlan;

                    const panel = vscode.window.createWebviewPanel(
                        'aiSquadTaskPlan',
                        'AI Squad 任务计划',
                        vscode.ViewColumn.Beside,
                        {
                            enableScripts: false
                        }
                    );

                    panel.webview.html = getWebviewContent(data);
                }
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`无法连接 AI Squad Agent Server：${message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderModelTier(tier: SubTask['suggested_model_tier']): string {
    const labels: Record<SubTask['suggested_model_tier'], string> = {
        expensive: '贵模型 / 复杂判断',
        normal: '中等模型 / 主要实现',
        cheap: '便宜模型 / 重复整理'
    };

    return labels[tier];
}

function renderDifficulty(difficulty: SubTask['difficulty']): string {
    const labels: Record<SubTask['difficulty'], string> = {
        high: '高',
        medium: '中',
        low: '低'
    };

    return labels[difficulty];
}

function getWebviewContent(data: TaskPlan): string {
    const workspace = data.workspace_path ? escapeHtml(data.workspace_path) : '未检测到工作区';

    const subtasksHtml = data.subtasks.map((task) => `
        <article class="card">
            <div class="cardHeader">
                <span class="taskId">${escapeHtml(task.id)}</span>
                <h2>${escapeHtml(task.title)}</h2>
            </div>
            <div class="metaGrid">
                <div><strong>负责人</strong><span>${escapeHtml(task.owner)}</span></div>
                <div><strong>难度</strong><span>${renderDifficulty(task.difficulty)}</span></div>
                <div><strong>模型档位</strong><span>${renderModelTier(task.suggested_model_tier)}</span></div>
                <div><strong>状态</strong><span>${escapeHtml(task.status)}</span></div>
            </div>
            <h3>验收标准</h3>
            <ul>
                ${task.acceptance_criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        </article>
    `).join('');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Squad 任务计划</title>
    <style>
        body {
            padding: 24px;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            line-height: 1.6;
        }
        .hero {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 18px;
            background: var(--vscode-sideBar-background);
        }
        h1 {
            margin: 0 0 8px;
            font-size: 26px;
        }
        .workspace {
            margin-top: 12px;
            color: var(--vscode-descriptionForeground);
            word-break: break-all;
        }
        .card {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 12px;
            padding: 18px;
            margin: 14px 0;
            background: var(--vscode-editorWidget-background);
        }
        .cardHeader {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .taskId {
            border-radius: 999px;
            padding: 2px 10px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            font-weight: 700;
        }
        h2 {
            margin: 0;
            font-size: 18px;
        }
        h3 {
            margin-bottom: 6px;
            font-size: 15px;
        }
        .metaGrid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 10px;
            margin: 14px 0;
        }
        .metaGrid div {
            border-radius: 8px;
            padding: 10px;
            background: var(--vscode-input-background);
        }
        .metaGrid strong {
            display: block;
            margin-bottom: 4px;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
        }
        ul {
            margin-top: 6px;
        }
    </style>
</head>
<body>
    <section class="hero">
        <h1>AI Squad 任务计划</h1>
        <p>${escapeHtml(data.summary)}</p>
        <div class="workspace"><strong>工作区：</strong>${workspace}</div>
    </section>
    ${subtasksHtml}
</body>
</html>`;
}

export function deactivate() {}

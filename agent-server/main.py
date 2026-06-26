from __future__ import annotations

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(title="AI Squad Agent Server", version="0.1.0")


ModelTier = Literal["expensive", "normal", "cheap"]
Difficulty = Literal["high", "medium", "low"]
TaskStatus = Literal["planned", "in_progress", "reviewing", "done"]


class TaskRequest(BaseModel):
    user_task: str = Field(..., min_length=1, description="用户输入的开发任务")
    workspace_path: str | None = Field(default=None, description="VS Code 当前工作区路径")


class SubTask(BaseModel):
    id: str
    title: str
    owner: str
    difficulty: Difficulty
    suggested_model_tier: ModelTier
    status: TaskStatus = "planned"
    acceptance_criteria: list[str]


class TaskPlan(BaseModel):
    summary: str
    workspace_path: str | None
    subtasks: list[SubTask]


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "AI Squad Agent Server is running"}


@app.post("/api/tasks/plan", response_model=TaskPlan)
def create_task_plan(request: TaskRequest) -> TaskPlan:
    """Return a deterministic MVP task plan.

    This endpoint intentionally does not call any LLM yet. The first milestone is to
    prove the product loop: VS Code panel -> local server -> task tree -> Webview.
    """

    user_task = request.user_task.strip()

    return TaskPlan(
        summary=f"已理解任务：{user_task}。这是 AI 开发小队的第一版拆解方案。",
        workspace_path=request.workspace_path,
        subtasks=[
            SubTask(
                id="T1",
                title="需求理解与边界确认",
                owner="总负责人 Agent",
                difficulty="high",
                suggested_model_tier="expensive",
                acceptance_criteria=[
                    "明确用户真正想实现的功能",
                    "识别当前项目技术栈和关键目录",
                    "列出可能影响实现的风险点",
                ],
            ),
            SubTask(
                id="T2",
                title="技术方案设计",
                owner="架构组 Agent",
                difficulty="high",
                suggested_model_tier="expensive",
                acceptance_criteria=[
                    "给出模块设计和执行顺序",
                    "说明需要修改哪些文件或目录",
                    "判断是否需要数据库、接口、配置变更",
                ],
            ),
            SubTask(
                id="T3",
                title="代码实现",
                owner="开发组 Agent",
                difficulty="medium",
                suggested_model_tier="normal",
                acceptance_criteria=[
                    "按照架构方案修改代码",
                    "保持代码风格和原项目一致",
                    "避免引入无关改动",
                ],
            ),
            SubTask(
                id="T4",
                title="测试与验收",
                owner="验收组 Agent",
                difficulty="medium",
                suggested_model_tier="normal",
                acceptance_criteria=[
                    "检查功能是否满足原始需求",
                    "检查是否存在明显 bug 或回归风险",
                    "输出最终验收报告",
                ],
            ),
            SubTask(
                id="T5",
                title="文档与总结",
                owner="文档组 Agent",
                difficulty="low",
                suggested_model_tier="cheap",
                acceptance_criteria=[
                    "总结修改内容",
                    "记录运行方式和使用方法",
                    "列出后续可优化点",
                ],
            ),
        ],
    )

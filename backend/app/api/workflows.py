"""Workflow recipe endpoints."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from app.engine.workflows import get_workflow_store
from app.models.events import EventType, RunEvent
from app.models.requests import SaveWorkflowRequest
from app.models.workflow import WorkflowRecipe

router = APIRouter()


@router.get("/workflows")
def list_workflows(pack_id: str | None = None) -> list[WorkflowRecipe]:
    return get_workflow_store().list_workflows(pack_id)


@router.post("/workflows")
def save_workflow(body: SaveWorkflowRequest) -> WorkflowRecipe:
    recipe = WorkflowRecipe(
        id=str(uuid.uuid4()),
        name=body.name,
        description=body.description,
        pack_id=body.pack_id,
        created_from_goal=body.created_from_goal,
        trigger_profile=body.trigger_profile,
        steps=body.steps,
    )
    return get_workflow_store().add(recipe)


@router.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: str) -> WorkflowRecipe:
    recipe = get_workflow_store().get(workflow_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return recipe


@router.delete("/workflows/{workflow_id}")
def delete_workflow(workflow_id: str) -> dict[str, bool]:
    get_workflow_store().delete(workflow_id)
    return {"deleted": True}

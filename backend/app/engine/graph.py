"""Mycelium orchestration graph (LangGraph StateGraph).

Flow:
  profile_source -> (bind_saved_workflow | match_workflow -> plan_workflow)
  -> select_tool -> (execute_step | spec_tool -> codegen -> sandbox -> critique
     -> register | repair) -> execute_step -> observe_step -> ...
  -> synthesize_result -> propose_workflow_save -> END
"""
from __future__ import annotations

from functools import lru_cache

from langgraph.graph import END, StateGraph

from app.engine import nodes
from app.engine.state import MyceliumState


def build_graph():
    g = StateGraph(MyceliumState)

    g.add_node("profile_source", nodes.profile_source)
    g.add_node("match_workflow", nodes.match_workflow)
    g.add_node("bind_saved_workflow", nodes.bind_saved_workflow)
    g.add_node("plan_workflow", nodes.plan_workflow)
    g.add_node("select_tool", nodes.select_tool)
    g.add_node("spec_tool", nodes.spec_tool)
    g.add_node("codegen_tool", nodes.codegen_tool)
    g.add_node("sandbox_test", nodes.sandbox_test)
    g.add_node("critique_tool", nodes.critique_tool)
    g.add_node("repair_tool", nodes.repair_tool)
    g.add_node("register_tool", nodes.register_tool)
    g.add_node("execute_step", nodes.execute_step)
    g.add_node("observe_step", nodes.observe_step)
    g.add_node("synthesize_result", nodes.synthesize_result)
    g.add_node("propose_workflow_save", nodes.propose_workflow_save)

    g.set_entry_point("profile_source")
    g.add_conditional_edges(
        "profile_source",
        nodes.route_after_profile,
        {
            "bind_saved_workflow": "bind_saved_workflow",
            "match_workflow": "match_workflow",
            "synthesize_result": "synthesize_result",
        },
    )
    g.add_edge("match_workflow", "plan_workflow")
    g.add_edge("plan_workflow", "select_tool")
    g.add_edge("bind_saved_workflow", "select_tool")

    g.add_conditional_edges(
        "select_tool",
        nodes.route_after_select_tool,
        {"execute_step": "execute_step", "spec_tool": "spec_tool"},
    )

    g.add_edge("spec_tool", "codegen_tool")
    g.add_edge("codegen_tool", "sandbox_test")
    g.add_edge("sandbox_test", "critique_tool")
    g.add_conditional_edges(
        "critique_tool",
        nodes.route_after_critique,
        {"register_tool": "register_tool", "repair_tool": "repair_tool", "observe_step": "observe_step"},
    )
    g.add_edge("repair_tool", "sandbox_test")
    g.add_edge("register_tool", "execute_step")
    g.add_edge("execute_step", "observe_step")
    g.add_conditional_edges(
        "observe_step",
        nodes.route_after_observe_step,
        {"select_tool": "select_tool", "synthesize_result": "synthesize_result"},
    )
    g.add_edge("synthesize_result", "propose_workflow_save")
    g.add_edge("propose_workflow_save", END)

    return g.compile()


@lru_cache
def get_compiled_graph():
    return build_graph()

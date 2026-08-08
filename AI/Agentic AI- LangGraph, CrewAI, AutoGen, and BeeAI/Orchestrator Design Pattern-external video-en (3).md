# Orchestrator Design Pattern

> **Dynamic Workflow Coordination with LangGraph's `Send` API**

---

## Overview

The **Orchestrator Design Pattern** enables dynamic, adaptive workflows where a central coordinator breaks down complex requests, assigns specialized worker agents in parallel, and synthesises their outputs into a unified result. Unlike static graph patterns, the orchestrator can handle unknown or varying complexity at runtime.

| Concept | Real-World Analogy |
|---|---|
| Orchestrator (Head Chef) | Analyses request, assigns specialist chefs, creates work packages |
| Worker Agents (Chefs) | Execute specialised tasks in parallel |
| Synthesizer | Merges all contributions into a coherent final output |

---

## Why the Orchestrator Pattern?

- **Static workflows** require knowing the problem structure in advance.
- **Orchestrator pattern** adapts when complexity is unknown — e.g., a cruise ship party planner receives different daily guest requests (Italian pasta, Mexican tacos, Indian curry) and must dynamically scale team composition.

---

## Core Components

### 1. Central Orchestrator

- Assigns tasks dynamically based on input analysis
- Manages shared context and parallel coordination
- Decides how many worker agents are needed (2–10+ based on complexity)

### 2. Worker State vs Shared State

| Concept | Role |
|---|---|
| **State** (shared) | Holds workflow-wide data accessible to all nodes |
| **Worker State** (per-task) | Task-specific details; separate container for each parallel worker |
| **Shared keys** | Keys that exist in both state and worker state — e.g., `completed_menu` — allow workers to access and contribute to shared context |

### 3. Assign Workers Node

- Reads the orchestrator's structured output (e.g., a list of dish objects)
- Uses **LangGraph's `Send` function** to fan out each item to a separate worker agent
- Creates parallel execution paths dynamically

### 4. Synthesizer Node

- Collects all completed worker outputs
- Merges them into a single, formatted final result

---

## Implementation Walkthrough

### State Schema

```python
# Shared state
meals: str                         # User input
sections: list[Dish]               # Orchestrator output (dish objects)
completed_menu: Annotated[list, operator.add]  # Merged from workers
final_meal_guide: str              # Synthesized result
```

### Worker State

```python
# Per-worker state — receives one section item + shared completed_menu
class WorkerState(TypedDict):
    section: Dish                  # Single dish object from sections list
    completed_menu: Annotated[list, operator.add]  # Shared via state key
```

### Dish Data Model

```python
class Dish(BaseModel):
    name: str
    ingredients: str
    cuisine: str                   # "location" in source terminology
```

### Node: Orchestrator

- Receives `meals` from state
- Prompts LLM with `dish_prompt` → `planner_pipe`
- Returns structured `list[Dish]` → populates `sections`

```python
def orchestrator_node(state: State) -> dict:
    prompt = dish_prompt.format(meals=state["meals"])
    dishes = planner_pipe.invoke(prompt)
    return {"sections": dishes}
```

### Node: Assign Workers (conditional edge)

```python
def assign_workers(state: State) -> list[Send]:
    return [
        Send("chef_worker", {"section": dish, "completed_menu": state["completed_menu"]})
        for dish in state["sections"]
    ]
```

### Node: Chef Worker

- Extracts `name`, `cuisine`, `ingredients` from its `section`
- Generates cooking instructions via `chef_pipe`
- Returns appended `completed_menu` entry

```python
def chef_worker_node(worker_state: WorkerState) -> dict:
    dish = worker_state["section"]
    prompt = chef_prompt.format(
        cuisine=dish.cuisine,
        name=dish.name,
        ingredients=dish.ingredients
    )
    recipe = chef_pipe.invoke(prompt)
    return {"completed_menu": [recipe]}
```

### Node: Synthesizer

```python
def synthesizer_node(state: State) -> dict:
    separator = "\n\n---\n\n"
    combined = separator.join(state["completed_menu"])
    return {"final_meal_guide": f"## Dinner Plan\n\n{combined}"}
```

### Graph Assembly

```python
builder = StateGraph(State)
builder.add_node("orchestrator", orchestrator_node)
builder.add_node("chef_worker", chef_worker_node)
builder.add_node("synthesizer", synthesizer_node)

builder.add_conditional_edges(
    "orchestrator",
    assign_workers,
    ["chef_worker"]  # LangGraph resolves Send targets
)
builder.add_edge("chef_worker", "synthesizer")
builder.add_edge(START, "orchestrator")
builder.add_edge("synthesizer", END)

graph = builder.compile()
```

---

## Execution Flow

```
Input: "Prepare Italian pasta, Mexican tacos, Indian curry, Thai stir fry, American burgers"
       │
       ▼
[Orchestrator Node]
  └── Analyses request → outputs 5 Dish objects in sections
       │
       ▼
[Assign Workers (conditional)]
  └── Send() → chef_worker(section=Italian_pasta)
  └── Send() → chef_worker(section=Mexican_tacos)
  └── Send() → chef_worker(section=Indian_curry)
  └── Send() → chef_worker(section=Thai_stir_fry)
  └── Send() → chef_worker(section=American_burgers)
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
[chef_worker]  [chef_worker]  [chef_worker]  [chef_worker]  [chef_worker]
  └── Each outputs a recipe → appended to completed_menu via operator.add
       │
       ▼
[Synthesizer Node]
  └── Merges all recipes into final_meal_guide
       │
       ▼
Output: Unified dinner plan with all 5 cuisines
```

---

## Key Benefits

| Benefit | Description |
|---|---|
| **Dynamic scaling** | Worker count adapts to input complexity at runtime |
| **Parallel execution** | All workers run concurrently via `Send` fan-out |
| **Context isolation** | Worker state keeps task-specific details separate from shared context |
| **Composable** | Synthesizer can be swapped for different merge strategies |
| **Reusable workers** | Same `chef_worker` handles any dish type |

---

## Comparison with Other Patterns

| Aspect | Static Graph | Orchestrator |
|---|---|---|
| Problem structure | Known in advance | Unknown at compile time |
| Worker count | Fixed | Dynamic (2–10+) |
| Task assignment | Hard-coded edges | `Send()` conditional edges |
| State model | Single shared state | Shared + per-worker state |

---

## Summary

The Orchestrator Design Pattern in LangGraph provides a robust framework for dynamic, parallel workflows. By combining a central orchestrator node, `Send`-based task fan-out, separate worker state containers, and a synthesizer, you can build scalable agents that adapt to real-time complexity without sacrificing coordination or output quality.

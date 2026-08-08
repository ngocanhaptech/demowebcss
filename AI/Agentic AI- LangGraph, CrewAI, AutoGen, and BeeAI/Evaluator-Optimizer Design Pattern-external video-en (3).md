Evaluator–Optimizer Design Pattern trong LangGraph

1. Mở đầu: Evaluator–Optimizer là gì?
Trong bài học này, người học sẽ:

Hiểu Evaluator–Optimizer pattern và cách quản lý state trong quy trình phản hồi–tối ưu hoá.

Xây một workflow graph kết nối generator, evaluator và vòng lặp feedback.

Tạo persona nhà đầu tư và triển khai logic chấm điểm rủi ro, đánh giá và định tuyến (accept/reject).

Lắp ráp reflection loop hoàn chỉnh cho bài toán tư vấn đầu tư.

Ý tưởng chung:

Một truy vấn đi vào generator LLM → sinh phương án ban đầu.

Output đó được gửi sang evaluator LLM → chấm điểm, nhận xét.

Nếu bị từ chối, evaluator cung cấp feedback, generator chỉnh sửa và lặp lại.

Vòng lặp tiếp tục cho đến khi kết quả đạt tiêu chí mục tiêu hoặc chạm giới hạn số vòng lặp.

2. Bối cảnh ví dụ: Cố vấn đầu tư nhiều persona
Ta xây một multi-agent investment advisor gồm ba “nhân vật” nổi tiếng:

Kathy Wood – phong cách “high risk, high reward”, ưu tiên đổi mới táo bạo.

Warren Buffett – nhà đầu tư giá trị, chú trọng bảo toàn vốn, nền tảng kinh doanh vững chắc.

Ray Dalio – cân bằng rủi ro/lợi nhuận, dùng feedback để điều chỉnh chiến lược.

Luồng cơ bản:

Người dùng nhập hồ sơ nhà đầu tư (investor profile).

Một LLM chấm risk grade mục tiêu (ultra-conservative → high risk).

Hồ sơ và target grade được đưa vào generator, gồm hai “pha”:

Pha 1: Kathy Wood tạo kế hoạch đầu tư ban đầu.

Pha 2: Ray Dalio sẽ dùng feedback của Warren Buffett để tinh chỉnh kế hoạch.

Warren Buffett là evaluator:

Đọc kế hoạch đầu tư.

Chấm lại risk grade và đưa ra feedback chi tiết.

Kế hoạch được tối ưu hoá lặp lại giữa Ray Dalio (sinh lại) và Warren Buffett (đánh giá) cho đến khi:

Risk grade đạt đúng target, hoặc

Vượt quá số vòng lặp cho phép → workflow dừng.

3. State: Nơi lưu toàn bộ ngữ cảnh
State trong LangGraph là nơi lưu mọi dữ liệu mà nodes dùng chung.

Trong ví dụ này, state có thể gồm:

investor_profile: chuỗi mô tả hồ sơ nhà đầu tư (tuổi, mục tiêu, thu nhập, mức chấp nhận rủi ro…).

investment_plan: kế hoạch đầu tư hiện tại (do generator sinh).

target_grade: mức rủi ro mục tiêu (ví dụ: “moderate”, “conservative”).

current_grade: mức rủi ro hiện tại do evaluator chấm.

feedback: chuỗi góp ý từ evaluator, giải thích tại sao kế hoạch phù hợp/không phù hợp với target.

iteration_count: bộ đếm số vòng lặp đã chạy, dùng để dừng khi vượt giới hạn.

Các trường này được cập nhật từng phần qua các node:

Grading node: cập nhật target_grade.

Generator node: cập nhật investment_plan.

Evaluator node: cập nhật current_grade, feedback, iteration_count.

Routing/decision node: đọc current_grade, target_grade, iteration_count để quyết định accept/reject/tiếp tục.

4. Bước 1: Chấm hạng rủi ro – Grading node
4.1. Grade_prompt và grade_pipe
Ta định nghĩa:

grade_prompt:

Chỉ dẫn LLM tạo risk score từ “ultra-conservative” đến “high risk” dựa trên investor_profile.

Ví dụ: “Dựa trên hồ sơ, hãy chọn một mức rủi ro: ultra-conservative, conservative, moderate, aggressive, high risk, và giải thích ngắn.”

grade_pipe:

Pipeline nối grade_prompt với LLM, trả về risk grade (có thể kèm lý do) ở định dạng có thể trích xuất.

4.2. Risk grading node
Node này:

Đọc investor_profile từ state.

Gọi grade_pipe để lấy risk grade.

Gán kết quả vào target_grade trong state.

Kết quả: state có hồ sơ và mức rủi ro mục tiêu mà hệ thống sẽ cố gắng đạt khi thiết kế kế hoạch.

5. Bước 2: Generator – Kathy Wood + Ray Dalio
5.1. Persona Kathy Wood – kế hoạch ban đầu
Trong generator:

Kathy Wood persona được định nghĩa qua system prompt:

“Bạn là Kathy Wood, nhà đầu tư chú trọng đổi mới công nghệ, chấp nhận rủi ro cao, ưu tiên tăng trưởng dài hạn.”

Pipe tương ứng (ví dụ kathy_wood_pipe) kết nối persona này với LLM:

Input: investor_profile + target_grade.

Output: kế hoạch đầu tư ban đầu (danh mục cổ phiếu/ETF, chiến lược phân bổ…).

5.2. Feedback schema cho evaluator
Vì generator pha 2 cần dùng feedback từ evaluator, ta thiết kế schema structured output cho Warren Buffett:

Trường grade: giá trị trong tập risk level (ultra-conservative → high risk).

Trường feedback: chuỗi giải thích chi tiết về:

Lý do phân loại rủi ro.

Điểm cần cải thiện (ví dụ: quá tập trung vào growth, thiếu đa dạng hoá, không bảo toàn vốn…).

Schema này giúp LLM evaluator trả output có cấu trúc, dễ parse và dùng lại trong generator.

5.3. Persona Ray Dalio – generator tối ưu
Ray Dalio persona:

System prompt:

“Bạn là Ray Dalio, tối ưu chiến lược đầu tư dựa trên cân bằng rủi ro–lợi nhuận, đa dạng hoá, và sử dụng feedback của nhà đầu tư giá trị để điều chỉnh.”

Pipe ray_dalio_pipe:

Input: investor_profile, current_grade, feedback từ evaluator.

Output: kế hoạch cải tiến điều chỉnh theo những điểm Buffett nêu ra, nhưng vẫn cố gắng đạt target_grade và mục tiêu lợi nhuận.

5.4. Investment plan generator node
Generator node kết hợp hai persona:

Nếu chưa có feedback trong state (key feedback không tồn tại hoặc rỗng):

Dùng kathy_wood_pipe để tạo kế hoạch lần đầu.

Nếu đã có feedback từ evaluator:

Dùng ray_dalio_pipe để sinh kế hoạch sửa đổi, bám vào feedback đó.

Node này:

Đọc state (investor_profile, target_grade, feedback nếu có).

Gọi pipe tương ứng.

Cập nhật investment_plan trong state với kế hoạch mới nhất.

6. Bước 3: Evaluator – Warren Buffett và logic xử lý
6.1. Persona Warren Buffett – đánh giá kế hoạch
Evaluator LLM mang persona Warren Buffett:

System prompt:

“Bạn là Warren Buffett, đánh giá kế hoạch đầu tư theo tiêu chí bảo toàn vốn, chất lượng doanh nghiệp, và giá trị dài hạn.”

Pipe buffett_evaluator_pipe:

Input: investor_profile, investment_plan, target_grade.

Output: structured feedback:

grade: risk level hiện tại của kế hoạch vừa sinh.

feedback: giải thích cụ thể, kèm đề xuất điều chỉnh.

6.2. Warren Buffett node – evaluate_plan
Node evaluate_plan:

Tăng iteration_count trong state (đếm số vòng lặp đã chạy).

Gọi buffett_evaluator_pipe để đánh giá kế hoạch.

Cập nhật:

current_grade (mức rủi ro theo Buffett).

feedback (chuỗi góp ý).

iteration_count (mới).

6.3. Evaluate_investment – quyết định accept/reject
Node evaluate_investment đọc state và:

So sánh current_grade với target_grade.

Kiểm tra iteration_count so với giới hạn vòng lặp (ví dụ max 5–10 lần).

Kết quả logic:

Nếu current_grade == target_grade:

Trả kết quả “accepted”.

Nếu iteration_count ≥ giới hạn:

Trả “accepted with compromise” hoặc thông báo không thể điều chỉnh trong biên rủi ro yêu cầu, và dừng vòng lặp.

Ngược lại:

Trả “rejected” kèm hướng dẫn tiếp tục: dùng feedback để cải thiện kế hoạch và lặp lại.

7. Bước 4: Xây graph reflection loop trong LangGraph
7.1. Các node chính trong StateGraph
Graph gồm các node:

risk_grading – chấm target risk grade.

investment_generator – tạo/cải tiến kế hoạch (Kathy Wood + Ray Dalio).

buffett_evaluator – đánh giá kế hoạch, cập nhật grade & feedback.

evaluate_investment – node quyết định accept/reject dựa trên grade & iteration.

7.2. Edges và conditional routing
Edges:

START → risk_grading.

risk_grading → investment_generator.

investment_generator → buffett_evaluator.

buffett_evaluator → evaluate_investment.

Tại evaluate_investment, dùng add_conditional_edges:

Nếu kết quả là accepted:

Edge tới END node (hoặc node “finalize_plan”).

Nếu kết quả là rejected:

Edge quay lại investment_generator, kèm theo state đã cập nhật (feedback, current_grade, iteration_count).

Nếu “stop due to max iterations”:

Edge tới END với thông điệp dừng và kế hoạch tốt nhất hiện có.

Cuối cùng, compile graph thành ứng dụng LangGraph runnable.

7.3. Chạy ví dụ hồ sơ nhà đầu tư
Khi bạn invoke workflow với một investor_profile cụ thể (ví dụ: nhà đầu tư 35 tuổi, thu nhập ổn định, mục tiêu tăng trưởng dài hạn nhưng vẫn giữ mức rủi ro vừa phải):

risk_grading đề xuất target grade (chẳng hạn “moderate”).

investment_generator (Kathy Wood) tạo kế hoạch tăng trưởng.

buffett_evaluator chấm risk grade (ví dụ “high risk”) và đưa feedback (quá tập trung vào high-growth tech).

evaluate_investment thấy grade ≠ target → “rejected”, quay lại generator.

Generator (Ray Dalio) dùng feedback để đa dạng hoá danh mục, thêm tài sản phòng thủ.

Evaluator chấm lại, gần hơn với “moderate”.

Quá trình lặp đến khi grade phù hợp (hoặc hết số vòng).

Kết quả cuối cùng: state chứa investment_plan đã tinh chỉnh qua nhiều vòng feedback, cùng feedback và iteration_count thể hiện lịch sử phản chiếu.

8. Tổng kết bài giảng
Sau bài học này, người học hiểu rằng:

Evaluator–Optimizer pattern là vòng lặp generator → evaluator → feedback → generator, dùng để tinh chỉnh đầu ra LLM cho đến khi đạt tiêu chí mục tiêu.

State variables đóng vai trò trục chính, lưu hồ sơ nhà đầu tư, target risk grade, kế hoạch hiện tại, feedback và bộ đếm vòng lặp.

Các persona generator/evaluator (Kathy Wood, Ray Dalio, Warren Buffett) chia nhỏ trách nhiệm: sinh chiến lược, đánh giá rủi ro, tối ưu theo feedback.

LangGraph kết nối grading, generation, evaluation và routing thành một reflection loop có điều kiện, tạo nên workflow tư vấn đầu tư linh hoạt và có khả năng tự cải thiện.

# Evaluator-Optimizer Design Pattern

> **Iterative Refinement via Generator-Evaluator Feedback Loops**

---

## Overview

The **Evaluator-Optimizer** pattern uses a reflection loop where a **generator** produces output, an **evaluator** assesses it against target criteria, and **feedback** drives iterative refinement until the result is accepted or a maximum iteration limit is reached.

```
Query → Generator → Evaluator → [Accepted] → Done
                   ↑                │
                   └── Rejected ─────┘
                      + Feedback
```

---

## Use Case: Multi-Agent Investment Advisor

This implementation simulates an investment planning workflow with three distinct LLM personas:

| Persona | Role | Style |
|---|---|---|
| **Kathy Wood** (ARK Invest) | Initial Generator | High-risk, bold innovation, disruptive tech |
| **Ray Dalio** (Bridgewater) | Refinement Generator | Principles-based, macro-aware, addresses feedback |
| **Warren Buffett** (Berkshire Hathaway) | Evaluator | Conservative value investing, capital preservation |

---

## State Schema

```python
class InvestmentState(TypedDict):
    investor_profile: str           # User input describing the investor
    target_grade: str               # Target risk grade (ultra-conservative → high risk)
    investment_plan: str            # Current plan being evaluated
    grade: str                      # Risk grade assigned by evaluator
    feedback: str                   # Evaluator feedback for refinement
    iteration: int                  # Iteration counter
    max_iterations: int             # Max refinement cycles (e.g., 3)
```

---

## Step-by-Step Implementation

### 1. Risk Grading Node

Evaluates the investor profile and assigns a **target risk grade** before generation begins.

```python
def risk_grading_node(state: InvestmentState) -> dict:
    grade_prompt = f"""
    Analyze the investor profile below and assign a risk grade.
    Options: ultra_conservative, conservative, moderate, growth, high_risk.

    Profile: {state["investor_profile"]}

    Return only the grade.
    """
    grade = grade_pipe.invoke(grade_prompt)
    return {"target_grade": grade}
```

### 2. Generator Node — Kathy Wood (Initial)

Produces the first investment strategy without prior feedback.

```python
KATHY_PROMPT = """
You are Kathy Wood, a high-risk, high-reward investor at ARK Invest.
You focus on bold innovation-driven strategies.
Create an aggressive investment plan for:
{investor_profile}
Target risk grade: {target_grade}
"""

def generator_node(state: InvestmentState) -> dict:
    if state.get("feedback"):
        # Use Ray Dalio for refinement (Step 4)
        revised = ray_dalio_pipe.invoke({
            "profile": state["investor_profile"],
            "previous_grade": state["grade"],
            "feedback": state["feedback"],
        })
        return {"investment_plan": revised}

    # Initial generation
    plan = kathy_wood_pipe.invoke({
        "investor_profile": state["investor_profile"],
        "target_grade": state["target_grade"],
    })
    return {"investment_plan": plan}
```

### 3. Feedback Schema

```python
class Evaluation(BaseModel):
    grade: str = Field(description="Risk grade: ultra_conservative, conservative, moderate, growth, high_risk")
    feedback: str = Field(description="Reasoning and suggestions for improvement")
```

### 4. Evaluator Node — Warren Buffett

Assesses the current plan conservatively and returns structured feedback.

```python
BUFFETT_PROMPT = """
You are Warren Buffett, a conservative value investor.
Evaluate this investment plan based on capital preservation,
business fundamentals, and margin of safety.

Investor Profile: {investor_profile}
Target Risk Grade: {target_grade}
Investment Plan: {investment_plan}

Return grade + detailed feedback.
"""

def evaluator_node(state: InvestmentState) -> dict:
    result = buffett_evaluator_pipe.invoke({
        "investor_profile": state["investor_profile"],
        "target_grade": state["target_grade"],
        "investment_plan": state["investment_plan"],
    })
    return {
        "grade": result.grade,
        "feedback": result.feedback,
        "iteration": state["iteration"] + 1,
    }
```

### 5. Refinement Generator — Ray Dalio

Revises the plan using evaluator feedback.

```python
RAY_DALIO_PROMPT = """
You are Ray Dalio. Revise this investment plan based on Warren Buffett's feedback.
Address concerns while targeting the specified returns.

Profile: {profile}
Previous Grade: {previous_grade}
Feedback: {feedback}
"""
```

### 6. Routing (Conditional Edge)

```python
def route_evaluation(state: InvestmentState) -> str:
    if state["grade"] == state["target_grade"] or state["iteration"] >= state["max_iterations"]:
        return "accepted"
    return "rejected"
```

---

## Graph Assembly

```python
builder = StateGraph(InvestmentState)

# Nodes
builder.add_node("risk_grading", risk_grading_node)
builder.add_node("generator", generator_node)
builder.add_node("evaluator", evaluator_node)

# Edges
builder.add_edge(START, "risk_grading")
builder.add_edge("risk_grading", "generator")
builder.add_edge("generator", "evaluator")

# Reflection loop
builder.add_conditional_edges(
    "evaluator",
    route_evaluation,
    {
        "accepted": END,
        "rejected": "generator",  # Loop back with feedback
    }
)

graph = builder.compile()
```

---

## Execution Flow

```
Input: "I'm 30 years old, high risk tolerance, interested in tech and crypto"
       │
       ▼
[Risk Grading] → target_grade = "high_risk"
       │
       ▼
[Generator — Kathy Wood] → Initial aggressive plan
       │
       ▼
[Evaluator — Warren Buffett] → grade = "growth", feedback = "Too speculative, reduce crypto"
       │
       ├── grade == target_grade? → No
       │
       ▼
[Generator — Ray Dalio] → Revised plan incorporating feedback
       │
       ▼
[Evaluator — Warren Buffett] → grade = "high_risk", feedback = "Balanced, acceptable risk"
       │
       ├── grade == target_grade? → Yes
       │
       ▼
[END] → Final investment plan returned
```

---

## State Progression Example

| Iteration | Plan | Grade | Feedback | Accepted? |
|---|---|---|---|---|
| 0 (initial) | 80% crypto, 20% AI startups | high_risk | — | — |
| 1 | 100% crypto, speculative | high_risk | "No margin of safety" | ❌ |
| 2 | 50% crypto, 30% tech ETF, 20% bonds | high_risk | "Acceptable risk" | ✅ |

---

## Key Design Considerations

| Aspect | Detail |
|---|---|
| **Max iterations** | Prevents infinite loops when convergence is impossible |
| **Structured feedback** | Schema-enforced `grade` + `feedback` fields improve consistency |
| **Persona separation** | Distinct LLM prompts per node avoid role confusion |
| **State persistence** | `iteration` counter and `feedback` survive across loop cycles |
| **Graceful exit** | `max_iterations` trigger returns the best-effort result instead of blocking |

---

## Summary

The Evaluator-Optimizer pattern enables iterative, multi-perspective refinement of LLM outputs. By combining generator personas (Kathy Wood → Ray Dalio) with an evaluator (Warren Buffett), LangGraph's conditional edges create a deterministic reflection loop that converges on target criteria or fails gracefully within set bounds.

# Mẫu Thiết Kế Orchestrator (Orchestrator Design Pattern)

Trong video này, bạn sẽ tìm hiểu về mẫu thiết kế orchestrator cho các luồng công việc động.

*   **Mục tiêu học tập:**
    *   Hiểu mẫu thiết kế orchestrator cho các luồng công việc động.
    *   Xem cách phân công nhiệm vụ và điều phối các worker song song diễn ra trong thời gian thực.
    *   Khám phá vai trò của các biến trạng thái (state variables) và trạng thái của worker (worker states) trong việc quản lý ngữ cảnh.
    *   Học cách kết hợp kết quả đầu ra từ các worker thành một kết quả thống nhất cuối cùng.

## Vấn đề: Luồng công việc tĩnh

Trong các mẫu thiết kế trước đây, luồng công việc là **tĩnh**. Bạn phải biết trước vấn đề. Nhưng nếu bạn không biết độ phức tạp của nó thì sao? Đó là lúc mẫu thiết kế **Orchestrator** phát huy tác dụng.

### Ví dụ tương tự: Người lập kế hoạch tiệc

Hãy tưởng tượng một người lập kế hoạch cho các bữa tối đa chủ đề trên một con tàu du lịch. Yêu cầu của khách thay đổi hàng ngày, khiến thực đơn không thể đoán trước. Orchestrator điều phối các nhiệm vụ một cách linh hoạt, thích ứng trong thời gian thực.

1.  **Yêu cầu:** Một người lập kế hoạch tiệc nhận được yêu cầu: "chuẩn bị mỳ Ý và taco Mexico".
2.  **Phân tích & Phân công:** Bếp trưởng (Orchestrator) phân tích yêu cầu, chỉ định các đầu bếp chuyên môn và tạo các gói công việc.
3.  **Thực thi song song:** Các đầu bếp Ý và Mexico làm việc song song.
4.  **Tổng hợp:** Một người tổng hợp (synthesizer) kết hợp các kết quả đầu ra thành một hướng dẫn bữa tối.

Ngày hôm sau, yêu cầu tăng lên bao gồm nhiều món ăn quốc tế. Orchestrator tuyển dụng năm đầu bếp, mỗi người đóng góp song song. Một synthesizer hợp nhất tất cả các đóng góp thành một kế hoạch tiệc buffet.

## Mẫu thiết kế Orchestrator trong Lập trình

Trong các mẫu thiết kế orchestrator, các **agent worker chuyên biệt** thay thế cho các đầu bếp.

*   Một **Orchestrator** trung tâm phân công nhiệm vụ, quản lý ngữ cảnh và điều phối thực thi song song.
*   Một **Synthesizer** hợp nhất các kết quả đầu ra.

Một điểm khác biệt chính so với các đồ thị khác là node **`assign_workers`**, quyết định cần bao nhiêu agent và định tuyến nhiệm vụ. Sử dụng hàm `send` của LangGraph, nó gửi dữ liệu có cấu trúc cho 2-10+ worker dựa trên độ phức tạp.

### Worker State và State Variable

*   **Worker State:** Một container riêng cho các chi tiết cụ thể của nhiệm vụ, khác biệt với state variable được chia sẻ.
*   **State & Worker State:** Các biến này chia sẻ các cặp key-value, cho phép worker truy cập ngữ cảnh được chia sẻ trong khi vẫn giữ các chi tiết cụ thể của nhiệm vụ của riêng mình.

**Luồng hoạt động:**
1.  **Planner** cung cấp đầu vào.
2.  **Orchestrator** xuất ra một danh sách các `sections`.
3.  Hàm **`send`** chuyển mỗi `section` cho một worker.

## Triển khai với LangGraph

Sau khi nhập các thư viện cần thiết và khởi tạo LLM, chúng ta sẽ sử dụng một state variable để quản lý dữ liệu luồng công việc.

### 1. Định nghĩa State

*   `meals`: Lưu trữ đầu vào của người dùng.
*   `sections`: Giữ các đối tượng món ăn (tên, thành phần, ẩm thực) từ Orchestrator.
*   `completed_underscore_menu`: Hợp nhất kết quả từ các worker song song thông qua `operator.add`.
*   `final_underscore_meal_guide`: Giữ hướng dẫn bữa ăn đã được định dạng.

### 2. Định nghĩa Worker State

Trong danh sách `sections` của state, node `assign_workers` sử dụng `send` để chuyển từng đối tượng món ăn trong biến `section` đến worker state của mỗi agent worker. Worker state cũng bao gồm danh sách `completed_menu` được chia sẻ thông qua state variable.

### 3. Orchestrator

Orchestrator sử dụng lớp `Dish` để tạo ra các kết quả có cấu trúc với ba trường: `name`, `ingredients`, và `location`, được đóng gói vào một schema `Direction` trong key `sections` của state.

*   **LLM Orchestrator:** Sử dụng `dish_prompt` để chia yêu cầu bữa ăn thành tên món, thành phần và loại ẩm thực. Nó được căn chỉnh với `planner_pipe` để đảm bảo Orchestrator trả về các đối tượng món ăn được định dạng đúng.
*   **Quá trình I/O:** Orchestrator nhận đầu vào bữa ăn (ví dụ: "chuẩn bị mỳ Ý, taco Mexico, cà ri Ấn Độ..."), và xuất ra một tập hợp các đối tượng món ăn. Mỗi đối tượng này sẽ điền vào trường `sections` của state.

### 4. Node `assign_workers`

Node này truy cập có điều kiện vào state variable, trích xuất key `sections` và lấy các đối tượng món ăn. Hàm `send` chuyển từng món ăn qua biến `section` trong worker state đến node `chef_worker`.

### 5. Node Worker (Chef)

*   **LLM của Worker:** `chef_prompt` sử dụng `location`, `name`, và `ingredients` của món ăn để tạo ra một "persona" đầu bếp cung cấp hướng dẫn nấu ăn chi tiết. `chef_pipe` nối chuỗi này với LLM để xử lý.
*   **Logic của Worker:** Node `chef_worker` xây dựng một `completed_menu` bằng cách nhận một đối tượng món ăn trong worker state. Nó trích xuất thông tin để tạo hướng dẫn nấu ăn và trả về kế hoạch bữa ăn trong danh sách `completed_underscore_menu`.
*   **Cập nhật State:** Key `completed_underscore_menu` được cập nhật tự động vì worker state và state chia sẻ key này. `operator.add` nối thêm mỗi thực đơn vào `completed_underscore_menu` như một danh sách.

### 6. Node Synthesizer

Node synthesizer lấy tất cả các kế hoạch bữa ăn đã hoàn thành từ state variable `completed_underscore_menu`, kết hợp chúng thành một chuỗi đã định dạng và trả về `final_underscore_meal_guide` thống nhất.

## Xây dựng và Chạy Graph

1.  **Khởi tạo Graph:** Tạo một `StateGraph` với schema của state.
2.  **Thêm Nodes:**
    *   `orchestrator`: Để phân rã nhiệm vụ.
    *   `chef_worker`: Để cung cấp chuyên môn nấu ăn.
    *   `synthesizer`: Để kết hợp kết quả.
3.  **Thêm Edges (Cạnh):**
    *   Node `assign_workers` nhận đầu vào từ node `orchestrator` và tạo các cạnh có điều kiện đến các node worker, tạo ra các đường thực thi song song dựa trên số lượng món ăn.
    *   Thêm các cạnh từ các node worker đến `synthesizer`.
    *   Thêm một cạnh bắt đầu (start edge) đến `orchestrator` và một cạnh kết thúc (end edge) từ `synthesizer`.
4.  **Biên dịch (Compile):** Biên dịch đồ thị.

### Gọi Graph

Bạn có thể gọi đồ thị để chuẩn bị các bữa ăn đã cho.

*   **Đầu vào:** Yêu cầu chuẩn bị nhiều bữa ăn được truyền qua key `meals`.
*   **Orchestrator:** Cung cấp một công thức chi tiết với hướng dẫn nấu ăn cho các agent worker.
*   **Assign Node:** Lấy danh sách `sections` từ orchestrator và gửi từng món ăn đến các node worker riêng biệt bằng `send`.
*   **Worker:** Mỗi worker xuất ra một `completed_menu` được lưu trữ trong key `completed_underscore_menu`.
*   **Synthesizer:** Cuối cùng, các phần tử trong `completed_underscore_menu` được nối lại thành `final_underscore_meal_guide`.

## Tổng kết

Trong video này, bạn đã học được rằng:

*   Mẫu thiết kế **Orchestrator** quản lý các luồng công việc động bằng cách phân rã các yêu cầu phức tạp và phân công nhiệm vụ cho các agent worker chuyên biệt.
*   **Worker state** và **shared state variables** giữ cho các chi tiết cụ thể của nhiệm vụ và ngữ cảnh được chia sẻ riêng biệt nhưng vẫn có thể truy cập được để xử lý phối hợp.
*   Node **`assign_workers`** định tuyến các nhiệm vụ song song và mỗi worker tạo ra các kết quả chi tiết dựa trên các đầu vào có cấu trúc.
*   Một node **synthesizer** kết hợp tất cả các kết quả đầu ra của worker thành một kết quả thống nhất, cho phép thực thi luồng công việc linh hoạt và có khả năng mở rộng.

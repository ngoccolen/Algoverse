-- File: restore_algorithms.sql
-- Description: Khôi phục lại dữ liệu bị mất cho các thuật toán (Sorting, Searching, Graph, Data Structures)

-- 1. Đảm bảo cấu trúc bảng là đầy đủ trước khi chèn (có IF NOT EXISTS tránh lỗi)
ALTER TABLE defaultdb.algorithms ADD COLUMN IF NOT EXISTS theory LONGTEXT;
ALTER TABLE defaultdb.algorithms ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'Easy';
ALTER TABLE defaultdb.algorithms ADD COLUMN IF NOT EXISTS complexity VARCHAR(50) DEFAULT 'O(n)';

-- Mở rộng độ dài (tránh Data too long)
ALTER TABLE defaultdb.algorithms MODIFY COLUMN time_complexity VARCHAR(255);
ALTER TABLE defaultdb.algorithms MODIFY COLUMN space_complexity VARCHAR(255);

-- 2. Xóa các dữ liệu cũ hiện có để tránh trùng lặp
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE defaultdb.algorithms;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Bắt đầu chèn lại dữ liệu đầy đủ
INSERT INTO defaultdb.algorithms (alg_key, name, category, difficulty, complexity, time_complexity, space_complexity, description, theory) VALUES
(
    'bubble-sort', 'Bubble Sort', 'Sorting', 'Easy', 'O(n²)', 'O(n²)', 'O(1)',
    'Thuật toán sắp xếp nổi bọt cơ bản.',
    '## Bubble Sort là gì?\n\nBubble Sort (Sắp xếp nổi bọt) là một thuật toán sắp xếp đơn giản. Nó hoạt động bằng cách lặp đi lặp lại việc hoán đổi các phần tử kề nhau nếu chúng ở sai thứ tự. Thuật toán này có tên như vậy vì với mỗi lần lặp, phần tử lớn nhất sẽ "nổi" lên cuối mảng, giống như bong bóng nổi lên mặt nước.\n\n### Ý tưởng chính:\n- So sánh từng cặp phần tử liền kề.\n- Nếu phần tử trước lớn hơn phần tử sau, hoán đổi chúng.\n- Lặp lại cho đến khi không còn cặp nào cần hoán đổi.\n\n### Độ phức tạp:\n- **Thời gian tốt nhất:** `O(n)` (khi mảng đã được sắp xếp).\n- **Thời gian trung bình & xấu nhất:** `O(n^2)`.\n- **Không gian:** `O(1)` (sắp xếp tại chỗ).'
),
(
    'selection-sort', 'Selection Sort', 'Sorting', 'Easy', 'O(n²)', 'O(n²)', 'O(1)',
    'Thuật toán sắp xếp chọn.',
    '## Selection Sort là gì?\n\nSelection Sort (Sắp xếp chọn) là thuật toán sắp xếp hoạt động bằng cách lặp lại việc tìm phần tử nhỏ nhất từ phần chưa được sắp xếp và đưa nó về đầu mảng.\n\n### Ý tưởng chính:\n- Chia mảng thành 2 phần: đã sắp xếp và chưa sắp xếp.\n- Tìm phần tử nhỏ nhất trong phần chưa sắp xếp.\n- Đổi chỗ phần tử nhỏ nhất đó với phần tử đầu tiên của phần chưa sắp xếp.\n- Lặp lại cho đến khi mảng được sắp xếp hoàn toàn.\n\n### Độ phức tạp:\n- **Thời gian:** `O(n^2)` trong mọi trường hợp.\n- **Không gian:** `O(1)`.'
),
(
    'insertion-sort', 'Insertion Sort', 'Sorting', 'Easy', 'O(n²)', 'O(n²)', 'O(1)',
    'Thuật toán sắp xếp chèn.',
    '## Insertion Sort là gì?\n\nInsertion Sort (Sắp xếp chèn) là một thuật toán sắp xếp đơn giản hoạt động tương tự như cách bạn sắp xếp các quân bài trên tay của mình.\n\n### Ý tưởng chính:\n- Giả sử phần tử đầu tiên đã được sắp xếp.\n- Lấy phần tử tiếp theo và "chèn" nó vào đúng vị trí trong phần đã sắp xếp ở phía trước nó.\n- Lặp lại cho tất cả các phần tử.\n\n### Độ phức tạp:\n- **Thời gian tốt nhất:** `O(n)` (khi mảng đã sắp xếp).\n- **Thời gian xấu nhất:** `O(n^2)`.\n- **Không gian:** `O(1)`.'
),
(
    'merge-sort', 'Merge Sort', 'Sorting', 'Medium', 'O(n log n)', 'O(n log n)', 'O(n)',
    'Thuật toán sắp xếp trộn.',
    '## Merge Sort là gì?\n\nMerge Sort (Sắp xếp trộn) là thuật toán sắp xếp dựa trên mô hình **Chia để trị (Divide and Conquer)**.\n\n### Ý tưởng chính:\n- **Chia (Divide):** Chia mảng ban đầu thành 2 mảng con bằng nhau.\n- **Trị (Conquer):** Đệ quy gọi Merge Sort cho mỗi mảng con để sắp xếp chúng.\n- **Gộp (Combine):** Trộn (Merge) 2 mảng con đã sắp xếp thành 1 mảng đã sắp xếp hoàn chỉnh.\n\n### Độ phức tạp:\n- **Thời gian:** `O(n log n)` trong mọi trường hợp (Rất ổn định).\n- **Không gian:** `O(n)` do cần mảng phụ để trộn.'
),
(
    'quick-sort', 'Quick Sort', 'Sorting', 'Hard', 'O(n log n)', 'O(n log n)', 'O(log n)',
    'Thuật toán sắp xếp nhanh.',
    '## Quick Sort là gì?\n\nQuick Sort (Sắp xếp nhanh) cũng là một thuật toán dựa trên mô hình **Chia để trị**. Nó là một trong những thuật toán sắp xếp hiệu quả nhất trong thực tế.\n\n### Ý tưởng chính:\n- **Chọn chốt (Pivot):** Chọn một phần tử trong mảng làm chốt (có thể là phần tử cuối, đầu, hoặc giữa).\n- **Phân chia (Partition):** Đưa các phần tử nhỏ hơn chốt về bên trái, lớn hơn chốt về bên phải. Lúc này chốt đã nằm đúng vị trí.\n- **Đệ quy:** Đệ quy gọi Quick Sort cho mảng bên trái và bên phải chốt.\n\n### Độ phức tạp:\n- **Thời gian trung bình:** `O(n log n)`.\n- **Thời gian xấu nhất:** `O(n^2)` (khi mảng đã sắp xếp và chọn chốt xấu).\n- **Không gian:** `O(log n)` (cho call stack đệ quy).'
),
(
    'linear-search', 'Linear Search', 'Searching', 'Easy', 'O(n)', 'O(n)', 'O(1)',
    'Tìm kiếm tuyến tính.',
    '## Linear Search là gì?\n\nTìm kiếm tuyến tính là phương pháp tìm kiếm đơn giản nhất, duyệt tuần tự từng phần tử trong mảng để tìm giá trị cần thiết.\n\n### Độ phức tạp:\n- **Thời gian:** `O(n)`.\n- **Không gian:** `O(1)`.'
),
(
    'binary-search', 'Binary Search', 'Searching', 'Medium', 'O(log n)', 'O(log n)', 'O(1)',
    'Tìm kiếm nhị phân.',
    '## Binary Search là gì?\n\nTìm kiếm nhị phân là thuật toán tìm kiếm nhanh trên mảng **đã được sắp xếp**. Nó liên tục chia đôi khoảng tìm kiếm cho đến khi tìm thấy phần tử.\n\n### Độ phức tạp:\n- **Thời gian:** `O(log n)`.\n- **Không gian:** `O(1)`.'
),
(
    'bfs', 'Breadth-First Search (BFS)', 'Graph', 'Medium', 'O(V + E)', 'O(V + E)', 'O(V)',
    'Tìm kiếm theo chiều rộng.',
    '## BFS là gì?\n\nBFS duyệt đồ thị theo từng tầng. Thuật toán thường dùng Queue để lưu trữ các đỉnh đang chờ duyệt. BFS hữu ích để tìm đường đi ngắn nhất trên đồ thị không trọng số.'
),
(
    'dfs', 'Depth-First Search (DFS)', 'Graph', 'Medium', 'O(V + E)', 'O(V + E)', 'O(V)',
    'Tìm kiếm theo chiều sâu.',
    '## DFS là gì?\n\nDFS đi sâu vào một nhánh của đồ thị cho đến khi không thể đi tiếp, sau đó quay lui (backtrack). DFS thường dùng Đệ quy hoặc Stack.'
);

-- Done!

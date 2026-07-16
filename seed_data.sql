-- ============================================================
-- ALGOVERSE SEED DATA
-- Chạy file này sau khi đã tạo bảng từ querySQL.sql
-- ============================================================

-- ============================================================
-- PHẦN 1: THÊM THUẬT TOÁN MỚI (algorithms + questions)
-- ============================================================

-- 1. Merge Sort
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('merge-sort', 'Merge Sort', 'Sorting', 
'Merge Sort là thuật toán sắp xếp theo phương pháp chia để trị (Divide and Conquer). Thuật toán chia mảng thành hai nửa, đệ quy sắp xếp từng nửa rồi trộn (merge) hai nửa đã sắp xếp lại với nhau. Merge Sort có độ phức tạp O(n log n) trong mọi trường hợp, ổn định hơn Quick Sort.',
'function mergeSort(arr):\n  if length(arr) <= 1:\n    return arr\n  mid = length(arr) / 2\n  left = mergeSort(arr[0..mid])\n  right = mergeSort(arr[mid..n])\n  return merge(left, right)\n\nfunction merge(left, right):\n  result = []\n  while left and right not empty:\n    if left[0] <= right[0]:\n      result.append(left.pop(0))\n    else:\n      result.append(right.pop(0))\n  return result + left + right',
'O(n log n)', 'O(n)', NOW());

-- 2. Binary Search
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('binary-search', 'Binary Search', 'Searching',
'Binary Search (Tìm kiếm nhị phân) là thuật toán tìm kiếm hiệu quả trên mảng đã được sắp xếp. Thuật toán so sánh phần tử cần tìm với phần tử giữa mảng, sau đó loại bỏ một nửa mảng không chứa kết quả. Quá trình lặp lại cho đến khi tìm thấy hoặc mảng rỗng.',
'function binarySearch(arr, target):\n  left = 0\n  right = length(arr) - 1\n  while left <= right:\n    mid = (left + right) / 2\n    if arr[mid] == target:\n      return mid\n    else if arr[mid] < target:\n      left = mid + 1\n    else:\n      right = mid - 1\n  return -1',
'O(log n)', 'O(1)', NOW());

-- 3. BFS (Breadth-First Search)
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('bfs', 'Breadth-First Search (BFS)', 'Graph',
'BFS (Duyệt theo chiều rộng) là thuật toán duyệt đồ thị bắt đầu từ một đỉnh nguồn, thăm tất cả các đỉnh kề trước khi chuyển sang các đỉnh ở mức tiếp theo. BFS sử dụng hàng đợi (Queue) và thường dùng để tìm đường đi ngắn nhất trong đồ thị không trọng số.',
'function BFS(graph, start):\n  queue = [start]\n  visited = {start}\n  while queue not empty:\n    node = queue.dequeue()\n    process(node)\n    for neighbor in graph[node]:\n      if neighbor not in visited:\n        visited.add(neighbor)\n        queue.enqueue(neighbor)',
'O(V + E)', 'O(V)', NOW());

-- 4. DFS (Depth-First Search)
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('dfs', 'Depth-First Search (DFS)', 'Graph',
'DFS (Duyệt theo chiều sâu) là thuật toán duyệt đồ thị đi sâu vào một nhánh trước khi quay lui (backtrack). DFS sử dụng ngăn xếp (Stack) hoặc đệ quy. Thuật toán được dùng để phát hiện chu trình, sắp xếp tôpô, và tìm thành phần liên thông.',
'function DFS(graph, node, visited):\n  visited.add(node)\n  process(node)\n  for neighbor in graph[node]:\n    if neighbor not in visited:\n      DFS(graph, neighbor, visited)',
'O(V + E)', 'O(V)', NOW());

-- 5. Stack (Ngăn xếp)
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('stack', 'Stack (Ngăn xếp)', 'Data Structure',
'Stack (Ngăn xếp) là cấu trúc dữ liệu hoạt động theo nguyên tắc LIFO (Last In, First Out - Vào sau ra trước). Các thao tác cơ bản gồm push (thêm phần tử vào đỉnh), pop (lấy phần tử đỉnh ra), và peek (xem phần tử đỉnh). Stack được dùng rộng rãi trong xử lý biểu thức, quản lý lời gọi hàm, và thuật toán DFS.',
'class Stack:\n  function push(item):\n    top = top + 1\n    data[top] = item\n\n  function pop():\n    if isEmpty(): error\n    item = data[top]\n    top = top - 1\n    return item\n\n  function peek():\n    return data[top]\n\n  function isEmpty():\n    return top == -1',
'O(1) cho push/pop', 'O(n)', NOW());

-- 6. Queue (Hàng đợi)
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('queue', 'Queue (Hàng đợi)', 'Data Structure',
'Queue (Hàng đợi) là cấu trúc dữ liệu hoạt động theo nguyên tắc FIFO (First In, First Out - Vào trước ra trước). Các thao tác gồm enqueue (thêm vào cuối), dequeue (lấy từ đầu), và front (xem phần tử đầu). Queue được dùng trong BFS, xử lý tác vụ, và bộ đệm dữ liệu.',
'class Queue:\n  function enqueue(item):\n    data[rear] = item\n    rear = rear + 1\n\n  function dequeue():\n    if isEmpty(): error\n    item = data[front]\n    front = front + 1\n    return item\n\n  function isEmpty():\n    return front == rear',
'O(1) cho enqueue/dequeue', 'O(n)', NOW());

-- 7. Linked List
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('linked-list', 'Linked List (Danh sách liên kết)', 'Data Structure',
'Linked List là cấu trúc dữ liệu tuyến tính gồm các node, mỗi node chứa dữ liệu và con trỏ đến node tiếp theo. Không giống mảng, Linked List không cần bộ nhớ liên tục và có thể thêm/xóa phần tử ở đầu trong O(1). Nhược điểm là truy cập ngẫu nhiên mất O(n).',
'class Node:\n  data, next\n\nclass LinkedList:\n  head = null\n\n  function insertFront(val):\n    newNode = Node(val)\n    newNode.next = head\n    head = newNode\n\n  function deleteFront():\n    if head == null: return\n    head = head.next\n\n  function search(val):\n    curr = head\n    while curr != null:\n      if curr.data == val: return true\n      curr = curr.next\n    return false',
'O(1) chèn đầu, O(n) tìm kiếm', 'O(n)', NOW());

-- 8. Recursion (Đệ quy)
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('recursion', 'Recursion (Đệ quy)', 'Fundamentals',
'Đệ quy là kỹ thuật lập trình trong đó hàm gọi lại chính nó để giải quyết bài toán nhỏ hơn. Mỗi hàm đệ quy cần có điều kiện dừng (base case) và bước đệ quy (recursive case). Đệ quy là nền tảng của nhiều thuật toán như Merge Sort, DFS, Quy hoạch động.',
'// Ví dụ: Tính giai thừa\nfunction factorial(n):\n  if n <= 1:        // Base case\n    return 1\n  return n * factorial(n - 1)  // Recursive case\n\n// Ví dụ: Fibonacci\nfunction fib(n):\n  if n <= 1: return n\n  return fib(n-1) + fib(n-2)',
'Tùy bài toán', 'O(n) call stack', NOW());

-- 9. Counting Sort
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('counting-sort', 'Counting Sort', 'Sorting',
'Counting Sort là thuật toán sắp xếp không so sánh, hoạt động bằng cách đếm số lần xuất hiện của mỗi phần tử. Thuật toán rất hiệu quả khi phạm vi giá trị (k) nhỏ so với số lượng phần tử (n). Counting Sort ổn định và có thể đạt O(n+k).',
'function countingSort(arr, maxVal):\n  count = array of size (maxVal + 1), init 0\n  for each x in arr:\n    count[x] = count[x] + 1\n  index = 0\n  for i = 0 to maxVal:\n    while count[i] > 0:\n      arr[index] = i\n      index = index + 1\n      count[i] = count[i] - 1',
'O(n + k)', 'O(k)', NOW());

-- 10. Two Pointers (Hai con trỏ)
INSERT INTO algorithms (alg_key, name, category, description, pseudo_code, time_complexity, space_complexity, created_at) VALUES
('two-pointers', 'Two Pointers (Hai con trỏ)', 'Techniques',
'Two Pointers là kỹ thuật sử dụng hai con trỏ (chỉ số) di chuyển trên mảng để giải quyết bài toán hiệu quả. Thường dùng trên mảng đã sắp xếp. Ví dụ kinh điển: tìm hai số có tổng bằng target, hoặc loại bỏ phần tử trùng lặp.',
'// Ví dụ: Tìm 2 số có tổng = target (mảng đã sắp xếp)\nfunction twoSum(arr, target):\n  left = 0\n  right = length(arr) - 1\n  while left < right:\n    sum = arr[left] + arr[right]\n    if sum == target:\n      return (left, right)\n    else if sum < target:\n      left = left + 1\n    else:\n      right = right - 1\n  return not found',
'O(n)', 'O(1)', NOW());

-- ============================================================
-- CÂU HỎI TRẮC NGHIỆM CHO CÁC THUẬT TOÁN MỚI
-- (Giả sử ID algorithms bắt đầu từ ID tiếp theo trong DB)
-- Dùng subquery để lấy đúng algorithm_id
-- ============================================================

-- Questions cho Merge Sort
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'merge-sort'),
'Merge Sort sử dụng chiến lược nào?',
'["Tham lam (Greedy)", "Chia để trị (Divide and Conquer)", "Quy hoạch động (Dynamic Programming)", "Vét cạn (Brute Force)"]',
1, 'Merge Sort chia mảng thành 2 nửa (Divide), sắp xếp đệ quy (Conquer), rồi trộn lại (Combine).'),

((SELECT id FROM algorithms WHERE alg_key = 'merge-sort'),
'Độ phức tạp thời gian trường hợp xấu nhất của Merge Sort là?',
'["O(n)", "O(n log n)", "O(n²)", "O(log n)"]',
1, 'Merge Sort luôn chia đôi mảng (log n lần) và mỗi lần merge tốn O(n), nên tổng là O(n log n).'),

((SELECT id FROM algorithms WHERE alg_key = 'merge-sort'),
'Merge Sort có phải thuật toán sắp xếp ổn định (stable) không?',
'["Có", "Không", "Tùy cách cài đặt", "Chỉ ổn định với số nguyên"]',
0, 'Merge Sort là thuật toán ổn định vì khi merge, phần tử bằng nhau từ nửa trái luôn được đặt trước.'),

((SELECT id FROM algorithms WHERE alg_key = 'merge-sort'),
'Nhược điểm chính của Merge Sort so với Quick Sort là gì?',
'["Chậm hơn trong mọi trường hợp", "Tốn thêm bộ nhớ O(n)", "Không thể sắp xếp chuỗi", "Không hoạt động với mảng lớn"]',
1, 'Merge Sort cần mảng phụ O(n) để merge, trong khi Quick Sort sắp xếp tại chỗ (in-place).');

-- Questions cho Binary Search
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'binary-search'),
'Điều kiện bắt buộc để áp dụng Binary Search là gì?',
'["Mảng phải có kích thước chẵn", "Mảng phải được sắp xếp", "Mảng chỉ chứa số dương", "Mảng không có phần tử trùng"]',
1, 'Binary Search chỉ hoạt động đúng trên mảng đã được sắp xếp vì nó dựa vào thứ tự để loại bỏ nửa mảng.'),

((SELECT id FROM algorithms WHERE alg_key = 'binary-search'),
'Với mảng có 1024 phần tử, Binary Search cần tối đa bao nhiêu lần so sánh?',
'["1024", "512", "10", "32"]',
2, 'log₂(1024) = 10. Binary Search giảm nửa phạm vi tìm kiếm mỗi bước, nên chỉ cần tối đa 10 lần.'),

((SELECT id FROM algorithms WHERE alg_key = 'binary-search'),
'Trong Binary Search, nếu arr[mid] < target thì bước tiếp theo là gì?',
'["Trả về -1", "left = mid + 1", "right = mid - 1", "mid = mid + 1"]',
1, 'Nếu arr[mid] nhỏ hơn target, target nằm ở nửa bên phải nên ta cập nhật left = mid + 1.');

-- Questions cho BFS
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'bfs'),
'BFS sử dụng cấu trúc dữ liệu nào?',
'["Stack", "Queue", "Heap", "Tree"]',
1, 'BFS dùng Queue (hàng đợi FIFO) để đảm bảo duyệt theo thứ tự mức (level-order).'),

((SELECT id FROM algorithms WHERE alg_key = 'bfs'),
'BFS có thể dùng để tìm đường đi ngắn nhất trong loại đồ thị nào?',
'["Đồ thị có trọng số âm", "Đồ thị không trọng số hoặc trọng số bằng nhau", "Mọi loại đồ thị", "Chỉ cây nhị phân"]',
1, 'BFS tìm đường đi ngắn nhất trong đồ thị không trọng số vì nó duyệt theo từng mức.'),

((SELECT id FROM algorithms WHERE alg_key = 'bfs'),
'Độ phức tạp thời gian của BFS trên đồ thị có V đỉnh và E cạnh là?',
'["O(V)", "O(E)", "O(V + E)", "O(V × E)"]',
2, 'BFS duyệt mỗi đỉnh một lần O(V) và kiểm tra mỗi cạnh một lần O(E), tổng cộng O(V + E).');

-- Questions cho DFS
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'dfs'),
'DFS có thể được cài đặt bằng cách nào?',
'["Chỉ dùng Queue", "Chỉ dùng đệ quy", "Dùng Stack hoặc đệ quy", "Chỉ dùng mảng"]',
2, 'DFS có thể cài bằng đệ quy (sử dụng call stack ngầm) hoặc dùng Stack tường minh.'),

((SELECT id FROM algorithms WHERE alg_key = 'dfs'),
'DFS thường được dùng để giải bài toán nào?',
'["Tìm đường đi ngắn nhất", "Phát hiện chu trình trong đồ thị", "Sắp xếp mảng", "Tìm phần tử lớn nhất"]',
1, 'DFS rất hiệu quả trong việc phát hiện chu trình, tìm thành phần liên thông, và sắp xếp tôpô.');

-- Questions cho Stack
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'stack'),
'Stack hoạt động theo nguyên tắc nào?',
'["FIFO (First In, First Out)", "LIFO (Last In, First Out)", "Random Access", "Priority"]',
1, 'Stack = LIFO: Phần tử được thêm vào cuối cùng sẽ được lấy ra đầu tiên.'),

((SELECT id FROM algorithms WHERE alg_key = 'stack'),
'Ứng dụng thực tế nào KHÔNG dùng Stack?',
'["Nút Undo/Redo trong trình soạn thảo", "Kiểm tra dấu ngoặc hợp lệ", "Hàng đợi in ấn (Print Queue)", "Quản lý lời gọi hàm (Call Stack)"]',
2, 'Hàng đợi in ấn dùng Queue (FIFO), không dùng Stack. Các lựa chọn còn lại đều dùng Stack.'),

((SELECT id FROM algorithms WHERE alg_key = 'stack'),
'Thao tác nào có độ phức tạp O(1) trên Stack?',
'["Tìm kiếm phần tử", "Push và Pop", "Sắp xếp các phần tử", "Truy cập phần tử ở giữa"]',
1, 'Push (thêm) và Pop (lấy ra) ở đỉnh stack đều mất O(1) vì chỉ thao tác ở một đầu.');

-- Questions cho Queue
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'queue'),
'Queue hoạt động theo nguyên tắc nào?',
'["LIFO", "FIFO", "FILO", "Random"]',
1, 'Queue = FIFO (First In, First Out): Phần tử vào trước được lấy ra trước, như xếp hàng mua vé.'),

((SELECT id FROM algorithms WHERE alg_key = 'queue'),
'Thuật toán nào sử dụng Queue?',
'["DFS", "BFS", "Quick Sort", "Binary Search"]',
1, 'BFS (Duyệt theo chiều rộng) sử dụng Queue để duyệt đồ thị theo từng mức.');

-- Questions cho Linked List
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'linked-list'),
'Ưu điểm của Linked List so với Array là gì?',
'["Truy cập ngẫu nhiên nhanh hơn", "Thêm/xóa phần tử ở đầu nhanh hơn (O(1))", "Tốn ít bộ nhớ hơn", "Tìm kiếm nhanh hơn"]',
1, 'Linked List thêm/xóa ở đầu chỉ mất O(1) vì chỉ cần thay đổi con trỏ, không cần dịch chuyển phần tử.'),

((SELECT id FROM algorithms WHERE alg_key = 'linked-list'),
'Để truy cập phần tử thứ k trong Linked List cần bao nhiêu bước?',
'["O(1)", "O(k)", "O(n)", "O(log n)"]',
1, 'Phải duyệt từ đầu qua k node, nên mất O(k). Trường hợp xấu nhất (phần tử cuối) là O(n).');

-- Questions cho Recursion
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'recursion'),
'Thành phần bắt buộc phải có trong mọi hàm đệ quy là gì?',
'["Vòng lặp for", "Điều kiện dừng (Base case)", "Biến toàn cục", "Mảng phụ"]',
1, 'Base case là điều kiện dừng để hàm đệ quy không gọi vô hạn, gây tràn stack.'),

((SELECT id FROM algorithms WHERE alg_key = 'recursion'),
'Hàm factorial(5) sẽ gọi đệ quy bao nhiêu lần?',
'["3", "4", "5", "6"]',
2, 'factorial(5) -> factorial(4) -> factorial(3) -> factorial(2) -> factorial(1). Tổng cộng 5 lần gọi (kể cả lần đầu).');

-- Questions cho Two Pointers
INSERT INTO questions (algorithm_id, question, options, answer, explanation) VALUES
((SELECT id FROM algorithms WHERE alg_key = 'two-pointers'),
'Kỹ thuật Two Pointers thường áp dụng trên loại mảng nào?',
'["Mảng bất kỳ", "Mảng đã sắp xếp", "Mảng có phần tử âm", "Mảng 2 chiều"]',
1, 'Two Pointers thường yêu cầu mảng đã sắp xếp để có thể quyết định di chuyển con trỏ nào.'),

((SELECT id FROM algorithms WHERE alg_key = 'two-pointers'),
'Với mảng [1,3,5,7,9] và target = 8, Two Pointers sẽ tìm được cặp nào?',
'["(1, 7)", "(3, 5)", "(1, 9)", "(5, 3)"]',
0, 'left=0(val=1), right=4(val=9): sum=10>8 -> right--. left=0(val=1), right=3(val=7): sum=8 == target -> trả về (1, 7).');


-- ============================================================
-- PHẦN 2: THÊM BÀI TẬP PRACTICE (problems + test_cases)
-- ============================================================

-- Problem 1: Two Sum
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Two Sum', 'Easy', 'Array',
'<h3>Mô tả</h3><p>Cho một mảng số nguyên <code>nums</code> và một số nguyên <code>target</code>. Tìm hai chỉ số sao cho tổng hai phần tử tại hai chỉ số đó bằng <code>target</code>.</p><p>Mỗi input chỉ có đúng một lời giải. Không được dùng cùng một phần tử hai lần.</p><h3>Ví dụ</h3><pre>Input: nums = [2, 7, 11, 15], target = 9\nOutput: 0 1\nGiải thích: nums[0] + nums[1] = 2 + 7 = 9</pre>',
'4\n2 7 11 15\n9', '0 1', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '4\n2 7 11 15\n9', '0 1', 0),
((SELECT MAX(id) FROM problems), '3\n3 2 4\n6', '1 2', 1),
((SELECT MAX(id) FROM problems), '2\n3 3\n6', '0 1', 1);

-- Problem 2: Palindrome Check
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Kiểm tra Palindrome', 'Easy', 'String',
'<h3>Mô tả</h3><p>Cho một chuỗi <code>s</code>, kiểm tra xem chuỗi đó có phải palindrome (đọc xuôi hay ngược đều giống nhau) không.</p><p>In ra <code>YES</code> nếu là palindrome, <code>NO</code> nếu không.</p><h3>Ví dụ</h3><pre>Input: racecar\nOutput: YES</pre>',
'racecar', 'YES', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), 'racecar', 'YES', 0),
((SELECT MAX(id) FROM problems), 'hello', 'NO', 0),
((SELECT MAX(id) FROM problems), 'abba', 'YES', 1),
((SELECT MAX(id) FROM problems), 'a', 'YES', 1);

-- Problem 3: Reverse Array
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Đảo ngược mảng', 'Easy', 'Array',
'<h3>Mô tả</h3><p>Cho một mảng gồm <code>n</code> số nguyên, hãy in ra mảng sau khi đảo ngược.</p><h3>Input</h3><p>Dòng 1: Số nguyên n. Dòng 2: n số nguyên cách nhau bởi dấu cách.</p><h3>Output</h3><p>Mảng đảo ngược, các phần tử cách nhau bởi dấu cách.</p>',
'5\n1 2 3 4 5', '5 4 3 2 1', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '5\n1 2 3 4 5', '5 4 3 2 1', 0),
((SELECT MAX(id) FROM problems), '1\n42', '42', 1),
((SELECT MAX(id) FROM problems), '3\n10 20 30', '30 20 10', 1);

-- Problem 4: Find Max Element
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Tìm phần tử lớn nhất', 'Easy', 'Array',
'<h3>Mô tả</h3><p>Cho mảng gồm <code>n</code> số nguyên, tìm và in ra giá trị lớn nhất.</p><h3>Ví dụ</h3><pre>Input:\n5\n3 1 4 1 5\nOutput:\n5</pre>',
'5\n3 1 4 1 5', '5', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '5\n3 1 4 1 5', '5', 0),
((SELECT MAX(id) FROM problems), '3\n-1 -5 -2', '-1', 1),
((SELECT MAX(id) FROM problems), '1\n100', '100', 1);

-- Problem 5: Count Vowels
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Đếm nguyên âm', 'Easy', 'String',
'<h3>Mô tả</h3><p>Cho một chuỗi <code>s</code> (chỉ gồm chữ cái thường), đếm số lượng nguyên âm (a, e, i, o, u) trong chuỗi.</p><h3>Ví dụ</h3><pre>Input: algorithm\nOutput: 3</pre>',
'algorithm', '3', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), 'algorithm', '3', 0),
((SELECT MAX(id) FROM problems), 'aeiou', '5', 1),
((SELECT MAX(id) FROM problems), 'xyz', '0', 1);

-- Problem 6: Fibonacci
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Fibonacci thứ N', 'Easy', 'Recursion',
'<h3>Mô tả</h3><p>Cho số nguyên dương <code>n</code>, in ra số Fibonacci thứ n.</p><p>Dãy Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...</p><p>Trong đó F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).</p>',
'10', '55', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '10', '55', 0),
((SELECT MAX(id) FROM problems), '0', '0', 0),
((SELECT MAX(id) FROM problems), '1', '1', 1),
((SELECT MAX(id) FROM problems), '20', '6765', 1);

-- Problem 7: Valid Parentheses
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Kiểm tra ngoặc hợp lệ', 'Medium', 'Stack',
'<h3>Mô tả</h3><p>Cho một chuỗi chỉ gồm các ký tự <code>(</code>, <code>)</code>, <code>{</code>, <code>}</code>, <code>[</code>, <code>]</code>. Kiểm tra xem chuỗi có hợp lệ không.</p><p>Chuỗi hợp lệ khi mỗi ngoặc mở phải có ngoặc đóng tương ứng và theo đúng thứ tự.</p><p>In <code>YES</code> nếu hợp lệ, <code>NO</code> nếu không.</p>',
'()[]{}', 'YES', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '()[]{}', 'YES', 0),
((SELECT MAX(id) FROM problems), '(]', 'NO', 0),
((SELECT MAX(id) FROM problems), '([{}])', 'YES', 1),
((SELECT MAX(id) FROM problems), '((()))', 'YES', 1),
((SELECT MAX(id) FROM problems), '({[)]', 'NO', 1);

-- Problem 8: Counting Sort Implementation
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Sắp xếp đếm (Counting Sort)', 'Medium', 'Sorting',
'<h3>Mô tả</h3><p>Cho mảng gồm <code>n</code> số nguyên không âm (0 ≤ a[i] ≤ 1000). Sắp xếp mảng bằng thuật toán Counting Sort và in ra kết quả.</p><h3>Input</h3><p>Dòng 1: n. Dòng 2: n số nguyên.</p><h3>Output</h3><p>Mảng đã sắp xếp tăng dần.</p>',
'6\n4 2 2 8 3 3', '2 2 3 3 4 8', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '6\n4 2 2 8 3 3', '2 2 3 3 4 8', 0),
((SELECT MAX(id) FROM problems), '5\n5 4 3 2 1', '1 2 3 4 5', 1),
((SELECT MAX(id) FROM problems), '1\n0', '0', 1);

-- Problem 9: Matrix Sum
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Tổng các phần tử ma trận', 'Easy', 'Array',
'<h3>Mô tả</h3><p>Cho ma trận <code>n x m</code> số nguyên, tính tổng tất cả các phần tử trong ma trận.</p><h3>Input</h3><p>Dòng 1: hai số n, m. n dòng tiếp theo, mỗi dòng chứa m số nguyên.</p>',
'2 3\n1 2 3\n4 5 6', '21', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '2 3\n1 2 3\n4 5 6', '21', 0),
((SELECT MAX(id) FROM problems), '1 1\n42', '42', 1),
((SELECT MAX(id) FROM problems), '3 3\n1 0 0\n0 1 0\n0 0 1', '3', 1);

-- Problem 10: Binary Search Implementation
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Tìm kiếm nhị phân', 'Medium', 'Searching',
'<h3>Mô tả</h3><p>Cho mảng <code>n</code> số nguyên <strong>đã sắp xếp tăng dần</strong> và một số <code>target</code>. Tìm vị trí (chỉ số bắt đầu từ 0) của target trong mảng. Nếu không tìm thấy, in ra <code>-1</code>.</p><p>Yêu cầu: Sử dụng thuật toán Binary Search.</p>',
'5\n1 3 5 7 9\n5', '2', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '5\n1 3 5 7 9\n5', '2', 0),
((SELECT MAX(id) FROM problems), '5\n1 3 5 7 9\n6', '-1', 0),
((SELECT MAX(id) FROM problems), '1\n42\n42', '0', 1),
((SELECT MAX(id) FROM problems), '7\n2 4 6 8 10 12 14\n14', '6', 1);

-- Problem 11: Sum of Digits
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Tổng các chữ số', 'Easy', 'Math',
'<h3>Mô tả</h3><p>Cho một số nguyên dương <code>n</code>, tính tổng các chữ số của n.</p><h3>Ví dụ</h3><pre>Input: 12345\nOutput: 15\nGiải thích: 1 + 2 + 3 + 4 + 5 = 15</pre>',
'12345', '15', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '12345', '15', 0),
((SELECT MAX(id) FROM problems), '9', '9', 1),
((SELECT MAX(id) FROM problems), '100', '1', 1),
((SELECT MAX(id) FROM problems), '999999', '54', 1);

-- Problem 12: Remove Duplicates
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Loại bỏ phần tử trùng lặp', 'Medium', 'Array',
'<h3>Mô tả</h3><p>Cho mảng <code>n</code> số nguyên <strong>đã sắp xếp tăng dần</strong>, in ra mảng sau khi loại bỏ các phần tử trùng lặp (giữ lại mỗi giá trị một lần).</p><h3>Ví dụ</h3><pre>Input:\n7\n1 1 2 2 3 4 4\nOutput:\n1 2 3 4</pre>',
'7\n1 1 2 2 3 4 4', '1 2 3 4', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '7\n1 1 2 2 3 4 4', '1 2 3 4', 0),
((SELECT MAX(id) FROM problems), '5\n1 1 1 1 1', '1', 1),
((SELECT MAX(id) FROM problems), '3\n1 2 3', '1 2 3', 1);

-- Problem 13: GCD (Greatest Common Divisor)
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Ước chung lớn nhất (GCD)', 'Easy', 'Math',
'<h3>Mô tả</h3><p>Cho hai số nguyên dương <code>a</code> và <code>b</code>, tìm ước chung lớn nhất (GCD) của chúng.</p><p>Gợi ý: Sử dụng thuật toán Euclid.</p><h3>Ví dụ</h3><pre>Input: 12 18\nOutput: 6</pre>',
'12 18', '6', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '12 18', '6', 0),
((SELECT MAX(id) FROM problems), '7 13', '1', 1),
((SELECT MAX(id) FROM problems), '100 75', '25', 1),
((SELECT MAX(id) FROM problems), '1000000 500000', '500000', 1);

-- Problem 14: Merge Two Sorted Arrays
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Trộn hai mảng đã sắp xếp', 'Medium', 'Sorting',
'<h3>Mô tả</h3><p>Cho hai mảng số nguyên đã sắp xếp tăng dần, trộn chúng thành một mảng duy nhất cũng được sắp xếp tăng dần.</p><h3>Input</h3><p>Dòng 1: n (kích thước mảng 1). Dòng 2: n số nguyên. Dòng 3: m (kích thước mảng 2). Dòng 4: m số nguyên.</p>',
'3\n1 3 5\n3\n2 4 6', '1 2 3 4 5 6', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '3\n1 3 5\n3\n2 4 6', '1 2 3 4 5 6', 0),
((SELECT MAX(id) FROM problems), '2\n1 2\n3\n3 4 5', '1 2 3 4 5', 1),
((SELECT MAX(id) FROM problems), '1\n5\n1\n5', '5 5', 1);

-- Problem 15: Power of Two
INSERT INTO problems (title, difficulty, category, content_html, sample_input, sample_output, total_submissions, solved, is_public) VALUES
('Kiểm tra lũy thừa của 2', 'Easy', 'Bit Manipulation',
'<h3>Mô tả</h3><p>Cho một số nguyên dương <code>n</code>, kiểm tra xem n có phải là lũy thừa của 2 hay không.</p><p>In <code>YES</code> nếu đúng, <code>NO</code> nếu sai.</p><p>Gợi ý: Một số là lũy thừa của 2 khi biểu diễn nhị phân chỉ có đúng 1 bit 1.</p>',
'16', 'YES', 0, 0, 1);

INSERT INTO test_cases (problem_id, input_text, output_text, is_hidden) VALUES
((SELECT MAX(id) FROM problems), '16', 'YES', 0),
((SELECT MAX(id) FROM problems), '1', 'YES', 0),
((SELECT MAX(id) FROM problems), '6', 'NO', 1),
((SELECT MAX(id) FROM problems), '1024', 'YES', 1),
((SELECT MAX(id) FROM problems), '0', 'NO', 1);


-- ============================================================
-- PHẦN 3: THÊM CUỘC THI (contests + contest_problems)
-- ============================================================

INSERT INTO contests (title, description, start_time, end_time, difficulty, participants, prize) VALUES
('Algoverse Weekly #1 - Khởi động', 
'Cuộc thi hàng tuần dành cho người mới bắt đầu. Giải các bài tập cơ bản về mảng, chuỗi và toán học.', 
'2026-07-20 14:00:00', '2026-07-20 16:00:00', 'Easy', 0, 'Badge "First Step"'),

('Algoverse Weekly #2 - Tư duy thuật toán', 
'Cuộc thi tập trung vào các thuật toán sắp xếp và tìm kiếm. Thử thách khả năng áp dụng Binary Search và Sorting.', 
'2026-07-27 14:00:00', '2026-07-27 16:30:00', 'Medium', 0, 'Badge "Algorithm Thinker"'),

('Algoverse Monthly Challenge - Tháng 7', 
'Cuộc thi tháng với các bài tập tổng hợp từ Easy đến Medium. Bao gồm Stack, Queue, Recursion và Two Pointers.', 
'2026-08-01 09:00:00', '2026-08-01 12:00:00', 'Medium', 0, 'Badge "Monthly Champion" + Sticker Pack'),

('Code Sprint: Data Structures', 
'Cuộc thi nhanh 90 phút tập trung vào cấu trúc dữ liệu. Giải quyết các bài toán thực tế sử dụng Stack, Queue, Linked List.', 
'2026-08-10 19:00:00', '2026-08-10 20:30:00', 'Medium', 0, 'Badge "DS Master"');


-- ============================================================
-- XONG! Tổng kết:
-- - 10 thuật toán mới (Merge Sort, Binary Search, BFS, DFS, 
--   Stack, Queue, Linked List, Recursion, Counting Sort, Two Pointers)
-- - ~25 câu hỏi trắc nghiệm
-- - 15 bài tập practice với test cases
-- - 4 cuộc thi
-- ============================================================

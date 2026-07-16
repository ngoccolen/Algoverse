export const ALGORITHM_RESOURCES = {
  // 1. BUBBLE SORT 
  'bubble-sort': {
    // Code mẫu để hiển thị ở tab "Mô phỏng" 
    sampleCode: {
      cpp: `#include <iostream>
            #include <vector>
            using namespace std;

            void bubbleSort(vector<int>& arr) {
                int n = arr.size();
                for (int i = 0; i < n - 1; i++) {
                    for (int j = 0; j < n - i - 1; j++) {
                        if (arr[j] > arr[j + 1]) {
                            swap(arr[j], arr[j + 1]);
                        }
                    }
                }
            }`,
      java: `public class Main {
                public static void bubbleSort(int[] arr) {
                    int n = arr.length;
                    for (int i = 0; i < n - 1; i++) {
                        for (int j = 0; j < n - i - 1; j++) {
                            if (arr[j] > arr[j + 1]) {
                                int temp = arr[j];
                                arr[j] = arr[j + 1];
                                arr[j + 1] = temp;
                            }
                        }
                    }
                }
            }`,
      python: `def bubble_sort(arr):
                n = len(arr)
                for i in range(n - 1):
                    for j in range(n - i - 1):
                        if arr[j] > arr[j + 1]:
                            arr[j], arr[j + 1] = arr[j + 1], arr[j]`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Hãy viết hàm bubbleSort hoàn chỉnh
            #include <vector>
            #include <algorithm>
            using namespace std;

            void bubbleSort(vector<int>& arr) {
                // Viết code của bạn tại đây...
                
            }`,
      java: `// BÀI TẬP: Hãy viết hàm bubbleSort hoàn chỉnh
                    public class Solution {
                        public static void bubbleSort(int[] arr) {
                            // Viết code của bạn tại đây...
                            
                        }
                    }`,
      python: `# BÀI TẬP: Hãy viết hàm bubble_sort hoàn chỉnh
                def bubble_sort(arr):
                    # Viết code của bạn tại đây...
                    pass`
                    }
                },

  // SELECTION SORT 
  'selection-sort': {
    sampleCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx])
                min_idx = j;
        }
        swap(arr[min_idx], arr[i]);
    }
}`,
      java: `public class Main {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int min_idx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[min_idx])
                    min_idx = j;
            }
            int temp = arr[min_idx];
            arr[min_idx] = arr[i];
            arr[i] = temp;
        }
    }
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Hãy viết hàm selectionSort hoàn chỉnh
#include <vector>
#include <algorithm>
using namespace std;

void selectionSort(vector<int>& arr) {
    // Gợi ý: Tìm phần tử nhỏ nhất và đưa về đầu mảng
    
}`,
      java: `// BÀI TẬP: Hãy viết hàm selectionSort hoàn chỉnh
public class Solution {
    public static void selectionSort(int[] arr) {
        // Gợi ý: Tìm phần tử nhỏ nhất và đưa về đầu mảng
        
    }
}`,
      python: `# BÀI TẬP: Hãy viết hàm selection_sort hoàn chỉnh
def selection_sort(arr):
    // Gợi ý: Tìm phần tử nhỏ nhất và đưa về đầu mảng
    pass`
    }
  },

  // INSERTION SORT 
  'insertion-sort': {
    sampleCode: {
      cpp: `#include <vector>
using namespace std;

void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
      java: `public class Main {
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; ++i) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
    }
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Hãy viết hàm insertionSort hoàn chỉnh
#include <vector>
#include <algorithm>
using namespace std;

void insertionSort(vector<int>& arr) {
    // Gợi ý: Chèn phần tử vào đúng vị trí trong mảng con đã sắp xếp
    
}`,
      java: `// BÀI TẬP: Hãy viết hàm insertionSort hoàn chỉnh
public class Solution {
    public static void insertionSort(int[] arr) {
        // Gợi ý: Chèn phần tử vào đúng vị trí trong mảng con đã sắp xếp
        
    }
}`,
      python: `# BÀI TẬP: Hãy viết hàm insertion_sort hoàn chỉnh
def insertion_sort(arr):
    # Gợi ý: Chèn phần tử vào đúng vị trí trong mảng con đã sắp xếp
    pass`
    }
  },

  // 4. QUICK SORT
  'quick-sort': {
    sampleCode: {
      cpp: `// Quick Sort Implementation (C++)
void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      java: `// Quick Sort Implementation (Java)
public void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      python: `# Quick Sort Implementation (Python)
def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`
    },
    starterCode: {
      cpp: `// Hãy hoàn thành thuật toán Quick Sort
void quickSort(vector<int>& arr, int low, int high) {
    
}`,
      java: `// Hãy hoàn thành thuật toán Quick Sort
public void quickSort(int[] arr, int low, int high) {
    
}`,
      python: `# Hãy hoàn thành thuật toán Quick Sort
def quick_sort(arr, low, high):
    pass`
    }
  },

  'linear-search': {
    sampleCode: {
      cpp: `int linearSearch(vector<int>& arr, int x) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == x) return i;
    }
    return -1;
}`,
      java: `public static int linearSearch(int[] arr, int x) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == x) return i;
    }
    return -1;
}`,
      python: `def linear_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x:
            return i
    return -1`
    },
    starterCode: {
      cpp: `// Tìm x trong arr. Trả về index hoặc -1
int linearSearch(vector<int>& arr, int x) {
    
}`,
      java: `// Tìm x trong arr. Trả về index hoặc -1
public class Solution {
    public static int linearSearch(int[] arr, int x) {
        
    }
}`,
      python: `# Tìm x trong arr. Trả về index hoặc -1
def linear_search(arr, x):
    pass`
    }
  },

  // 6. MERGE SORT
  'merge-sort': {
    sampleCode: {
      cpp: `#include <vector>
using namespace std;

void merge(vector<int>& arr, int l, int mid, int r) {
    vector<int> left(arr.begin()+l, arr.begin()+mid+1);
    vector<int> right(arr.begin()+mid+1, arr.begin()+r+1);
    int i = 0, j = 0, k = l;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int mid = l + (r - l) / 2;
        mergeSort(arr, l, mid);
        mergeSort(arr, mid + 1, r);
        merge(arr, l, mid, r);
    }
}`,
      java: `public class Main {
    public static void merge(int[] arr, int l, int mid, int r) {
        int n1 = mid - l + 1, n2 = r - mid;
        int[] left = new int[n1], right = new int[n2];
        for (int i = 0; i < n1; i++) left[i] = arr[l + i];
        for (int j = 0; j < n2; j++) right[j] = arr[mid + 1 + j];
        int i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            if (left[i] <= right[j]) arr[k++] = left[i++];
            else arr[k++] = right[j++];
        }
        while (i < n1) arr[k++] = left[i++];
        while (j < n2) arr[k++] = right[j++];
    }
    public static void mergeSort(int[] arr, int l, int r) {
        if (l < r) {
            int mid = l + (r - l) / 2;
            mergeSort(arr, l, mid);
            mergeSort(arr, mid + 1, r);
            merge(arr, l, mid, r);
        }
    }
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Hoàn thành thuật toán Merge Sort
#include <vector>
using namespace std;

void merge(vector<int>& arr, int l, int mid, int r) {
    // Trộn hai mảng con arr[l..mid] và arr[mid+1..r]
    
}

void mergeSort(vector<int>& arr, int l, int r) {
    // Chia đôi mảng và gọi đệ quy
    
}`,
      java: `// BÀI TẬP: Hoàn thành thuật toán Merge Sort
public class Solution {
    public static void merge(int[] arr, int l, int mid, int r) {
        // Trộn hai mảng con arr[l..mid] và arr[mid+1..r]
        
    }
    public static void mergeSort(int[] arr, int l, int r) {
        // Chia đôi mảng và gọi đệ quy
        
    }
}`,
      python: `# BÀI TẬP: Hoàn thành thuật toán Merge Sort
def merge_sort(arr):
    # Gợi ý: Chia mảng thành 2 nửa, đệ quy sắp xếp, rồi trộn lại
    pass`
    }
  },

  // 7. BINARY SEARCH
  'binary-search': {
    sampleCode: {
      cpp: `int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      java: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
    },
    starterCode: {
      cpp: `// Tìm target trong mảng đã sắp xếp. Trả về index hoặc -1
int binarySearch(vector<int>& arr, int target) {
    // Gợi ý: Dùng left, right, mid
    
}`,
      java: `// Tìm target trong mảng đã sắp xếp. Trả về index hoặc -1
public class Solution {
    public static int binarySearch(int[] arr, int target) {
        // Gợi ý: Dùng left, right, mid
        
    }
}`,
      python: `# Tìm target trong mảng đã sắp xếp. Trả về index hoặc -1
def binary_search(arr, target):
    # Gợi ý: Dùng left, right, mid
    pass`
    }
  },

  // 8. BFS
  'bfs': {
    sampleCode: {
      cpp: `#include <vector>
#include <queue>
using namespace std;

void bfs(vector<vector<int>>& graph, int start) {
    vector<bool> visited(graph.size(), false);
    queue<int> q;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int node = q.front(); q.pop();
        cout << node << " ";
        for (int neighbor : graph[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
}`,
      java: `import java.util.*;
public class Main {
    public static void bfs(List<List<Integer>> graph, int start) {
        boolean[] visited = new boolean[graph.size()];
        Queue<Integer> queue = new LinkedList<>();
        visited[start] = true;
        queue.add(start);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            System.out.print(node + " ");
            for (int neighbor : graph.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.add(neighbor);
                }
            }
        }
    }
}`,
      python: `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Hoàn thành thuật toán BFS
#include <vector>
#include <queue>
using namespace std;

void bfs(vector<vector<int>>& graph, int start) {
    // Gợi ý: Dùng queue và mảng visited
    
}`,
      java: `// BÀI TẬP: Hoàn thành thuật toán BFS
import java.util.*;
public class Solution {
    public static void bfs(List<List<Integer>> graph, int start) {
        // Gợi ý: Dùng Queue và mảng visited
        
    }
}`,
      python: `# BÀI TẬP: Hoàn thành thuật toán BFS
from collections import deque
def bfs(graph, start):
    # Gợi ý: Dùng deque làm queue và set làm visited
    pass`
    }
  },

  // 9. DFS
  'dfs': {
    sampleCode: {
      cpp: `#include <vector>
using namespace std;

void dfs(vector<vector<int>>& graph, int node, vector<bool>& visited) {
    visited[node] = true;
    cout << node << " ";
    for (int neighbor : graph[node]) {
        if (!visited[neighbor]) {
            dfs(graph, neighbor, visited);
        }
    }
}`,
      java: `import java.util.*;
public class Main {
    public static void dfs(List<List<Integer>> graph, int node, boolean[] visited) {
        visited[node] = true;
        System.out.print(node + " ");
        for (int neighbor : graph.get(node)) {
            if (!visited[neighbor]) {
                dfs(graph, neighbor, visited);
            }
        }
    }
}`,
      python: `def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    result = [node]
    for neighbor in graph[node]:
        if neighbor not in visited:
            result.extend(dfs(graph, neighbor, visited))
    return result`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Hoàn thành thuật toán DFS
#include <vector>
using namespace std;

void dfs(vector<vector<int>>& graph, int node, vector<bool>& visited) {
    // Gợi ý: Đánh dấu visited, duyệt đệ quy các đỉnh kề
    
}`,
      java: `// BÀI TẬP: Hoàn thành thuật toán DFS
import java.util.*;
public class Solution {
    public static void dfs(List<List<Integer>> graph, int node, boolean[] visited) {
        // Gợi ý: Đánh dấu visited, duyệt đệ quy
        
    }
}`,
      python: `# BÀI TẬP: Hoàn thành thuật toán DFS
def dfs(graph, node, visited=None):
    # Gợi ý: Đánh dấu visited, duyệt đệ quy
    pass`
    }
  },

  // 10. STACK
  'stack': {
    sampleCode: {
      cpp: `#include <stack>
#include <iostream>
using namespace std;

int main() {
    stack<int> s;
    s.push(10);
    s.push(20);
    s.push(30);
    cout << "Top: " << s.top() << endl;  // 30
    s.pop();
    cout << "Top after pop: " << s.top() << endl;  // 20
    cout << "Size: " << s.size() << endl;  // 2
    return 0;
}`,
      java: `import java.util.Stack;
public class Main {
    public static void main(String[] args) {
        Stack<Integer> s = new Stack<>();
        s.push(10);
        s.push(20);
        s.push(30);
        System.out.println("Top: " + s.peek());  // 30
        s.pop();
        System.out.println("Top after pop: " + s.peek());  // 20
        System.out.println("Size: " + s.size());  // 2
    }
}`,
      python: `# Python dùng list làm Stack
stack = []
stack.append(10)  # push
stack.append(20)
stack.append(30)
print("Top:", stack[-1])       # 30
stack.pop()                     # pop
print("Top after pop:", stack[-1])  # 20
print("Size:", len(stack))      # 2`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Cài đặt Stack bằng mảng
class MyStack {
    int arr[1000];
    int topIndex = -1;
public:
    void push(int val) {
        // Thêm phần tử vào đỉnh
    }
    int pop() {
        // Lấy phần tử đỉnh ra
    }
    int top() {
        // Xem phần tử đỉnh
    }
    bool isEmpty() {
        // Kiểm tra rỗng
    }
};`,
      java: `// BÀI TẬP: Cài đặt Stack bằng mảng
public class Solution {
    int[] arr = new int[1000];
    int topIndex = -1;
    
    public void push(int val) { /* Thêm vào đỉnh */ }
    public int pop() { /* Lấy ra từ đỉnh */ return -1; }
    public int top() { /* Xem đỉnh */ return -1; }
    public boolean isEmpty() { /* Kiểm tra rỗng */ return true; }
}`,
      python: `# BÀI TẬP: Cài đặt Stack bằng list
class MyStack:
    def __init__(self):
        self.data = []
    
    def push(self, val):
        # Thêm phần tử vào đỉnh
        pass
    
    def pop(self):
        # Lấy phần tử đỉnh ra
        pass
    
    def top(self):
        # Xem phần tử đỉnh
        pass
    
    def is_empty(self):
        # Kiểm tra rỗng
        pass`
    }
  },

  // 11. QUEUE
  'queue': {
    sampleCode: {
      cpp: `#include <queue>
#include <iostream>
using namespace std;

int main() {
    queue<int> q;
    q.push(10);
    q.push(20);
    q.push(30);
    cout << "Front: " << q.front() << endl;  // 10
    q.pop();
    cout << "Front after pop: " << q.front() << endl;  // 20
    cout << "Size: " << q.size() << endl;  // 2
    return 0;
}`,
      java: `import java.util.LinkedList;
import java.util.Queue;
public class Main {
    public static void main(String[] args) {
        Queue<Integer> q = new LinkedList<>();
        q.add(10);
        q.add(20);
        q.add(30);
        System.out.println("Front: " + q.peek());   // 10
        q.poll();
        System.out.println("Front after poll: " + q.peek());  // 20
        System.out.println("Size: " + q.size());     // 2
    }
}`,
      python: `from collections import deque

q = deque()
q.append(10)   # enqueue
q.append(20)
q.append(30)
print("Front:", q[0])          # 10
q.popleft()                     # dequeue
print("Front after pop:", q[0]) # 20
print("Size:", len(q))          # 2`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Cài đặt Queue bằng mảng
class MyQueue {
    int arr[1000];
    int frontIdx = 0, rearIdx = 0;
public:
    void enqueue(int val) { /* Thêm vào cuối */ }
    int dequeue() { /* Lấy từ đầu */ return -1; }
    int front() { /* Xem phần tử đầu */ return -1; }
    bool isEmpty() { /* Kiểm tra rỗng */ return true; }
};`,
      java: `// BÀI TẬP: Cài đặt Queue bằng mảng
public class Solution {
    int[] arr = new int[1000];
    int frontIdx = 0, rearIdx = 0;
    
    public void enqueue(int val) { /* Thêm vào cuối */ }
    public int dequeue() { /* Lấy từ đầu */ return -1; }
    public int front() { /* Xem đầu */ return -1; }
    public boolean isEmpty() { /* Kiểm tra rỗng */ return true; }
}`,
      python: `# BÀI TẬP: Cài đặt Queue bằng list
class MyQueue:
    def __init__(self):
        self.data = []
    
    def enqueue(self, val):
        # Thêm phần tử vào cuối
        pass
    
    def dequeue(self):
        # Lấy phần tử đầu ra
        pass
    
    def front(self):
        # Xem phần tử đầu
        pass
    
    def is_empty(self):
        # Kiểm tra rỗng
        pass`
    }
  },

  // 12. LINKED LIST
  'linked-list': {
    sampleCode: {
      cpp: `struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
    Node* head = nullptr;
public:
    void insertFront(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }
    void printList() {
        Node* curr = head;
        while (curr) {
            cout << curr->data << " -> ";
            curr = curr->next;
        }
        cout << "NULL" << endl;
    }
};`,
      java: `class Node {
    int data;
    Node next;
    Node(int val) { data = val; next = null; }
}

class LinkedList {
    Node head = null;
    
    void insertFront(int val) {
        Node newNode = new Node(val);
        newNode.next = head;
        head = newNode;
    }
    void printList() {
        Node curr = head;
        while (curr != null) {
            System.out.print(curr.data + " -> ");
            curr = curr.next;
        }
        System.out.println("NULL");
    }
}`,
      python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert_front(self, val):
        new_node = Node(val)
        new_node.next = self.head
        self.head = new_node
    
    def print_list(self):
        curr = self.head
        while curr:
            print(curr.data, end=" -> ")
            curr = curr.next
        print("None")`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Cài đặt Linked List cơ bản
struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
    Node* head = nullptr;
public:
    void insertFront(int val) { /* Thêm node vào đầu */ }
    void deleteFront() { /* Xóa node đầu */ }
    bool search(int val) { /* Tìm giá trị, trả về true/false */ }
};`,
      java: `// BÀI TẬP: Cài đặt Linked List cơ bản
public class Solution {
    class Node {
        int data; Node next;
        Node(int val) { data = val; }
    }
    Node head = null;
    
    void insertFront(int val) { /* Thêm node vào đầu */ }
    void deleteFront() { /* Xóa node đầu */ }
    boolean search(int val) { /* Tìm giá trị */ return false; }
}`,
      python: `# BÀI TẬP: Cài đặt Linked List cơ bản
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert_front(self, val):
        # Thêm node vào đầu
        pass
    
    def delete_front(self):
        # Xóa node đầu
        pass
    
    def search(self, val):
        # Tìm giá trị, trả về True/False
        pass`
    }
  },

  // 13. RECURSION
  'recursion': {
    sampleCode: {
      cpp: `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;        // Base case
    return n * factorial(n - 1); // Recursive case
}

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      java: `public class Main {
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
      python: `def factorial(n):
    if n <= 1:
        return 1               # Base case
    return n * factorial(n - 1) # Recursive case

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`
    },
    starterCode: {
      cpp: `// BÀI TẬP 1: Viết hàm tính giai thừa bằng đệ quy
int factorial(int n) {
    // Base case: n <= 1 trả về 1
    // Recursive case: n * factorial(n-1)
}

// BÀI TẬP 2: Viết hàm tính Fibonacci thứ n
int fibonacci(int n) {
    
}`,
      java: `// BÀI TẬP: Viết hàm tính giai thừa và Fibonacci bằng đệ quy
public class Solution {
    public static int factorial(int n) {
        // Viết code đệ quy tại đây
    }
    public static int fibonacci(int n) {
        // Viết code đệ quy tại đây
    }
}`,
      python: `# BÀI TẬP: Viết hàm tính giai thừa và Fibonacci bằng đệ quy
def factorial(n):
    # Gợi ý: if n <= 1: return 1
    pass

def fibonacci(n):
    # Gợi ý: if n <= 1: return n
    pass`
    }
  },

  // 14. COUNTING SORT
  'counting-sort': {
    sampleCode: {
      cpp: `void countingSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0);
    for (int x : arr) count[x]++;
    int idx = 0;
    for (int i = 0; i <= maxVal; i++) {
        while (count[i]-- > 0) arr[idx++] = i;
    }
}`,
      java: `public static void countingSort(int[] arr) {
    int max = Arrays.stream(arr).max().getAsInt();
    int[] count = new int[max + 1];
    for (int x : arr) count[x]++;
    int idx = 0;
    for (int i = 0; i <= max; i++) {
        while (count[i]-- > 0) arr[idx++] = i;
    }
}`,
      python: `def counting_sort(arr):
    if not arr: return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for x in arr:
        count[x] += 1
    idx = 0
    for i in range(max_val + 1):
        while count[i] > 0:
            arr[idx] = i
            idx += 1
            count[i] -= 1`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Hoàn thành Counting Sort
void countingSort(vector<int>& arr) {
    // Gợi ý: Đếm tần suất mỗi phần tử, sau đó ghi lại vào mảng
    
}`,
      java: `// BÀI TẬP: Hoàn thành Counting Sort
public class Solution {
    public static void countingSort(int[] arr) {
        // Gợi ý: Đếm tần suất, sau đó ghi lại
        
    }
}`,
      python: `# BÀI TẬP: Hoàn thành Counting Sort
def counting_sort(arr):
    # Gợi ý: Tạo mảng đếm, duyệt và ghi lại vào arr
    pass`
    }
  },

  // 15. TWO POINTERS
  'two-pointers': {
    sampleCode: {
      cpp: `// Tìm 2 số có tổng = target (mảng đã sắp xếp)
pair<int,int> twoSum(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return {left, right};
        else if (sum < target) left++;
        else right--;
    }
    return {-1, -1};
}`,
      java: `// Tìm 2 số có tổng = target (mảng đã sắp xếp)
public static int[] twoSum(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return new int[]{left, right};
        else if (sum < target) left++;
        else right--;
    }
    return new int[]{-1, -1};
}`,
      python: `# Tìm 2 số có tổng = target (mảng đã sắp xếp)
def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            return (left, right)
        elif s < target:
            left += 1
        else:
            right -= 1
    return (-1, -1)`
    },
    starterCode: {
      cpp: `// BÀI TẬP: Tìm 2 số có tổng = target bằng Two Pointers
pair<int,int> twoSum(vector<int>& arr, int target) {
    // Gợi ý: Dùng left và right, so sánh tổng với target
    
}`,
      java: `// BÀI TẬP: Tìm 2 số có tổng = target bằng Two Pointers
public class Solution {
    public static int[] twoSum(int[] arr, int target) {
        // Gợi ý: Dùng left và right
        return new int[]{-1, -1};
    }
}`,
      python: `# BÀI TẬP: Tìm 2 số có tổng = target bằng Two Pointers
def two_sum(arr, target):
    # Gợi ý: Dùng left và right, so sánh tổng
    pass`
    }
  },
};


export const getAlgoResource = (algKey) => {
  const resource = ALGORITHM_RESOURCES[algKey];
  
  if (!resource) {
    return {
      sampleCode: { 
        cpp: '// Code mẫu đang được cập nhật...', 
        java: '// Code mẫu đang được cập nhật...', 
        python: '# Code mẫu đang được cập nhật...' 
      },
      starterCode: { 
        cpp: '// Bài tập đang được cập nhật...', 
        java: '// Bài tập đang được cập nhật...', 
        python: '# Bài tập đang được cập nhật...' 
      }
    };
  }
  
  return resource;
};
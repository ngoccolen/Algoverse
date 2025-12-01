// src/data/algorithmData.js

export const ALGORITHM_RESOURCES = {
  // ====================================================
  // 1. BUBBLE SORT (Sắp xếp nổi bọt)
  // ====================================================
  'bubble-sort': {
    // Code mẫu để hiển thị ở tab "Mô phỏng" (Code Viewer)
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
    // Code khởi tạo cho Editor ở tab "Bài tập" (Starter Code)
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

  // ====================================================
  // 2. SELECTION SORT (Sắp xếp chọn)
  // ====================================================
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
    # Gợi ý: Tìm phần tử nhỏ nhất và đưa về đầu mảng
    pass`
    }
  },

  // ====================================================
  // 3. QUICK SORT (Dự phòng cho tương lai)
  // ====================================================
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
  }
};

/**
 * Hàm lấy tài nguyên thuật toán an toàn.
 * Tránh lỗi crash trang web nếu algKey không tồn tại.
 */
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
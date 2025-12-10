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
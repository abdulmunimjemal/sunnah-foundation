type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface FilterConfig {
  [key: string]: string;
}

interface PaginationConfig {
  currentPage: number;
  pageSize: number;
}

/**
 * Filter data based on search text and filter criteria
 */
export function filterData<T>(
  data: T[],
  searchText: string,
  filters: FilterConfig,
  searchableFields: (keyof T)[]
): T[] {
  if (!data) return [];

  let filteredData = [...data];

  // Apply search text filter
  if (searchText) {
    const searchLower = searchText.toLowerCase();
    filteredData = filteredData.filter(item => {
      return searchableFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }

  // Apply specific filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== 'search') {
      filteredData = filteredData.filter(item => {
        const itemValue = (item as any)[key];
        if (itemValue === null || itemValue === undefined) return false;
        
        // Handle array fields (e.g., tags, categories)
        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }
        
        // Handle boolean fields
        if (typeof itemValue === 'boolean') {
          return itemValue === (value === 'true');
        }
        
        // Handle string fields - use both exact and partial matching depending on field type
        return String(itemValue).toLowerCase() === value.toLowerCase() || 
               String(itemValue).toLowerCase().includes(value.toLowerCase());
      });
    }
  });

  return filteredData;
}

/**
 * Sort data by a specific field and direction
 */
export function sortData<T>(data: T[], sortConfig: SortConfig | null): T[] {
  if (!sortConfig || !data) return data;

  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];

    // Handle null or undefined values
    if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortConfig.direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Handle date strings
    if (
      typeof aValue === 'string' &&
      typeof bValue === 'string' &&
      !isNaN(Date.parse(aValue)) &&
      !isNaN(Date.parse(bValue))
    ) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortConfig.direction === 'asc'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Handle numbers (including strings that are numbers)
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // Handle booleans
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      if (sortConfig.direction === 'asc') {
        return aValue === bValue ? 0 : aValue ? 1 : -1;
      } else {
        return aValue === bValue ? 0 : aValue ? -1 : 1;
      }
    }

    // Default comparison
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Paginate data
 */
export function paginateData<T>(data: T[], pagination: PaginationConfig): T[] {
  if (!data) return [];
  
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  return data.slice(startIndex, startIndex + pagination.pageSize);
}

/**
 * Calculate total number of pages
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/**
 * Generate pagination range for UI
 */
export function generatePaginationRange(currentPage: number, totalPages: number): number[] {
  const range = [];
  const maxButtons = 5; // Display at most 5 page buttons

  if (totalPages <= maxButtons) {
    // Display all pages if there are fewer than maxButtons
    for (let i = 1; i <= totalPages; i++) {
      range.push(i);
    }
  } else {
    // Always include first and last page
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        range.push(i);
      }
      range.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      range.push(1);
      for (let i = totalPages - 3; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // In the middle
      range.push(1);
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        range.push(i);
      }
      range.push(totalPages);
    }
  }

  return range;
}
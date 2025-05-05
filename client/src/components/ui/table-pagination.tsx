import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Ensure current page is valid when total items or page size changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(totalPages);
    }
  }, [totalItems, pageSize, currentPage, totalPages, onPageChange]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <strong>
            {totalItems === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
          </strong>{" "}
          to{" "}
          <strong>
            {Math.min(currentPage * pageSize, totalItems)}
          </strong>{" "}
          of <strong>{totalItems}</strong> items
        </p>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <div className="text-sm">
          Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}
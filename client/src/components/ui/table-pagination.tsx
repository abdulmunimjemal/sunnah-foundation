import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePaginationRange } from "@/lib/tableFunctions";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  // Generate array of page numbers to display
  const pageNumbers = generatePaginationRange(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous page button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page number buttons */}
      {pageNumbers.map((page, index) => {
        // Add ellipsis when there's a gap in page numbers
        const showEllipsisBefore =
          index > 0 && page - pageNumbers[index - 1] > 1;

        return (
          <div key={page} className="flex items-center">
            {showEllipsisBefore && (
              <span className="px-2">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[36px]"
            >
              {page}
            </Button>
          </div>
        );
      })}

      {/* Next page button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
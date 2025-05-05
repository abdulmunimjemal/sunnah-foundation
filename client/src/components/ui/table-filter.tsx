import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FilterIcon, XIcon } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface TableFilterProps {
  onFilterChange: (key: string, value: string) => void;
  filterOptions?: {
    [key: string]: FilterOption[];
  };
  placeholderText?: string;
  className?: string;
}

export function TableFilter({
  onFilterChange,
  filterOptions = {},
  placeholderText = "Filter...",
  className = "",
}: TableFilterProps) {
  const [searchText, setSearchText] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onFilterChange("search", value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(key, value);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilterChange(key, "");
  };

  const clearAllFilters = () => {
    setSearchText("");
    setActiveFilters({});
    onFilterChange("search", "");
    Object.keys(filterOptions).forEach(key => {
      onFilterChange(key, "");
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative w-full md:max-w-sm">
          <Input
            placeholder={placeholderText}
            value={searchText}
            onChange={handleSearchChange}
            className="w-full"
          />
          {searchText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={() => {
                setSearchText("");
                onFilterChange("search", "");
              }}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isFilterOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-10"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {Object.keys(activeFilters).length > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground text-primary w-5 h-5 text-xs flex items-center justify-center">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </Button>
          
          {Object.keys(activeFilters).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-10"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>
      
      {isFilterOpen && Object.keys(filterOptions).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                {activeFilters[key] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter(key)}
                    className="h-6 w-6 p-0"
                  >
                    <XIcon className="h-3 w-3" />
                    <span className="sr-only">Clear {key} filter</span>
                  </Button>
                )}
              </div>
              <Select
                value={activeFilters[key] || ""}
                onValueChange={(value) => handleFilterChange(key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${key}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
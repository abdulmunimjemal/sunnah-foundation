import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FilterOption {
  key: string;
  label: string;
  type: "select";
  options: { value: string; label: string }[];
}

interface TableFilterProps {
  filterOptions: FilterOption[];
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export function TableFilter({
  filterOptions = [],
  filters,
  onFilterChange,
}: TableFilterProps) {
  const handleSelectChange = (key: string, value: string) => {
    onFilterChange(key, value === "all" ? "" : value);
  };

  if (!Array.isArray(filterOptions) || filterOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {filterOptions.map((option) => (
        <div key={option.key} className="flex flex-col gap-1.5 min-w-[150px]">
          <Label htmlFor={`filter-${option.key}`} className="text-sm font-medium">
            {option.label}
          </Label>
          <Select
            value={filters[option.key] || "all"}
            onValueChange={(value) => handleSelectChange(option.key, value)}
          >
            <SelectTrigger id={`filter-${option.key}`} className="w-full">
              <SelectValue placeholder={`All ${option.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {option.label}</SelectItem>
              {option.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
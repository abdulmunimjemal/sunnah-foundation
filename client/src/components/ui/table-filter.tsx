import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableFilterProps {
  onFilterChange: (filterKey: string, value: string) => void;
  filterOptions: {
    key: string;
    label: string;
    type: "select" | "text";
    options?: { value: string; label: string }[];
  }[];
  filters: Record<string, string>;
}

export function TableFilter({
  onFilterChange,
  filterOptions,
  filters,
}: TableFilterProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row">
      {filterOptions.map((option) => (
        <div key={option.key} className="w-full md:w-auto md:min-w-[200px]">
          <Label htmlFor={option.key} className="mb-2 block">
            {option.label}
          </Label>
          {option.type === "select" ? (
            <Select
              value={filters[option.key] || ""}
              onValueChange={(value) => onFilterChange(option.key, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${option.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {option.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={option.key}
              placeholder={`Search by ${option.label.toLowerCase()}`}
              value={filters[option.key] || ""}
              onChange={(e) => onFilterChange(option.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
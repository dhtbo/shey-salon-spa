"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export type SortFilterOption = 
  | "all" 
  | "nearby" 
  | "price_low_to_high" 
  | "price_high_to_low" 
  | "with_offers";

type SortFilterProps = {
  value?: SortFilterOption;
  onValueChange?: (value: SortFilterOption) => void;
  className?: string;
};

const sortFilterOptions = [
  { value: "all" as const, label: "All (全部)" },
  { value: "nearby" as const, label: "Nearby (附近)" },
  { value: "price_low_to_high" as const, label: "Price: Low to high (价格从低到高)" },
  { value: "price_high_to_low" as const, label: "Price: High to low (价格从高到低)" },
  { value: "with_offers" as const, label: "With offers (有优惠活动)" },
];

const SortFilter: React.FC<SortFilterProps> = ({
  value = "all",
  onValueChange,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Filter className="h-4 w-4 text-gray-500" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Sort/Filter" />
        </SelectTrigger>
        <SelectContent>
          {sortFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortFilter;
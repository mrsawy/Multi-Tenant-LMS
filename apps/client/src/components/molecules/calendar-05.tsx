"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/atoms/calendar"

interface Calendar05Props {
  dateRange?: DateRange | undefined;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
}

export default function Calendar05({ 
  dateRange, 
  onDateRangeChange 
}: Calendar05Props) {
  const [internalDateRange, setInternalDateRange] = React.useState<DateRange | undefined>(
    dateRange || {
      from: new Date(),
      to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }
  )

  const currentDateRange = dateRange !== undefined ? dateRange : internalDateRange;

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange);
    } else {
      setInternalDateRange(newDateRange);
    }
  }

  return (
    <Calendar
      mode="range"
      defaultMonth={currentDateRange?.from}
      selected={currentDateRange}
      onSelect={handleDateRangeChange}
      numberOfMonths={2}
      className="rounded-lg border shadow-sm"
      disabled={(date) => date < new Date()}
    />
  )
}

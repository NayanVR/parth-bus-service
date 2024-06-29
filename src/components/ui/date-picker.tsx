"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Matcher, SelectSingleEventHandler } from "react-day-picker";

type Props = {
  className?: string;
  date: Date;
  setDate: SelectSingleEventHandler;
  disabled?: Matcher | Matcher[] | undefined;
};

export function DatePicker({ className, date, setDate, disabled }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day, selectedDay, modifiers, e) => {
            setDate(day, selectedDay, modifiers, e);
            setIsOpen(false);
          }}
          initialFocus
          className={cn(className, "w-auto")}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

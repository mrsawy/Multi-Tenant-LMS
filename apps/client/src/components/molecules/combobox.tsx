"use client"
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/atoms/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/atoms/popover"

interface Props {
    title?: string
    data: { value: string, label: string }[]
    defaultValue: { value: string, label: string }
    buttonClassName?: string
    contentClassName?: string
    placeholder: string
    buttonStyles?: React.CSSProperties
    onValueChange?: (value: string) => void
}

export function Combobox({ title, data, defaultValue, buttonClassName, contentClassName, placeholder, buttonStyles, onValueChange }: Props) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultValue.value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between lg:placeholder:text-xs", buttonClassName)}
                    style={buttonStyles}
                >
                    {value
                        ? data.find((d) => d.value === value)?.label
                        : title}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn(" p-0", contentClassName)}>
                <Command>
                    <CommandInput placeholder={placeholder} className="h-9" />
                    <CommandList>
                        <CommandEmpty>No Data found.</CommandEmpty>
                        <CommandGroup>
                            {data.map((d) => (
                                <CommandItem
                                    key={d.value}
                                    value={d.value}
                                    onSelect={(currentValue) => {
                                        const newValue = currentValue === value ? "" : currentValue
                                        setValue(newValue)
                                        setOpen(false)
                                        onValueChange?.(newValue)
                                    }}
                                >
                                    {d.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === d.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
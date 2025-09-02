"use client"
import * as React from "react"
import { Input } from "@/components/atoms/input"
import { Combobox } from "@/components/molecules/combobox"
import { countryCodes } from "@/lib/data/countryCodes"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string
    defaultCode?: { value: string, label: string }
    onValueChange?: (value: string) => void
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    name?: string
}

export function PhoneInput({
    label = "Phone Number",
    defaultCode = { value: "+1", label: "🇺🇸 +1" },
    onValueChange,
    value,
    onChange,
    name,
    className,
    ...props
}: PhoneInputProps) {
    const [countryCode, setCountryCode] = React.useState(defaultCode.value)
    const [phone, setPhone] = React.useState("")

    // Handle controlled vs uncontrolled mode
    const phoneValue = value !== undefined ? value : phone
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value
        if (value === undefined) {
            setPhone(newPhone)
        }
        onChange?.(e)
    }

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(`${countryCode} ${phoneValue}`)
        }
    }, [countryCode, phoneValue, onValueChange])

    return (
        <div className={cn("flex flex-col gap-2 justify-between", className)} {...props}>
            {label && <label className="text-sm font-medium">{label}</label>}
            <div className="flex">
                <Combobox
                    title="Select Code"
                    data={countryCodes}
                    defaultValue={defaultCode}
                    buttonClassName="w-[90px] placeholder:text-sm lg:placeholder:text-md text-sm lg:text-md"
                    contentClassName="w-[180px] "
                    placeholder="Search your phone"
                    buttonStyles={{ borderEndEndRadius: 0, borderStartEndRadius: 0 }}
                />
                <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneValue}
                    onChange={handlePhoneChange}
                    name={name}
                    className="flex-1 placeholder:text-sm lg:placeholder:text-md text-sm lg:text-base "
                    style={{ borderStartStartRadius: 0, borderEndStartRadius: 0 }}
                />
            </div>
        </div>
    )
}

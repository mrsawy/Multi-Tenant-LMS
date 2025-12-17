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
    name?: string
}

export function PhoneInput({
    label = "Phone Number",
    defaultCode = { value: "+20", label: "🇪🇬 +20" },
    onValueChange,
    value = "",
    name,
    className,
    ...props
}: PhoneInputProps) {
    // Parse the incoming value to extract country code and phone number
    const parsePhoneValue = (fullPhone: string) => {
        if (!fullPhone) return { code: defaultCode.value, number: "" }

        // Find matching country code from the start of the phone number
        const matchingCode = countryCodes.find(cc =>
            fullPhone.startsWith(cc.value.replace('+', ''))
        )

        if (matchingCode) {
            const codeLength = matchingCode.value.replace('+', '').length
            return {
                code: matchingCode.value,
                number: fullPhone.substring(codeLength)
            }
        }

        return { code: defaultCode.value, number: fullPhone }
    }

    const { code: initialCode, number: initialNumber } = parsePhoneValue(value)

    const [countryCode, setCountryCode] = React.useState(initialCode)
    const [phone, setPhone] = React.useState(initialNumber)

    // Update internal state when value prop changes (for form rehydration)
    React.useEffect(() => {
        const { code, number } = parsePhoneValue(value)
        setCountryCode(code)
        setPhone(number)
    }, [value])

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value
        setPhone(newPhone)

        // Immediately notify parent
        if (onValueChange) {
            const fullPhone = newPhone ? `${countryCode}${newPhone}` : ""
            const normalized = fullPhone.replace(/^\+/, "").trim()
            onValueChange(normalized)
        }
    }

    const handleCountryCodeChange = (code: string) => {
        setCountryCode(code)

        // Immediately notify parent
        if (onValueChange) {
            const fullPhone = phone ? `${code}${phone}` : ""
            const normalized = fullPhone.replace(/^\+/, "").trim()
            onValueChange(normalized)
        }
    }

    return (
        <div className={cn("flex flex-col gap-1 justify-between", className)} {...props}>
            {label && <label className="text-sm font-medium">{label}</label>}
            <div className="flex">
                <Combobox
                    title="Select Code"
                    data={countryCodes}
                    onValueChange={handleCountryCodeChange}
                    value={countryCode}
                    defaultValue={defaultCode}
                    buttonClassName="w-[90px] placeholder:text-sm lg:placeholder:text-md text-sm lg:text-md h-9"
                    contentClassName="w-[180px]"
                    placeholder="Search your phone"
                    buttonStyles={{ borderEndEndRadius: 0, borderStartEndRadius: 0 }}
                />
                <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={handlePhoneChange}
                    name={name}
                    className="flex-1 placeholder:text-sm lg:placeholder:text-md text-sm lg:text-base h-9"
                    style={{ borderStartStartRadius: 0, borderEndStartRadius: 0 }}
                />
            </div>
        </div>
    )
}
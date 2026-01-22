"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/atoms/button"
import { Calendar } from "@/components/atoms/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card"

export default function CalendarWithTodayButton() {
  const t = useTranslations("Calendar")
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  )
  const [month, setMonth] = React.useState<Date | undefined>(new Date())

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("appointment")}</CardTitle>
        <CardDescription>{t("findDate")}</CardDescription>
        <CardAction>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMonth(new Date())
              setDate(new Date())
            }}
          >
            {t("today")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={date}
          onSelect={setDate}
          className="bg-transparent p-0"
        />
      </CardContent>
    </Card>
  )
}

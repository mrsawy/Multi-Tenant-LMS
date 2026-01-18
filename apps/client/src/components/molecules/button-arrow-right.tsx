
import { Button } from "../atoms/button"

import { ArrowRightIcon } from "lucide-react"

export function ButtonArrowRight(props: React.ComponentProps<typeof Button>) {
    return (
        <Button
            variant="outline"          // your base style
            effect="expandIcon"        // automatically set
            icon={ArrowRightIcon}      // automatically set
            iconPlacement="right"      // automatically set
            {...props}                 // let caller override onClick, children, etc.
        />
    )
}

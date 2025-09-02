import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/organs/login-form"
import { SignupForm } from "@/components/organs/signup-form"
import Image from "next/image"

export default function SignupPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-7xl">
                <SignupForm />
            </div>
        </div>

    )
}

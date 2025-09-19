"use client"

import { AppSidebar } from "@/components/molecules/app-sidebar";
import { data } from "../data";
import { IUser } from "@/lib/types/user/user.interface";

export function OrgSidebar({ user }: { user?: IUser }) {
    return <AppSidebar data={{
        ...data, user: {
            name: user?.firstName , 
            email:user?.email
        }
    }} variant="inset" />

}
// TODO: This

import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks";

import * as Popover from "@radix-ui/react-popover";

import { ShoppingBasket } from "lucide-react";

export default function NavbarUserControls() {
    const { authData } = useAuth();

    return (
        <div className="flex gap-4 items-center">
            <p className="text-primary-300 font-bold">
                { authData?.userName }
            </p>

            <Link to="/app/user">
                <img src="/images/defaultProfileIcon.webp" className="size-8 outline-2 outline-primary-300 outline-offset-2 rounded-full" />
            </Link>
            
            <div className="relative flex size-8 items-center justify-center rounded-full outline-2 outline-base-500 bg-base-300 outline-offset-2">
                <ShoppingBasket className="grow-0 shrink-0 text-base-500" />
            </div>
        </div>
    )
}
"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsButton() {
    const router = useRouter();

    //make button trigger dropdown menu
    const [isOpen, setIsOpen] = useState(false);
    if (!isOpen) {
        return (
            <Button type="button" className="px-2 py-1" onClick={() => setIsOpen(true)}>
                <Icon icon="mdi:cog" width={20} height={20} />
            </Button>
        );
    }
    else {
        return (
            <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
                <DropdownMenuTrigger asChild>
                    <Button type="button" className="px-2 py-1">
                        <Icon icon="mdi:cog" width={20} height={20} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white rounded-md shadow-lg p-2">
                    <DropdownMenuItem onSelect={() => router.push("/settings")}>
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => alert("About clicked")}>
                        About
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
}

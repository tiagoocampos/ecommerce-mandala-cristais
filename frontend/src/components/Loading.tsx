import { Loader2 } from "lucide-react";

export function Loading() {
    return (
        <div className="flex justify-center items-center">
            <Loader2 className="animate-spin text-mc-violet-700" size={24} />
        </div>
    )
}
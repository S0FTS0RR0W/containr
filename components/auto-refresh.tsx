import { useEffect } from "react";
import { useState } from "react";

export default function AutoRefresh() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsRefreshing(true);
            setTimeout(() => setIsRefreshing(false), 500);
        }, 10000); // Refresh every 10 seconds
    }, []);

    return (
        <div className={`p-2 text-sm ${isRefreshing ? "text-green-500" : "text-gray-500"}`}>
            {isRefreshing ? "Refreshing..." : "Last updated: Just now"}
        </div>
    );
}
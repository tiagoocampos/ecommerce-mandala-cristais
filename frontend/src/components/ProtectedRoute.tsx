import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../lib/auth";
import { Loading } from "./Loading";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }
        setIsAuthenticated(true);
    }, [navigate]);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-mc-sand-50 flex justify-center items-center">
                <Loading />
            </div>
        );
    }

    return <>{children}</>;
}

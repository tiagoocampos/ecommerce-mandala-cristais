import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getToken, saveRedirectPath } from "../lib/auth";
import { Loading } from "./Loading";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // getToken() já trata token vencido como deslogado (mesma fonte do menu do cabeçalho)
        const token = getToken();
        if (!token) {
            saveRedirectPath(location.pathname + location.search);
            navigate("/login");
            return;
        }
        setIsAuthenticated(true);
    }, [navigate, location.pathname, location.search]);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-mc-sand-50 flex justify-center items-center">
                <Loading />
            </div>
        );
    }

    return <>{children}</>;
}

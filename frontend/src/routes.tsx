import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MandalaHome } from "./pages/store/Home";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Profile } from "./pages/profile";


// Conforme os módulos forem sendo construídos no backend, adicione aqui:
// /produtos, /produto/:slug, /categoria/:slug, /carrinho, /checkout,
// /login, /register, /pedidos, /admin ...
export function RoutesApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MandalaHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
}

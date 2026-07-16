import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MandalaHome } from "./pages/store/Home";

// Conforme os módulos forem sendo construídos no backend, adicione aqui:
// /produtos, /produto/:slug, /categoria/:slug, /carrinho, /checkout,
// /login, /register, /pedidos, /admin ...
export function RoutesApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MandalaHome />} />
            </Routes>
        </BrowserRouter>
    );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MandalaHome } from "./pages/store/Home";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Profile } from "./pages/profile";
import { Categories } from "./pages/categories";
import { CategoryDetail } from "./pages/category-detail";
import { Products } from "./pages/products";
import { ProductDetail } from "./pages/product-detail";
import { CartPage } from "./pages/cart";
import { Orders } from "./pages/orders";
import { PainelAdmin } from "./pages/admin/PainelAdmin";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function RoutesApp() {
    return (
        <BrowserRouter>
            <Routes>
                {/* públicas */}
                <Route path="/" element={<MandalaHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/categorias" element={<Categories />} />
                <Route path="/categoria/:slug" element={<CategoryDetail />} />
                <Route path="/produtos" element={<Products />} />
                <Route path="/produto/:slug" element={<ProductDetail />} />

                {/* protegidas (o próprio componente exige login) */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/carrinho" element={<CartPage />} />
                <Route path="/pedidos" element={<Orders />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <PainelAdmin />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

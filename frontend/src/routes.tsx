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
import { OrderDetail } from "./pages/order-detail";

// admin
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminOrderDetail } from "./pages/admin/AdminOrderDetail";
import { AdminUsers } from "./pages/admin/AdminUsers";

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
                <Route path="/pedido/:order_id" element={<OrderDetail />} />

                {/* admin */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="produtos" element={<AdminProducts />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="pedidos" element={<AdminOrders />} />
                    <Route path="pedidos/:order_id" element={<AdminOrderDetail />} />
                    <Route path="usuarios" element={<AdminUsers />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

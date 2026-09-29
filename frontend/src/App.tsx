
import { Toaster } from "./components/ui/sonner"
import { RoutesApp } from "./routes"
import { CartProvider } from "./contexts/CartContext"
import { CartDrawerProvider } from "./contexts/CartDrawerContext"


function App() {

  return (
    <>
      <Toaster richColors theme="light" position="top-center" />
      <CartProvider>
        <CartDrawerProvider>
          <RoutesApp />
        </CartDrawerProvider>
      </CartProvider>
    </>
  )
}

export default App

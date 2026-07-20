
import { Toaster } from "./components/ui/sonner"
import { RoutesApp } from "./routes"
import { CartProvider } from "./contexts/CartContext"


function App() {

  return (
    <>
      <Toaster richColors theme="light" position="top-center" />
      <CartProvider>
        <RoutesApp />
      </CartProvider>
    </>
  )
}

export default App

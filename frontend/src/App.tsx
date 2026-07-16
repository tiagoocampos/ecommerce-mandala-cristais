
import { Toaster } from "./components/ui/sonner"
import { RoutesApp } from "./routes"


function App() {

  return (
    <>
      <Toaster richColors theme="light" position="top-center" />
      <RoutesApp />
    </>
  )
}

export default App

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";

import { Button } from "../../components/ui/button";
import { Loading } from "../../components/Loading";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import { api } from "../../services/api";
import { applyFieldErrors, inputClassName } from "../../lib/utils-api";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  async function handleLogin() {
    try {
      if (!email || !password) {
        toast.error("Preencha todos os campos", { position: "top-center" });
        return;
      }

      setErrors({ email: "", password: "" });
      setLoading(true);

      const response = await api.post("/session", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        })
      );

      toast.success("Login realizado com sucesso!", { position: "top-center" });
      // Fluxo mais natural: após login, ir para a área do cliente.
      navigate("/profile");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data?.details) {
          applyFieldErrors(error, { email: "", password: "" }, setErrors);
        } else {
          const field = data?.field as string | undefined;
          const message = data?.error || "Erro ao fazer login";

          if (field === "email") {
            setErrors((prev) => ({ ...prev, email: message }));
          } else if (field === "password") {
            setErrors((prev) => ({ ...prev, password: message }));
          } else {
            toast.error(message, { position: "top-center" });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mc-sand-50 flex flex-col">
      <AnnouncementBar />
      <StoreHeader />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl text-mc-violet-950">
              Entrar
            </h1>
            <p className="text-sm text-mc-ink/70 mt-2">
              Acesse sua conta para continuar
            </p>
          </div>

          <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-md p-6 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label className="text-sm text-mc-ink/70">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="seu@email.com"
                  className={`${inputClassName} cursor-pointer`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
                {errors.email && (
                  <p className="text-xs text-red-800 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label className="text-sm text-mc-ink/70">Senha</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="sua senha"
                  className={`${inputClassName} cursor-pointer`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
                {errors.password && (
                  <p className="text-xs text-red-800 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none w-full cursor-pointer text-sm font-medium"
                >
                  {loading ? <Loading /> : "Entrar"}
                </Button>
              </div>

              <div className="sm:col-span-2 text-center">
                <p className="text-sm text-mc-ink/70">
                  Não tem conta?
                  {" "}
                  <Link
                    to="/register"
                    className="text-mc-violet-950 underline underline-offset-4 decoration-mc-gold-500 hover:decoration-2"
                  >
                    Cadastrar
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}



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

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
  }>({ name: "", email: "", password: "", phone: "" });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister() {
    try {
      if (!name || !email || !password) {
        toast.error("Preencha corretamente os campos", { position: "top-center" });
        return;
      }

      if (password !== confirmPassword) {
        toast.error("As senhas devem ser iguais", { position: "top-center" });
        return;
      }

      setErrors({ name: "", email: "", password: "", phone: "" });
      setLoading(true);

      // Decide o fluxo mais natural: cadastrar e já fazer login automático.
      await api.post("/users", {
        name,
        email,
        password,
        phone: phone ? phone : undefined,
      });

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

      toast.success("Cadastro realizado com sucesso!", { position: "top-center" });
      navigate("/profile");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const applied = applyFieldErrors(
          error,
          { name: "", email: "", password: "", phone: "" },
          setErrors
        );
        if (!applied) {
          toast.error(error.response?.data?.error || "Erro ao cadastrar", {
            position: "top-center",
          });
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
              Cadastrar
            </h1>
            <p className="text-sm text-mc-ink/70 mt-2">
              Crie sua conta para começar
            </p>
          </div>

          <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-md p-6 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1">
                <Label className="text-sm text-mc-ink/70">Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Seu nome"
                  className={`${inputClassName} cursor-pointer`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister();
                  }}
                />
                {errors.name && <p className="text-xs text-red-800 mt-1">{errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-mc-ink/70">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="seu@email.com"
                  className={`${inputClassName} cursor-pointer`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister();
                  }}
                />
                {errors.email && (
                  <p className="text-xs text-red-800 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-mc-ink/70">Telefone (opcional)</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="text"
                  placeholder="(opcional)"
                  className={`${inputClassName} cursor-pointer`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-800 mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-mc-ink/70">Senha</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="mínimo 6 caracteres"
                  className={`${inputClassName} cursor-pointer`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister();
                  }}
                />
                {errors.password && (
                  <p className="text-xs text-red-800 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-mc-ink/70">Confirmar Senha</Label>
                <Input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Repita a senha"
                  className={`${inputClassName} cursor-pointer`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister();
                  }}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-800 mt-1">As senhas devem ser iguais</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none w-full cursor-pointer text-sm font-medium"
                >
                  {loading ? <Loading /> : "Cadastrar"}
                </Button>
              </div>

              <div className="sm:col-span-2 text-center">
                <p className="text-sm text-mc-ink/70">
                  Já tem conta?
                  {" "}
                  <Link
                    to="/login"
                    className="text-mc-violet-950 underline underline-offset-4 decoration-mc-gold-500 hover:decoration-2"
                  >
                    Entrar
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



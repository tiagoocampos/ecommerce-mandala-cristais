import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ProductImage } from "@/components/store/ProductImage";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { formatPrice, showApiError } from "@/lib/utils-api";
import { getToken } from "@/lib/auth";
import type { CartItem } from "@/types";

function unitPrice(item: CartItem) {
  const { price, promo_price } = item.product;
  return promo_price && promo_price < price ? promo_price : price;
}

export function CartSheet() {
  const navigate = useNavigate();
  const { open, setOpen } = useCartDrawer();
  const { cart, itemCount, loading, updateItem, removeItem } = useCart();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  async function run(item_id: string, action: () => Promise<void>, errorMessage: string) {
    setUpdatingId(item_id);
    try {
      await action();
    } catch (error) {
      showApiError(error, errorMessage);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full gap-0 bg-mc-sand-50 p-0 sm:max-w-md">
        <div className="border-b border-mc-violet-950/10 px-5 py-4 pr-12">
          <SheetTitle className="font-display text-xl text-mc-violet-950">
            Sua <span className="italic text-mc-gold-700">sacola</span>
          </SheetTitle>
          <SheetDescription className="text-xs text-mc-ink/60">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </SheetDescription>
        </div>

        {loading && items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-6 text-mc-violet-700" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag size={52} strokeWidth={1.25} className="text-mc-violet-300" aria-hidden="true" />
            <div>
              <p className="font-display text-lg text-mc-violet-950">Sua sacola está vazia</p>
              <p className="mt-1 text-sm text-mc-ink/60">
                {getToken()
                  ? "Que tal escolher o cristal certo para a sua intenção?"
                  : "Entre na sua conta para ver os itens da sua sacola."}
              </p>
            </div>
            <Button
              onClick={() => go(getToken() ? "/produtos" : "/login")}
              className="rounded-full bg-mc-violet-950 px-6 text-mc-sand-50 hover:bg-mc-violet-800"
            >
              {getToken() ? "Ver produtos" : "Entrar"}
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-mc-violet-950/10 overflow-y-auto px-5">
              {items.map((item) => {
                const isUpdating = updatingId === item.id;
                return (
                  <li key={item.id} className="flex gap-3 py-4">
                    <button
                      type="button"
                      onClick={() => go(`/produto/${item.product.slug}`)}
                      className="facet-cut-sm h-20 w-20 shrink-0 overflow-hidden bg-mc-blush-100"
                    >
                      <ProductImage src={item.product.banner} alt={item.product.name} iconSize={22} />
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <button
                        type="button"
                        onClick={() => go(`/produto/${item.product.slug}`)}
                        className="line-clamp-2 text-left text-sm font-medium text-mc-violet-950 hover:underline"
                      >
                        {item.product.name}
                      </button>
                      <span className="mt-0.5 text-sm text-mc-ink/70">{formatPrice(unitPrice(item))}</span>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-mc-violet-950/15">
                          <button
                            type="button"
                            aria-label="Diminuir quantidade"
                            disabled={isUpdating || item.quantity <= 1}
                            onClick={() => run(item.id, () => updateItem(item.id, item.quantity - 1), "Erro ao atualizar quantidade")}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-mc-violet-950 hover:bg-mc-blush-100 disabled:opacity-40"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-medium" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Aumentar quantidade"
                            disabled={isUpdating || item.quantity >= item.product.stock}
                            onClick={() => run(item.id, () => updateItem(item.id, item.quantity + 1), "Erro ao atualizar quantidade")}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-mc-violet-950 hover:bg-mc-blush-100 disabled:opacity-40"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          aria-label={`Remover ${item.product.name}`}
                          disabled={isUpdating}
                          onClick={() => run(item.id, () => removeItem(item.id), "Erro ao remover item")}
                          className="rounded-full p-1.5 text-mc-ink/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-mc-violet-950/10 bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-mc-ink/70">Subtotal</span>
                <span className="text-lg font-semibold text-mc-violet-950">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-mc-ink/50">Frete e descontos calculados no checkout.</p>
              <Button
                onClick={() => go("/checkout")}
                className="facet-cut-sm h-11 w-full rounded-none bg-mc-violet-950 text-mc-sand-50 hover:bg-mc-violet-800"
              >
                Finalizar compra
              </Button>
              <Button
                variant="outline"
                onClick={() => go("/carrinho")}
                className="h-10 w-full rounded-full border-mc-violet-950/20 text-mc-violet-950 hover:bg-mc-blush-100"
              >
                Ver carrinho completo
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

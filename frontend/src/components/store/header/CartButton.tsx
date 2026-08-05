import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CartButtonProps = {
  itemCount: number;
  className?: string;
  onNavigate?: () => void;
};

export function CartButton({ itemCount, className, onNavigate }: CartButtonProps) {
  const navigate = useNavigate();

  function handleClick() {
    onNavigate?.();
    navigate("/carrinho");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={`Carrinho com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
      className={cn(
        "group relative text-mc-primary transition-all duration-200 hover:bg-mc-primary-soft hover:text-mc-primary-dark cursor-pointer",
        className
      )}
    >
      <ShoppingBag
        size={20}
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3"
      />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-mc-primary px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-mc-sand-50 animate-in zoom-in-95 duration-200">
          {itemCount}
        </span>
      )}
    </Button>
  );
}


import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  onClick?: () => void;
  /** "roxa" para fundos claros, "branca" para fundos escuros */
  variant?: "roxa" | "branca";
  /** menor, usado quando o cabeçalho encolhe ao rolar */
  compact?: boolean;
};

export function Logo({ className, onClick, variant = "roxa", compact = false }: LogoProps) {
  const navigate = useNavigate();

  function handleClick() {
    onClick?.();
    navigate("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Mandala Crystais — ir para a página inicial"
      className={cn(
        "shrink-0 rounded-md transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary/40 cursor-pointer",
        className
      )}
    >
      <img
        src={`/brand/logo-${variant}.png`}
        alt="Mandala Crystais"
        width={400}
        height={279}
        className={cn("w-auto transition-[height] duration-200 motion-reduce:transition-none", compact ? "h-9 sm:h-11" : "h-11 sm:h-14")}
      />
    </button>
  );
}

import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  onClick?: () => void;
  /** "roxa" para fundos claros, "branca" para fundos escuros */
  variant?: "roxa" | "branca";
};

export function Logo({ className, onClick, variant = "roxa" }: LogoProps) {
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
        className="h-11 w-auto sm:h-14"
      />
    </button>
  );
}

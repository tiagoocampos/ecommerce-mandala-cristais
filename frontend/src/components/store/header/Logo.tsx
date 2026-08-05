import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import mandalaLogo from "@/assets/mandala-logo.png";

type LogoProps = {
  className?: string;
  onClick?: () => void;
};

export function Logo({ className, onClick }: LogoProps) {
  const navigate = useNavigate();

  function handleClick() {
    onClick?.();
    navigate("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Mandala Cristais — ir para a página inicial"
      className={cn(
        "group flex items-center gap-2 shrink-0 rounded-full transition-transform duration-200 hover:scale-[1.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary/40",
        className
      )}
    >
      <span className="relative rounded-full bg-mc-gold-300/40 p-0.5 transition-colors duration-300 group-hover:bg-mc-gold-300/60">
        <img
          src={mandalaLogo}
          alt="Mandala Cristais"
          className="h-20 w-20 rounded-full object-cover sm:h-25 sm:w-25"
        />
      </span>
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="font-display text-lg font-semibold tracking-tight text-mc-primary">
          Mandala
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-mc-primary/60">
          Crystais
        </span>
      </span>
    </button>
  );
}


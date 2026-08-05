import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
  onSearch?: () => void;
};

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch?.();
    navigate(`/produtos?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
    >
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mc-primary/40 transition-colors"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar cristais, incensos..."
        aria-label="Buscar produtos"
        autoComplete="off"
        className={cn(
          "input-mc"
        )}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 text-mc-primary/40 hover:text-mc-primary hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary/40 rounded-full"
      >
        <Search size={16} />
      </button>
    </form>
  );
}


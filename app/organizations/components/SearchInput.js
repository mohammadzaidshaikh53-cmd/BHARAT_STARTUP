"use client";

import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "./hooks/useDebounce";
import { useState, useEffect } from "react";

export function SearchInput({ value, onChange, placeholder, isLoading = false }) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white/90 dark:bg-[#0f0f10]/90 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      />
      {isLoading && (
        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
      )}
      {!isLoading && localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
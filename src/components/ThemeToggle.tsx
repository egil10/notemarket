"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, SunDim } from "lucide-react";
import styles from "./ThemeToggle.module.css";

const OPTIONS = [
  { label: "Lyst", value: "light", icon: SunDim },
  { label: "Mørkt", value: "dark", icon: Moon },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <fieldset className={styles.root}>
      <legend className="sr-only"> </legend>
      {OPTIONS.map(({ label, value, icon: Icon }) => (
        <span key={value}>
          <input
            type="radio"
            id={`theme-${value}`}
            name="theme"
            value={value}
            checked={theme === value}
            onChange={() => setTheme(value)}
            aria-label={label}
          />
          <label htmlFor={`theme-${value}`} className={styles.option}>
            <Icon aria-hidden size={18} />
          </label>
        </span>
      ))}
    </fieldset>
  );
};


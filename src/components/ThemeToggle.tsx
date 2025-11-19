"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

const OPTIONS = [
  { label: "System", value: "system", icon: "system" },
  { label: "Lyst", value: "light", icon: "light" },
  { label: "Mørkt", value: "dark", icon: "dark" },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <fieldset className={styles.root}>
      <legend className="sr-only">Velg tema</legend>
      {OPTIONS.map(({ label, value, icon }) => (
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
            <span className="sr-only">{label}</span>
            {icon === "system" && <SystemIcon />}
            {icon === "light" && <LightIcon />}
            {icon === "dark" && <DarkIcon />}
          </label>
        </span>
      ))}
    </fieldset>
  );
};

const SystemIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.5 3.25A2.75 2.75 0 0 1 3.25.5h5A2.75 2.75 0 0 1 11 3.25v8.5h-10v-8.5Zm2.75-1.75a1.75 1.75 0 0 0-1.75 1.75V10.5h9V3.25A1.75 1.75 0 0 0 8.25 1.5h-5Zm0 .5A.75.75 0 0 0 2.5 2.75V6h6.5V2.75A.75.75 0 0 0 8.25 2h-5Z"
    />
  </svg>
);

const LightIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.75 1V0.25h-1.5V1h-1V2.5h1.5V2H7.75V1Zm-4.5 7a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM9 7a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm-1.25 5v1.75h-1.5V12h1.5ZM12 6.25h1.75v1.5H12v-1.5ZM2 6.25H.25v1.5H2v-1.5Zm7.505-3.315.53-.53.707-.707 1.06 1.06-.707.708L9.505 2.935Zm-5.778 8.486-.53.53-1.06 1.06 1.06 1.06.707-.707.53-.53 1.06-1.06-1.06-1.06Z"
    />
  </svg>
);

const DarkIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5.25V1h1v1.5h-1V4.25H9V2.5h-1V1h1V.25h1.5ZM3.255 2.755A3.75 3.75 0 0 0 1.75 6 4.25 4.25 0 1 0 10.448 7l.96.96A5.75 5.75 0 1 1 2.043.592l.96.96-.253 1.203Z"
    />
  </svg>
);


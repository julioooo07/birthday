import { createContext } from "react";

export const SkyModeContext = createContext("day");
export const SkyLevelContext = createContext({ sunset: 0, night: 0 });

export function skyAt(mins) {
  const h = mins / 60;
  let sunset = 0;
  let night = 0;
  if (h >= 12 && h < 18) sunset = (h - 12) / 6;
  else if (h >= 18) {
    sunset = Math.max(0, 1 - (h - 18));
    night = Math.min(1, h - 18);
  } else if (h < 5) night = 1;
  else if (h < 6) night = 1 - (h - 5);
  sunset = Math.round(sunset * 1000) / 1000;
  night = Math.round(night * 1000) / 1000;
  const mode = night >= 0.5 ? "night" : sunset > 0.02 ? "sunset" : "day";
  return { sunset, night, mode };
}
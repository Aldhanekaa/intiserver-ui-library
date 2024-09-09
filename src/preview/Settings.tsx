import { useEffect, useState } from "react";
import { get } from "lodash";
import getPalette from "tailwindcss-palette-generator";
import { useFrame } from "react-frame-component";

const getTailwindConfig = (theme: Record<string, string>, w: Window) => {
  const primary = get(theme, "primaryColor", "#000");
  const secondary = get(theme, "secondaryColor", "#ccc");

  const headingFont = get(theme, "headingFont", "Inter");
  const bodyFont = get(theme, "bodyFont", "Inter");
  const borderRadius = get(theme, "roundedCorners", "0");

  const BG_LIGHT_MODE = get(theme, "bodyBgLightColor", "#fff");
  const BG_DARK_MODE = get(theme, "bodyBgDarkColor", "#000");
  const TEXT_LIGHT_MODE = get(theme, "bodyTextLightColor", "#000");
  const TEXT_DARK_MODE = get(theme, "bodyTextDarkColor", "#fff");

  const palette = getPalette([
    { color: primary, name: "primary" },
    { color: secondary, name: "secondary" },
  ]);
  const colors: Record<string, string> = {
    "bg-light": BG_LIGHT_MODE,
    "bg-dark": BG_DARK_MODE,
    "text-dark": TEXT_DARK_MODE,
    "text-light": TEXT_LIGHT_MODE,
  };
  const cbTheme = {
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1400px" },
      },
      fontFamily: { heading: [headingFont], body: [bodyFont] },
      borderRadius: { DEFAULT: `${!borderRadius ? "0px" : borderRadius}px` },
      colors: { ...palette, ...colors },
    },
  };
  return {
    darkMode: "class",
    theme: cbTheme,
    plugins: [
      //@ts-ignore
      w.tailwind.plugin.withOptions(
        () =>
          function ({ addBase, theme }: any) {
            addBase({
              "h1,h2,h3,h4,h5,h6": {
                fontFamily: theme("fontFamily.heading"),
              },
              body: {
                fontFamily: theme("fontFamily.body"),
                color: theme("colors.text-light"),
                backgroundColor: theme("colors.bg-light"),
              },
              ".dark body": {
                color: theme("colors.text-dark"),
                backgroundColor: theme("colors.bg-dark"),
              },
            });
          },
      ),
    ],
  };
};

export const Settings = ({ theme }: { theme: Record<string, string> }) => {
  const [initialized, setInitialized] = useState(false);
  const { window: w, document: d } = useFrame();
  function checkDarkmode(event: { data: string }) {
    if (event.data === "darkmode") {
      d?.documentElement.classList.add("dark");
    } else {
      d?.documentElement.classList.remove("dark");
    }
  }

  const onLoad = () => {};

  useEffect(() => {
    // @ts-ignore
    if (!w || !w.tailwind || initialized) return;
    // @ts-ignore
    w.tailwind.config = getTailwindConfig(theme, w);
    // @ts-ignore
    w.AOS.init();
    setInitialized(true);
  }, [theme, w, initialized]);

  useEffect(() => {
    w?.addEventListener("message", checkDarkmode);
    if (d?.readyState !== "loading") onLoad();
    d?.addEventListener("DOMContentLoaded", onLoad);
    return () => {
      d?.removeEventListener("DOMContentLoaded", onLoad);
      w?.removeEventListener("message", checkDarkmode);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

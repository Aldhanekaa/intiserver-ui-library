import { get } from "lodash";
import Frame from "react-frame-component";
import { Settings } from "./Settings.tsx";

const getFonts = (options: Record<string, string>) => {
  const headingFont = get(options, "headingFont", "Inter");
  const bodyFont = get(options, "bodyFont", "Inter");
  if (headingFont === bodyFont)
    return `<link href="https://fonts.googleapis.com/css2?family=${headingFont.replace(" ", "+")}:wght@400;500;600;700&display=swap" rel="stylesheet">`;

  return `
    <link href="https://fonts.googleapis.com/css2?family=${headingFont.replace(" ", "+")}:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=${bodyFont.replace(" ", "+")}:wght@400;500;600;700&display=swap" rel="stylesheet">
  `;
};

function extractBodyContent(html: string): string {
  const bodyRegex = /<body[^>]*>([\s\S]*)<\/body>/i;
  const match = html.match(bodyRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return html;
}

export const IframeInitialContent = (
  fonts: string,
  html: string,
  wrapperClass: string,
): string => `<!doctype html>
<html class="scroll-smooth h-full no-scrollbar overflow-y-auto" x-data="{darkMode: 'light'}"
      x-bind:class="{'dark': darkMode === 'dark' || (darkMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${fonts}
    <style>
    html { height: 100%; overflow:auto; }
    body { height: 100%; }
    html{ -ms-overflow-style: none;  /* IE and Edge */ scrollbar-width: none;  /* Firefox */}
    </style>   
    <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"></script>
  </head>
  <body class="font-body antialiased h-full">
    <div class="frame-root ${wrapperClass ? wrapperClass + " outline outline-1 outline-red-200 -outline-offset-1" : ""}">
    ${extractBodyContent(html)}
    </div>  
    <script src="https://unpkg.com/alpinejs" defer></script>
    <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
    <script>
      AOS.init();
      function addClickEventToLinks() {
        document.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', function(event) {
            event.preventDefault();
          });
        });
      }
      // Initialize the observer
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            addClickEventToLinks();
          }
        });
      });
      // Start observing the document body for added nodes
      observer.observe(document.body, { childList: true, subtree: true });
      // Call the function once in case links are already present
      addClickEventToLinks();
    </script>
  </body>
</html>`;

const PreviewWeb = ({
  html,
  theme,
  metadata = {},
}: {
  html: string;
  theme: Record<string, string>;
  metadata: Record<string, string>;
}) => {
  const isPageSection = get(metadata, "section", true);
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gray-100">
      <Frame
        className="no-scrollbar mx-auto h-full w-full overflow-y-auto border"
        initialContent={IframeInitialContent(
          getFonts(theme),
          html,
          isPageSection ? "" : "p-10 w-fit",
        )}>
        <Settings theme={theme} />
      </Frame>
    </div>
  );
};
export default PreviewWeb;

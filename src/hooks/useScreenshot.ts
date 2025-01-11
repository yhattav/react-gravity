import { useCallback } from "react";
import html2canvas from "html2canvas";

interface UseScreenshotProps {
  containerRef: React.RefObject<HTMLDivElement>;
  setIsFlashing: (isFlashing: boolean) => void;
}

export const useScreenshot = ({
  containerRef,
  setIsFlashing,
}: UseScreenshotProps) => {
  const handleScreenshot = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      try {
        // Temporarily hide all overlays except signature
        const overlayElements = containerRef.current?.querySelectorAll(
          ".floating-panel, .floating-button"
        );
        overlayElements?.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "none";
          }
        });

        // Show prefix and ensure signature is visible
        const prefix = document.querySelector(".signature-prefix");
        if (prefix instanceof HTMLElement) {
          prefix.style.display = "block";
        }

        // Take screenshot
        if (!containerRef.current) return;
        const screenshotPromise = html2canvas(containerRef.current, {
          background: "none",
        });

        // Wait for screenshot to complete
        const canvas = await screenshotPromise;

        // Restore overlay state immediately after starting the screenshot
        overlayElements?.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "";
          }
        });

        // Hide prefix again
        if (prefix instanceof HTMLElement) {
          prefix.style.display = "none";
        }

        setIsFlashing(true);

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
          });
        });

        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);

        // Show flash animation after screenshot is taken and copied
        setTimeout(() => setIsFlashing(false), 300);
      } catch (error) {
        console.error("Failed to take screenshot:", error);
      }
    },
    [containerRef, setIsFlashing]
  );

  return { handleScreenshot };
};

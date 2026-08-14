import { useCallback, useRef, useState } from "react";
import { ReactReader } from "react-reader";
import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";

const MIN_FONT = 80;
const MAX_FONT = 160;
const FONT_STEP = 10;

const EpubViewer = ({ fileUrl, location, onLocationChange }) => {
  const [fontSize, setFontSize] = useState(100);
  const renditionRef = useRef(null);

  const applyFontSize = useCallback((size) => {
    renditionRef.current?.themes.fontSize(`${size}%`);
  }, []);

  const handleFontChange = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(MAX_FONT, Math.max(MIN_FONT, prev + delta));
      applyFontSize(next);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        <ReactReader
          url={fileUrl}
          location={location}
          locationChanged={onLocationChange}
          epubInitOptions={{
            openAs: "epub",
          }}
          getRendition={(rendition) => {
            renditionRef.current = rendition;
            rendition.themes.fontSize(`${fontSize}%`);
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-border bg-background px-4 py-2">
        <span className="text-sm text-muted-foreground">Text size</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFontChange(-FONT_STEP)}
          disabled={fontSize <= MIN_FONT}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center text-sm text-muted-foreground">
          {fontSize}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFontChange(FONT_STEP)}
          disabled={fontSize >= MAX_FONT}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EpubViewer;

import { useEffect, useRef, useState } from "react";

export default function PostCaption({ text }) {
  const captionRef = useRef(null);
  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const caption = captionRef.current;
    if (!caption) return undefined;

    expandedRef.current = false;
    setExpanded(false);
    const measure = () => {
      if (expandedRef.current) return;
      setCanExpand(caption.scrollHeight > caption.clientHeight + 1);
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(caption);
    const frame = window.requestAnimationFrame(measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [text]);

  function toggleExpanded() {
    const next = !expandedRef.current;
    expandedRef.current = next;
    setExpanded(next);
  }

  return (
    <div className="mt-4">
      <p ref={captionRef} className={`whitespace-pre-wrap break-words text-sm leading-7 text-[#343247] ${expanded ? "" : "line-clamp-4"}`}>
        {text}
      </p>
      {canExpand && (
        <button type="button" aria-expanded={expanded} onClick={toggleExpanded} className="mt-1 text-sm font-semibold text-[#6f56d9] hover:text-[#5947a8]">
          {expanded ? "less" : "more"}
        </button>
      )}
    </div>
  );
}

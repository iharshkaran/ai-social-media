import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";

function getPdfThumbnailUrl(url) {
  try {
    const thumbnail = new URL(url);
    thumbnail.pathname = `${thumbnail.pathname.replace(/\/$/, "")}/ik-thumbnail.jpg`;
    // PDF pages can have transparent backgrounds; set white so the generated
    // thumbnail doesn't appear black in browsers and mobile previews.
    thumbnail.searchParams.set("tr", "pg-1,w-1200,f-jpg,bg-FFFFFF");
    return thumbnail.toString();
  } catch {
    return "";
  }
}

function PdfPreview({ url, name = "Shared document", compact = false }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  if (!url) return null;
  const thumbnailUrl = getPdfThumbnailUrl(url);

  return (
    <section className={`mt-4 overflow-hidden rounded-2xl border-2 border-[#191a32] bg-white shadow-[3px_4px_0_#191a32] ${compact ? "" : ""}`} aria-label={`PDF preview: ${name}`}>
      <header className="flex min-w-0 items-center gap-3 border-b border-[#e7dfd0] bg-[#fffdf9] px-3 py-3 sm:px-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee9ff] text-[#6f56d9]">
          <FileText size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#17182d]">{name}</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-[#858191]">PDF document</p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e7dfd0] bg-white px-2.5 py-2 text-xs font-semibold text-[#514e62] transition hover:border-[#7660dc] hover:text-[#5947a8]">
          Open <ExternalLink size={13} />
        </a>
      </header>
      <div className="bg-[#e8e5e0] p-2 sm:p-3">
        {thumbnailUrl && !thumbnailFailed ? (
          <a href={url} target="_blank" rel="noreferrer" aria-label={`Open full PDF: ${name}`} className="group relative block overflow-hidden rounded-lg border border-[#d8d0c1] bg-white">
            <img
              src={thumbnailUrl}
              alt={`First page of ${name}`}
              loading="lazy"
              decoding="async"
              onError={() => setThumbnailFailed(true)}
              className={`mx-auto block w-full object-contain ${compact ? "max-h-[520px]" : "max-h-[720px]"}`}
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-[#191a32]/85 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100">Open full PDF</span>
          </a>
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-[#d8d0c1] bg-white px-5 py-10 text-center text-sm text-[#6e6a7b]">
            <FileText size={32} className="text-[#6f56d9]" />
            <span className="mt-3 font-semibold text-[#17182d]">Preview isn’t available here</span>
            <span className="mt-1">Open the PDF to view the document.</span>
          </a>
        )}
      </div>
    </section>
  );
}

export default PdfPreview;

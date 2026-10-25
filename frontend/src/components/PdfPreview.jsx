import { ExternalLink, FileText } from "lucide-react";

function PdfPreview({ url, name = "Shared document", compact = false }) {
  if (!url) return null;

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
        <iframe
          src={`${url}#toolbar=1&navpanes=0&view=FitH`}
          title={`${name} PDF preview`}
          loading="lazy"
          className={`block w-full rounded-lg border border-[#d8d0c1] bg-white ${compact ? "h-[360px] sm:h-[440px]" : "h-[480px] sm:h-[640px]"}`}
        />
      </div>
    </section>
  );
}

export default PdfPreview;

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Save, X } from "lucide-react";
import { api } from "../utils/api";

const categories = ["General", "Project", "Hackathon", "Learning", "Achievement"];

function PostEditModal({ post, onClose, onSaved }) {
  const [text, setText] = useState(post.text || "");
  const [category, setCategory] = useState(categories.includes(post.category) ? post.category : "General");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);
  const savingRef = useRef(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape" || saving) return;
      if (categoryOpen) setCategoryOpen(false);
      else onClose();
    };
    const onPointerDown = (event) => {
      if (!categoryRef.current?.contains(event.target)) setCategoryOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [categoryOpen, onClose, saving]);

  async function savePost(event) {
    event.preventDefault();
    if (savingRef.current) return;
    if (!text.trim() && !post.image && !post.mediaUrl) {
      setError("Add some text or attach media before saving.");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const updated = await api.updatePost(post.id, {
        text: text.trim(),
        category,
        image: post.image || "",
        mediaUrl: post.mediaUrl || "",
        mediaType: post.mediaType || "",
        mediaName: post.mediaName || "",
      });
      onSaved(updated);
      onClose();
    } catch (requestError) {
      setError(requestError.message || "Could not save your changes.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#17182d]/65 p-3 sm:p-6" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }}>
      <form role="dialog" aria-modal="true" aria-labelledby="edit-post-title" onSubmit={savePost} className="w-full max-w-xl rounded-[24px] border-2 border-[#191a32] bg-[#fffdf9] p-4 shadow-[5px_6px_0_#c9bcff] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-post-title" className="text-lg font-extrabold">Edit post</h2>
            <p className="mt-1 text-xs text-[#6e6a7b]">Update your caption or category. Attached media will stay as it is.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close edit post" className="rounded-lg p-1.5 text-[#6e6a7b] hover:bg-[#f4f0e8] disabled:opacity-50"><X size={19} /></button>
        </div>

        <label htmlFor="edit-post-caption" className="mt-5 block text-sm font-semibold">Caption</label>
        <textarea id="edit-post-caption" value={text} onChange={(event) => setText(event.target.value)} maxLength={3000} rows={6} autoFocus className="mt-2 w-full resize-y rounded-2xl border-2 border-[#e7dfd0] bg-white p-3 text-sm leading-6 outline-none focus:border-[#7660dc]" placeholder="Write something about your post…" />
        <div className="mt-1 text-right text-[11px] text-[#858191]">{text.length}/3000</div>

        <label className="mt-4 block text-sm font-semibold">Category</label>
        <div className="relative mt-2" ref={categoryRef}>
          <button
            type="button"
            id="edit-post-category"
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
            aria-label={`Post category: ${category}`}
            onClick={() => setCategoryOpen((open) => !open)}
            className={`flex w-full items-center justify-between rounded-xl border-2 bg-white px-3 py-2.5 text-left text-sm outline-none transition ${categoryOpen ? "border-[#7660dc] ring-2 ring-[#c9bcff]/70" : "border-[#e7dfd0] hover:border-[#7660dc]"}`}
          >
            <span>{category}</span>
            <ChevronDown size={17} className={`text-[#6e6a7b] transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
          </button>
          {categoryOpen && (
            <div role="listbox" aria-label="Post category" className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border-2 border-[#191a32] bg-white p-1.5 shadow-[3px_4px_0_#c9bcff]">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={category === item}
                  onClick={() => { setCategory(item); setCategoryOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${category === item ? "bg-[#eee9ff] font-bold text-[#5947a8]" : "text-[#514e62] hover:bg-[#f4f0e8]"}`}
                >
                  {item}
                  {category === item && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {(post.image || post.mediaUrl) && <p className="mt-4 truncate rounded-xl border border-[#e7dfd0] bg-white px-3 py-2 text-xs text-[#6e6a7b]">Attached {post.mediaType === "pdf" ? "PDF" : post.mediaType === "video" ? "video" : "image"} is kept on this post.</p>}
        {error && <p role="alert" className="mt-3 text-sm text-[#a33b48]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-xl border-2 border-[#e7dfd0] bg-white px-4 py-2.5 text-sm font-semibold text-[#514e62] hover:bg-[#f4f0e8] disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-4 py-2.5 text-sm font-bold text-[#17182d] shadow-[0_2px_0_#191a32] hover:bg-[#f3d446] disabled:cursor-wait disabled:opacity-60"><Save size={16} />{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}

export default PostEditModal;

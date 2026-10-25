
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Save,
  X,
  ExternalLink,
  ImagePlus,
  FolderKanban,
  Star,
  Video,
  Users,
  FileText,
} from "lucide-react";
import Navbar from "../components/Navbar";
import ProfileSections from "../components/ProfileSections";
import ProfilePostGrid from "../components/ProfilePostGrid";
import { api } from "../utils/api";
import { useAuth } from "../context/useAuth";
import { uploadFileToImageKit, uploadImageToImageKit } from "../utils/imagekitUpload";
import { useConnectlyStore } from "../store/useConnectlyStore";

const defaultProfile = {
  name: "Your Name",
  headline: "Student | Learning and building",
  university: "",
  course: "",
  year: "",
  location: "",
  bio: "",
  skills: [],
  photo: "",
  banner: "",
  projects: [],
  education: [],
  featured: [],
  portfolioUrl: "",
};

function createKey() {
  return globalThis.crypto?.randomUUID?.() || `orbitu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cropImageFile(file, aspectRatio, { x, y, zoom }) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      const width = 1200;
      const height = Math.round(width / aspectRatio);
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const offsetX = -(drawWidth - width) * (x / 100);
      const offsetY = -(drawHeight - height) * (y / 100);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) { reject(new Error("Could not prepare this image. Please try another one.")); return; }
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Could not crop this image. Please try again.")); return; }
        resolve(new File([blob], `orbitu-${Date.now()}.jpg`, { type: "image/jpeg" }));
      }, "image/jpeg", 0.9);
    };
    image.onerror = () => { URL.revokeObjectURL(sourceUrl); reject(new Error("Could not open this image. Please try another one.")); };
    image.src = sourceUrl;
  });
}

function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(() => ({ ...defaultProfile, ...user }));
  const [draft, setDraft] = useState(profile);
  const [ownPosts, setOwnPosts] = useState([]);
  const [ownPostCount, setOwnPostCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [imageCrop, setImageCrop] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    if (!photoPreview) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setPhotoPreview(""); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [photoPreview]);

  useEffect(() => {
    let active = true;
    if (user?.id) {
      api.userPostsWithMeta(user.id).then((result) => { if (active) { setOwnPosts(result.data || []); setOwnPostCount(result.postCount ?? result.data?.length ?? 0); } }).catch(() => {});
      useConnectlyStore.getState().loadConnections().then((network) => { if (active) setConnectionCount(network.connected.length); }).catch(() => {});
    }
    return () => { active = false; };
  }, [user?.id]);

  function updateField(event) {
    setDraft((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const payload = {
        ...draft,
        projects: draft.projects.filter((item) => item.title.trim()).map((item) => ({
          key: item.key || item._id || createKey(),
          title: item.title.trim(),
          description: item.description || "",
          url: item.url || "",
          mediaUrl: item.mediaUrl || "",
          mediaType: item.mediaType || "",
          relatedPostIds: item.relatedPostIds || [],
        })),
        education: draft.education.filter((item) => item.school.trim()).map((item) => ({
          school: item.school.trim(), degree: item.degree || "", field: item.field || "",
          startYear: item.startYear || "", endYear: item.endYear || "", description: item.description || "",
        })),
        featured: draft.featured.map((item) => ({
          type: item.type || (item.url ? "link" : "project"), projectKey: item.projectKey || "",
          postId: item.postId || "", title: item.title || "", description: item.description || "", url: item.url || "",
        })).filter((item) => item.type === "project" ? item.projectKey : item.type === "post" ? item.postId : item.title.trim() && item.url.trim()),
      };
      const { user } = await api.updateProfile(payload);
      const updatedProfile = { ...defaultProfile, ...user };
      setUser(user);
      setProfile(updatedProfile);
      setDraft(updatedProfile);
      setEditing(false);
      setSavedMessage("Profile updated successfully!");
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (error) { setSavedMessage(error.message); }
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  function handleImageSelection(event, target) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("Choose an image smaller than 8 MB.");
      event.target.value = "";
      return;
    }

    setPhotoError("");
    setImageCrop({ file, preview: URL.createObjectURL(file), target, x: 50, y: 50, zoom: 1 });
  }

  async function applyImageCrop() {
    if (!imageCrop) return;
    setPhotoUploading(true);
    setPhotoProgress(0);
    setPhotoError("");
    try {
      const aspectRatio = imageCrop.target === "photo" ? 1 : 3.2;
      const croppedFile = await cropImageFile(imageCrop.file, aspectRatio, imageCrop);
      const folder = imageCrop.target === "photo" ? "/connectly/profiles" : "/connectly/banners";
      const uploaded = await uploadImageToImageKit(croppedFile, folder, setPhotoProgress);
      setDraft((current) => ({ ...current, [imageCrop.target]: uploaded.url }));
      URL.revokeObjectURL(imageCrop.preview);
      setImageCrop(null);
    } catch (error) {
      setPhotoError(error.message);
    } finally {
      setPhotoUploading(false);
    }
  }

  function cancelImageCrop() {
    if (imageCrop?.preview) URL.revokeObjectURL(imageCrop.preview);
    setImageCrop(null);
  }

  function cancelEditing() {
    cancelImageCrop();
    setDraft(profile);
    setEditing(false);
    setNewSkill("");
  }

  function addSkill(event) {
    event.preventDefault();
    const skill = newSkill.trim();

    if (
      skill &&
      !draft.skills.some((item) => item.toLowerCase() === skill.toLowerCase())
    ) {
      setDraft((current) => ({
        ...current,
        skills: [...current.skills, skill],
      }));
    }

    setNewSkill("");
  }

  function removeSkill(skillToRemove) {
    setDraft((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill !== skillToRemove),
    }));
  }

  function updateProfileSection(section, index, field, value) {
    setDraft((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  }

  async function handleProjectMediaChange(event, index) {
    const file = event.target.files?.[0];
    if (!file) return;
    const mediaType = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "";
    const maxSize = mediaType === "video" ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    if (!mediaType) { setPhotoError("Choose an image or video file."); event.target.value = ""; return; }
    if (file.size > maxSize) { setPhotoError(mediaType === "video" ? "Choose a video smaller than 50 MB." : "Choose an image smaller than 8 MB."); event.target.value = ""; return; }
    setPhotoUploading(true);
    setPhotoProgress(0);
    setPhotoError("");
    try {
      const uploaded = await uploadFileToImageKit(file, "/connectly/projects", setPhotoProgress);
      setDraft((current) => ({ ...current, projects: current.projects.map((project, itemIndex) => itemIndex === index ? { ...project, mediaUrl: uploaded.url, mediaType } : project) }));
    } catch (error) {
      setPhotoError(error.message);
    } finally {
      setPhotoUploading(false);
      event.target.value = "";
    }
  }

  function addProfileSectionItem(section, item) {
    setDraft((current) => ({ ...current, [section]: [...current[section], item] }));
  }

  function removeProfileSectionItem(section, index) {
    setDraft((current) => ({ ...current, [section]: current[section].filter((_, itemIndex) => itemIndex !== index) }));
  }

  const inputClass =
    "w-full rounded-2xl border-2 border-[#e7dfd0] bg-[#fffdf9] px-4 py-3 text-sm text-[#17182d] outline-none focus:border-[#7660dc]";
  const labelClass = "mb-2 block text-sm font-medium text-[#514e62]";

  return (
    <div className="min-h-screen orbit-pattern-bg text-[#17182d]">
      <Navbar />
      <main className="px-4 py-8 pb-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[28px] border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#c9bcff]">
          <div className="relative h-36 overflow-hidden bg-gradient-to-r from-[#c9bcff] via-[#ffafd0] to-[#87d4f4] sm:h-48">
            {(editing ? draft.banner : profile.banner) && <img src={editing ? draft.banner : profile.banner} alt="Profile banner" className="h-full w-full object-cover" />}
            {editing && <label htmlFor="profile-banner" className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-[#191a32] bg-white px-3 py-2 text-xs font-semibold text-[#17182d] shadow-[0_2px_0_#191a32] hover:bg-[#fff9e8]"><ImagePlus size={15} /> Change banner<input id="profile-banner" type="file" accept="image/*" onChange={(event) => handleImageSelection(event, "banner")} className="sr-only" disabled={photoUploading} /></label>}
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <div className="relative">
                {editing ? <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-[30px] border-4 border-white bg-[#fff3b7] text-[#6f56d9] shadow-[0_0_0_2px_#191a32]">
                  {draft.photo ? <img src={draft.photo} alt={`${profile.name}'s profile`} decoding="async" className="h-full w-full object-cover" /> : <GraduationCap size={46} />}
                </div> : profile.photo ? <button type="button" onClick={() => setPhotoPreview(profile.photo)} aria-label="Preview profile photo" className="flex h-36 w-36 cursor-zoom-in items-center justify-center overflow-hidden rounded-[30px] border-4 border-white bg-[#fff3b7] text-[#6f56d9] shadow-[0_0_0_2px_#191a32] transition hover:shadow-[0_0_0_4px_#c9bcff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7660dc]/30">
                  <img src={profile.photo} alt={`${profile.name}'s profile`} decoding="async" className="h-full w-full object-cover" />
                </button> : <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-[30px] border-4 border-white bg-[#fff3b7] text-[#6f56d9] shadow-[0_0_0_2px_#191a32]"><GraduationCap size={46} /></div>}
                {editing && (
                  <label htmlFor="profile-photo" className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border-2 border-[#191a32] bg-[#ffe35b] text-black shadow-[0_2px_0_#191a32]" title="Change profile photo">
                    <Camera size={16} />
                    <input id="profile-photo" type="file" accept="image/*" onChange={(event) => handleImageSelection(event, "photo")} className="sr-only" disabled={photoUploading} />
                  </label>
                )}
              </div>

              {!editing && (
                <button
                  onClick={() => {
                    setDraft(profile);
                    setEditing(true);
                  }}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-white px-4 py-2.5 text-sm font-semibold shadow-[0_3px_0_#c9bcff] transition hover:-translate-y-0.5"
                >
                  <Pencil size={16} />
                  Edit profile
                </button>
              )}
            </div>

            {savedMessage && (
              <p role="status" className="mt-4 rounded-xl bg-[#eee9ff] px-4 py-3 text-sm text-[#5947a8]">
                {savedMessage}
              </p>
            )}
            {photoError && <p role="alert" className="mt-3 text-sm text-[#a33b48]">{photoError}</p>}
            {editing && photoUploading && <p role="status" className="mt-3 text-sm text-[#6e6a7b]">Uploading image to ImageKit… {photoProgress}%</p>}

            {editing && imageCrop && <section className="mt-6 rounded-2xl border-2 border-[#191a32] bg-[#fffdf9] p-4 shadow-[3px_4px_0_#c9bcff] sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold">Adjust {imageCrop.target === "photo" ? "profile photo" : "banner"}</h2><p className="mt-1 text-xs text-[#6e6a7b]">Move and zoom the image until it fits the frame.</p></div><button type="button" onClick={cancelImageCrop} className="rounded-lg p-1 text-[#6e6a7b] hover:bg-[#f4f0e8]" aria-label="Cancel image adjustment"><X size={18} /></button></div>
              <div className={`mx-auto mt-4 overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#e7dfd0] ${imageCrop.target === "photo" ? "aspect-square w-48" : "aspect-[3.2/1] w-full"}`}><img src={imageCrop.preview} alt="Image crop preview" className="h-full w-full object-cover" style={{ objectPosition: `${imageCrop.x}% ${imageCrop.y}%`, transform: `scale(${imageCrop.zoom})` }} /></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="text-xs font-medium text-[#514e62]">Horizontal position<input type="range" min="0" max="100" value={imageCrop.x} onChange={(event) => setImageCrop((current) => ({ ...current, x: Number(event.target.value) }))} className="mt-2 block w-full accent-[#6f56d9]" /></label>
                <label className="text-xs font-medium text-[#514e62]">Vertical position<input type="range" min="0" max="100" value={imageCrop.y} onChange={(event) => setImageCrop((current) => ({ ...current, y: Number(event.target.value) }))} className="mt-2 block w-full accent-[#6f56d9]" /></label>
                <label className="text-xs font-medium text-[#514e62]">Zoom<input type="range" min="1" max="2.5" step="0.05" value={imageCrop.zoom} onChange={(event) => setImageCrop((current) => ({ ...current, zoom: Number(event.target.value) }))} className="mt-2 block w-full accent-[#6f56d9]" /></label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={applyImageCrop} disabled={photoUploading} className="rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-4 py-2 text-sm font-bold text-black shadow-[0_2px_0_#191a32] disabled:opacity-50">{photoUploading ? `Uploading… ${photoProgress}%` : "Use this image"}</button><button type="button" onClick={cancelImageCrop} disabled={photoUploading} className="rounded-xl border border-[#e7dfd0] px-4 py-2 text-sm font-semibold text-[#514e62] disabled:opacity-50">Cancel</button></div>
            </section>}

            {editing ? (
              <form onSubmit={saveProfile} className="mt-6 space-y-5">
                <div>
                  <label className={labelClass} htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={draft.name}
                    onChange={updateField}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="headline">
                    Headline
                  </label>
                  <input
                    id="headline"
                    name="headline"
                    value={draft.headline}
                    onChange={updateField}
                    placeholder="e.g. B.Tech student | Frontend developer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="portfolioUrl">Portfolio or LinkedIn link</label>
                  <input id="portfolioUrl" name="portfolioUrl" type="url" value={draft.portfolioUrl} onChange={updateField} placeholder="https://your-portfolio.com" className={inputClass} />
                  <p className="mt-2 text-xs text-[#858191]">Add a portfolio, GitHub or LinkedIn profile.</p>
                </div>

                <div>
                  <label className={labelClass} htmlFor="university">
                    University / College
                  </label>
                  <input
                    id="university"
                    name="university"
                    value={draft.university}
                    onChange={updateField}
                    placeholder="Enter your college"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="course">
                      Course
                    </label>
                    <select
                      id="course"
                      name="course"
                      value={draft.course}
                      onChange={updateField}
                      className={inputClass}
                    >
                      <option value="">Select course</option>
                      {["B.Tech", "BCA", "B.Sc", "BBA", "MCA", "M.Tech", "Other"].map(
                        (course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="year">
                      Study year
                    </label>
                    <select
                      id="year"
                      name="year"
                      value={draft.year}
                      onChange={updateField}
                      className={inputClass}
                    >
                      <option value="">Select year</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Other"].map(
                        (year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="location">
                    Location (optional)
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={draft.location}
                    onChange={updateField}
                    placeholder="City, country"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="bio">
                    About you
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={draft.bio}
                    onChange={updateField}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell other students about your interests and goals..."
                    className={inputClass + " resize-y"}
                  />
                  <p className="mt-1 text-right text-xs text-[#858191]">
                    {draft.bio.length}/500
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Skills</label>

                  <div className="flex flex-wrap gap-2">
                    {draft.skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-2 rounded-full border border-[#d9cffb] bg-[#eee9ff] px-3 py-2 text-xs text-[#5947a8]"
                      >
                        {skill}
                        <button
                          type="button"
                          aria-label={`Remove ${skill}`}
                          onClick={() => removeSkill(skill)}
                          className="hover:text-[#17182d]"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      value={newSkill}
                      onChange={(event) => setNewSkill(event.target.value)}
                      placeholder="Add a skill"
                      className={inputClass}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill(event);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      aria-label="Add skill"
                      className="rounded-xl bg-[#ffe35b] px-4 text-black hover:bg-[#f3d446]"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <section className="border-t border-[#e7dfd0] pt-5">
                  <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold"><FolderKanban size={18} className="text-[#6f56d9]" /> Projects</h2><p className="mt-1 text-xs text-[#858191]">Add a cover image or demo video, then attach posts about your work.</p></div><button type="button" onClick={() => addProfileSectionItem("projects", { key: createKey(), title: "", description: "", url: "", mediaUrl: "", mediaType: "", relatedPostIds: [] })} className="inline-flex shrink-0 items-center gap-1 rounded-lg border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold text-black shadow-[0_2px_0_#191a32]"><Plus size={14} /> Add project</button></div>
                  <div className="mt-4 space-y-4">{draft.projects.map((project, index) => <div key={project.key || project._id || `project-${index}`} className="rounded-2xl border-2 border-[#191a32] bg-[#fffdf9] p-4 shadow-[3px_4px_0_#c9bcff]"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Project {index + 1}</p><button type="button" onClick={() => removeProfileSectionItem("projects", index)} aria-label={`Remove project ${index + 1}`} className="rounded-lg p-1.5 text-[#858191] hover:bg-red-50 hover:text-[#a33b48]"><X size={16} /></button></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={project.title} onChange={(event) => updateProfileSection("projects", index, "title", event.target.value)} placeholder="Project name" maxLength={100} className={inputClass} /><input type="url" value={project.url || ""} onChange={(event) => updateProfileSection("projects", index, "url", event.target.value)} placeholder="Live demo or repository link" maxLength={500} className={inputClass} /></div><textarea value={project.description} onChange={(event) => updateProfileSection("projects", index, "description", event.target.value)} placeholder="What did you build? Mention your role, tools and impact." maxLength={600} rows={3} className={`${inputClass} mt-3 resize-y`} />
                    <div className="mt-4 rounded-xl border border-[#e7dfd0] bg-white p-3"><p className="text-xs font-semibold text-[#514e62]">Project media</p>{project.mediaUrl && <div className="mt-3 overflow-hidden rounded-xl border border-[#e7dfd0] bg-[#191a32]">{project.mediaType === "video" ? <video src={project.mediaUrl} controls preload="metadata" className="max-h-72 w-full" /> : <img src={project.mediaUrl} alt={`${project.title || "Project"} preview`} className="max-h-72 w-full object-contain" />}</div>}<div className="mt-3 flex flex-wrap items-center gap-3"><label htmlFor={`project-media-${index}`} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#e7dfd0] px-3 py-2 text-xs font-semibold text-[#514e62] hover:border-[#7660dc] hover:text-[#5947a8]">{project.mediaType === "video" ? <Video size={15} /> : <ImagePlus size={15} />}{project.mediaUrl ? "Replace media" : "Add image or video"}<input id={`project-media-${index}`} type="file" accept="image/*,video/*" onChange={(event) => handleProjectMediaChange(event, index)} className="sr-only" disabled={photoUploading} /></label>{project.mediaUrl && <button type="button" onClick={() => setDraft((current) => ({ ...current, projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, mediaUrl: "", mediaType: "" } : item) }))} className="text-xs font-medium text-[#a33b48] hover:underline">Remove media</button>}<span className="text-[11px] text-[#858191]">Images up to 8 MB · videos up to 50 MB</span></div></div>
                    <div className="mt-4"><p className="text-xs font-semibold text-[#514e62]">Related posts</p><p className="mt-1 text-xs text-[#858191]">Select updates from your feed that belong to this project.</p>{ownPosts.length ? <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-[#e7dfd0] bg-white p-3">{ownPosts.map((post) => <label key={post.id} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 hover:bg-[#f4f0e8]"><input type="checkbox" checked={(project.relatedPostIds || []).includes(post.id)} onChange={(event) => updateProfileSection("projects", index, "relatedPostIds", event.target.checked ? [...(project.relatedPostIds || []), post.id] : (project.relatedPostIds || []).filter((id) => id !== post.id))} className="mt-0.5 accent-[#6f56d9]" /><span className="min-w-0"><span className="block line-clamp-2 text-xs text-[#514e62]">{post.text || post.mediaName || "Media post"}</span><span className="mt-1 block text-[10px] text-[#858191]">{post.category || "Post"}{post.image || post.mediaUrl ? " · includes media" : ""}</span></span></label>)}</div> : <p className="mt-2 rounded-xl bg-[#f4f0e8] p-3 text-xs text-[#858191]">Your posts will appear here so you can connect them to a project.</p>}</div>
                  </div>)}</div>
                </section>

                <section className="border-t border-[#e7dfd0] pt-5">
                  <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold"><GraduationCap size={18} className="text-[#6f56d9]" /> Education</h2><p className="mt-1 text-xs text-[#858191]">Add your school, degree and study dates.</p></div><button type="button" onClick={() => addProfileSectionItem("education", { school: "", degree: "", field: "", startYear: "", endYear: "", description: "" })} className="inline-flex shrink-0 items-center gap-1 rounded-lg border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold text-black shadow-[0_2px_0_#191a32]"><Plus size={14} /> Add</button></div>
                  <div className="mt-4 space-y-3">{draft.education.map((entry, index) => <div key={`education-${index}`} className="rounded-2xl border-2 border-[#191a32] bg-[#fffdf9] p-4 shadow-[3px_4px_0_#87d4f4]"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Education {index + 1}</p><button type="button" onClick={() => removeProfileSectionItem("education", index)} aria-label={`Remove education ${index + 1}`} className="rounded-lg p-1.5 text-[#858191] hover:bg-red-50 hover:text-[#a33b48]"><X size={16} /></button></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={entry.school} onChange={(event) => updateProfileSection("education", index, "school", event.target.value)} placeholder="School or college" maxLength={160} className={inputClass} /><input value={entry.degree} onChange={(event) => updateProfileSection("education", index, "degree", event.target.value)} placeholder="Degree (e.g. B.Tech)" maxLength={100} className={inputClass} /><input value={entry.field} onChange={(event) => updateProfileSection("education", index, "field", event.target.value)} placeholder="Field of study (optional)" maxLength={100} className={inputClass} /><div className="grid grid-cols-2 gap-3"><input value={entry.startYear} onChange={(event) => updateProfileSection("education", index, "startYear", event.target.value)} placeholder="Start year" maxLength={20} className={inputClass} /><input value={entry.endYear} onChange={(event) => updateProfileSection("education", index, "endYear", event.target.value)} placeholder="End year" maxLength={20} className={inputClass} /></div></div><textarea value={entry.description} onChange={(event) => updateProfileSection("education", index, "description", event.target.value)} placeholder="Notes or achievements (optional)" maxLength={500} rows={2} className={`${inputClass} mt-3 resize-y`} /></div>)}</div>
                </section>

                <section className="border-t border-[#e7dfd0] pt-5">
                  <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold"><Star size={18} className="text-[#6f56d9]" /> Featured</h2><p className="mt-1 text-xs text-[#858191]">Choose projects or posts to spotlight, or add an external link.</p></div><button type="button" onClick={() => addProfileSectionItem("featured", { type: "project", projectKey: "", postId: "", title: "", description: "", url: "" })} className="inline-flex shrink-0 items-center gap-1 rounded-lg border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold text-black shadow-[0_2px_0_#191a32]"><Plus size={14} /> Add featured</button></div>
                  <div className="mt-4 space-y-3">{draft.featured.map((item, index) => <div key={`featured-${index}`} className="rounded-2xl border-2 border-[#191a32] bg-[#fffdf9] p-4 shadow-[3px_4px_0_#ffe35b]"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Featured item {index + 1}</p><button type="button" onClick={() => removeProfileSectionItem("featured", index)} aria-label={`Remove featured item ${index + 1}`} className="rounded-lg p-1.5 text-[#858191] hover:bg-red-50 hover:text-[#a33b48]"><X size={16} /></button></div><label className="mt-3 block text-xs font-medium text-[#514e62]">Feature type<select value={item.type || "link"} onChange={(event) => updateProfileSection("featured", index, "type", event.target.value)} className={`${inputClass} mt-1`}><option value="project">Project</option><option value="post">Feed post</option><option value="link">External link</option></select></label>{(item.type || "link") === "project" && <label className="mt-3 block text-xs font-medium text-[#514e62]">Choose a project<select value={item.projectKey || ""} onChange={(event) => updateProfileSection("featured", index, "projectKey", event.target.value)} className={`${inputClass} mt-1`}><option value="">Select project</option>{draft.projects.filter((project) => project.title.trim()).map((project) => <option key={project.key || project._id} value={project.key || project._id}>{project.title}</option>)}</select></label>}{(item.type || "link") === "post" && <label className="mt-3 block text-xs font-medium text-[#514e62]">Choose a post<select value={item.postId || ""} onChange={(event) => updateProfileSection("featured", index, "postId", event.target.value)} className={`${inputClass} mt-1`}><option value="">Select a post</option>{ownPosts.map((post) => <option key={post.id} value={post.id}>{(post.text || post.mediaName || "Media post").slice(0, 90)}</option>)}</select></label>}{(item.type || "link") === "link" && <div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={item.title || ""} onChange={(event) => updateProfileSection("featured", index, "title", event.target.value)} placeholder="Featured title" maxLength={100} className={inputClass} /><input type="url" value={item.url || ""} onChange={(event) => updateProfileSection("featured", index, "url", event.target.value)} placeholder="Website or portfolio URL" maxLength={500} className={inputClass} /></div>}{(item.type || "link") === "link" && <textarea value={item.description || ""} onChange={(event) => updateProfileSection("featured", index, "description", event.target.value)} placeholder="What should people know about this?" maxLength={500} rows={2} className={`${inputClass} mt-3 resize-y`} />}</div>)}</div>
                </section>

                <div className="flex flex-wrap gap-3 border-t border-[#e7dfd0] pt-5">
                  <button
                    type="submit"
                    disabled={photoUploading}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-5 py-3 text-sm font-bold text-black shadow-[0_3px_0_#191a32] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />
                    Save changes
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={photoUploading}
                    className="rounded-xl border-2 border-[#e7dfd0] px-5 py-3 text-sm font-semibold text-[#514e62] hover:bg-[#f4f0e8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5">
                <h2 className="text-2xl font-bold">
                  {profile.name || "Your Name"}
                </h2>
                <p className="mt-1 text-sm text-[#6e6a7b]">
                  {profile.headline || "Add a headline to your profile"}
                </p>

                {(profile.university || profile.course || profile.year) && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-[#514e62]">
                    <GraduationCap
                      size={17}
                      className="shrink-0 text-[#6f56d9]"
                    />
                    {[profile.course, profile.year, profile.university]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                {profile.location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#6e6a7b]">
                    <MapPin size={16} />
                    {profile.location}
                  </p>
                )}

                <div className="mt-5 grid max-w-lg grid-cols-2 gap-3">
                  <Link to="/connections" className="group flex items-center gap-3 rounded-2xl border-2 border-[#191a32] bg-[#fff3b7] p-3.5 shadow-[2px_3px_0_#191a32] transition hover:-translate-y-0.5 sm:p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#191a32]/15 bg-white/70 text-[#5947a8]"><Users size={19} /></span>
                    <span><strong className="block text-xl leading-none">{connectionCount}</strong><span className="mt-1 block text-xs text-[#6e6a7b] group-hover:text-[#17182d]">Connections</span></span>
                  </Link>
                  <a href="#profile-posts" className="group flex items-center gap-3 rounded-2xl border-2 border-[#191a32] bg-[#eee9ff] p-3.5 shadow-[2px_3px_0_#191a32] transition hover:-translate-y-0.5 sm:p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#191a32]/15 bg-white/70 text-[#5947a8]"><FileText size={19} /></span>
                    <span><strong className="block text-xl leading-none">{ownPostCount}</strong><span className="mt-1 block text-xs text-[#6e6a7b] group-hover:text-[#17182d]">Posts</span></span>
                  </a>
                </div>

                <section className="mt-7 rounded-[22px] border-2 border-[#191a32] bg-[#fffdf9] p-5 shadow-[3px_4px_0_#c9bcff]">
                  <h2 className="font-bold">About</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6e6a7b]">
                    {profile.bio || "Add a short introduction about yourself."}
                  </p>
                  <div className="mt-5 border-t border-[#e7dfd0] pt-4">
                    <h3 className="text-sm font-bold">Things I can do</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.length ? (
                      profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-xl border border-[#e7dfd0] bg-[#eee9ff] px-4 py-2 text-sm font-medium text-[#5947a8]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[#858191]">
                        No skills added yet.
                      </p>
                    )}
                    </div>
                  </div>
                </section>

              </div>
            )}
          </div>
        </section>

        {!editing && <>
          <ProfileSections profile={profile} posts={ownPosts} />

          {profile.portfolioUrl && <section className="mt-5 rounded-[24px] border-2 border-[#191a32] bg-[#fff3b7] p-5 shadow-[3px_4px_0_#191a32]"><h2 className="font-bold">Find me around the web</h2><a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 break-all text-sm font-medium text-[#6f56d9] hover:text-[#5947a8]"><ExternalLink size={16} /> {profile.portfolioUrl}</a></section>}

          <section id="profile-posts" className="mt-8 w-full scroll-mt-24 rounded-[28px] border-2 border-[#191a32] bg-white p-5 shadow-[4px_5px_0_#c9bcff] sm:p-8">
            <div className="mb-5 flex items-end justify-between gap-3 border-b-2 border-[#191a32] pb-4"><div><p className="inline-flex rounded-full bg-[#eee9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5947a8]">Your activity</p><h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">Posts</h2><p className="mt-1 text-sm text-[#858191]">Updates you have shared with your network.</p></div><span className="shrink-0 rounded-full border-2 border-[#191a32] bg-[#fff3b7] px-3 py-1.5 text-xs font-bold text-[#17182d]">{ownPostCount} total</span></div>
            <ProfilePostGrid posts={ownPosts} />
          </section>
        </>}
      </div>
      </main>
      {photoPreview && <div role="dialog" aria-modal="true" aria-label="Profile photo preview" onClick={() => setPhotoPreview("")} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111222]/85 p-5 backdrop-blur-sm">
        <button type="button" onClick={() => setPhotoPreview("")} aria-label="Close profile photo preview" className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20"><X size={22} /></button>
        <img src={photoPreview} alt={`${profile.name}'s profile photo enlarged`} onClick={(event) => event.stopPropagation()} className="max-h-[76vh] max-w-[min(86vw,560px)] rounded-2xl border-2 border-white/80 object-contain shadow-2xl" />
      </div>}
    </div>
  );
}

export default Profile;


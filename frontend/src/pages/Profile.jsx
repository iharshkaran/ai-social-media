
import { useState } from "react";
import {
  Camera,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { api } from "../utils/api";
import { useAuth } from "../context/useAuth";
import { uploadImageToImageKit } from "../utils/imagekitUpload";

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
  portfolioUrl: "",
};

function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(() => ({ ...defaultProfile, ...user }));
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);

  function updateField(event) {
    setDraft((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const { user } = await api.updateProfile(draft);
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

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setPhotoError("Choose a photo smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    setPhotoUploading(true);
    setPhotoProgress(0);
    setPhotoError("");
    try {
      const uploaded = await uploadImageToImageKit(file, "/connectly/profiles", setPhotoProgress);
      setDraft((current) => ({ ...current, photo: uploaded.url }));
    } catch (error) {
      setPhotoError(error.message);
      event.target.value = "";
    } finally {
      setPhotoUploading(false);
    }
  }

  function cancelEditing() {
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

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400";
  const labelClass = "mb-2 block text-sm font-medium text-gray-300";

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />
      <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-yellow-400">YOUR PROFILE</p>
          <h1 className="mt-1 text-3xl font-bold">Build your professional story</h1>
          <p className="mt-2 text-sm text-gray-400">Show your interests, skills and goals to your student network.</p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#1b1b1b]">
          <div className="h-36 bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-[#242424] sm:h-48" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-[#1b1b1b] bg-[#303030] text-yellow-400">
                  {(editing ? draft.photo : profile.photo) ? (
                    <img src={editing ? draft.photo : profile.photo} alt={`${profile.name}'s profile`} className="h-full w-full object-cover" />
                  ) : <GraduationCap size={42} />}
                </div>
                {editing && (
                  <label htmlFor="profile-photo" className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#1b1b1b] bg-yellow-400 text-black" title="Change profile photo">
                    <Camera size={16} />
                    <input id="profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" disabled={photoUploading} />
                  </label>
                )}
              </div>

              {!editing && (
                <button
                  onClick={() => {
                    setDraft(profile);
                    setEditing(true);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-yellow-400 hover:text-yellow-400"
                >
                  <Pencil size={16} />
                  Edit profile
                </button>
              )}
            </div>

            {savedMessage && (
              <p role="status" className="mt-4 text-sm text-yellow-400">
                {savedMessage}
              </p>
            )}
            {photoError && <p role="alert" className="mt-3 text-sm text-red-300">{photoError}</p>}
            {editing && photoUploading && <p role="status" className="mt-3 text-sm text-gray-400">Uploading profile photo to ImageKit… {photoProgress}%</p>}

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
                  <p className="mt-2 text-xs text-gray-500">Add a portfolio, GitHub or LinkedIn profile.</p>
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
                  <p className="mt-1 text-right text-xs text-gray-500">
                    {draft.bio.length}/500
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Skills</label>

                  <div className="flex flex-wrap gap-2">
                    {draft.skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-300"
                      >
                        {skill}
                        <button
                          type="button"
                          aria-label={`Remove ${skill}`}
                          onClick={() => removeSkill(skill)}
                          className="hover:text-white"
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
                      className="rounded-xl bg-yellow-400 px-4 text-black hover:bg-yellow-300"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={photoUploading}
                    className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />
                    Save changes
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={photoUploading}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
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
                <p className="mt-1 text-sm text-gray-400">
                  {profile.headline || "Add a headline to your profile"}
                </p>

                {(profile.university || profile.course || profile.year) && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                    <GraduationCap
                      size={17}
                      className="shrink-0 text-yellow-400"
                    />
                    {[profile.course, profile.year, profile.university]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                {profile.location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={16} />
                    {profile.location}
                  </p>
                )}

                <div className="mt-7 border-t border-white/10 pt-6">
                  <h2 className="font-semibold">About</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                    {profile.bio || "Add a short introduction about yourself."}
                  </p>
                </div>

                <div className="mt-7 border-t border-white/10 pt-6">
                  <h2 className="font-semibold">Skills</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.skills.length ? (
                      profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No skills added yet.
                      </p>
                    )}
                  </div>
                </div>

                {profile.portfolioUrl && (
                  <div className="mt-7 border-t border-white/10 pt-5">
                    <h2 className="font-semibold">Portfolio</h2>
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 break-all text-sm text-yellow-400 hover:text-yellow-300">
                      <ExternalLink size={16} /> {profile.portfolioUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
      </main>
    </div>
  );
}

export default Profile;


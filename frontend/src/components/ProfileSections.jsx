import { ExternalLink, FileText, FolderKanban, GraduationCap, Star } from "lucide-react";
import { Link } from "react-router-dom";

function PostPreview({ post }) {
  if (!post) return null;
  return <Link to={`/post/${post.id}`} className="group flex min-w-0 items-center gap-3 rounded-xl border border-[#e7dfd0] bg-white p-3 transition hover:border-[#c9bcff] hover:bg-[#fbf9ff]">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f4f0e8] text-[#6f56d9]">
      {post.image ? <img src={post.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : post.mediaType === "pdf" ? <FileText size={18} /> : post.mediaUrl ? <span className="text-lg">▶</span> : <FolderKanban size={18} />}
    </span>
    <span className="min-w-0 flex-1"><span className="block line-clamp-2 whitespace-pre-wrap text-sm font-medium leading-5 text-[#343247]">{post.text || post.mediaName || "Shared a post"}</span><span className="mt-1 block text-[11px] text-[#858191]">{post.category || "Feed post"}</span></span>
    <ExternalLink size={14} className="shrink-0 text-[#858191] transition group-hover:text-[#6f56d9]" />
  </Link>;
}

function ProjectCard({ project, postsById }) {
  const relatedPosts = (project.relatedPostIds || []).map((id) => postsById.get(id)).filter(Boolean);
  return <article className="group overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#fffdf9] shadow-[2px_3px_0_#e7dfd0] transition hover:-translate-y-0.5 hover:shadow-[3px_5px_0_#c9bcff]">
    <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-[#eee9ff] via-[#fff3b7] to-[#dff6ff]">
      {project.mediaUrl ? project.mediaType === "video" ? <video src={project.mediaUrl} controls preload="metadata" playsInline className="h-full w-full bg-[#191a32] object-contain" /> : <img src={project.mediaUrl} alt={`${project.title} project`} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="text-center text-[#6f56d9]"><FolderKanban size={30} className="mx-auto" /><span className="mt-2 block text-xs font-semibold">Project showcase</span></div>}
      <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5947a8]">{project.mediaType === "video" ? "Demo video" : project.mediaUrl ? "Project image" : "Project"}</span>
    </div>
    <div className="p-4 sm:p-5"><h3 className="text-base font-bold tracking-tight">{project.title}</h3>{project.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#6e6a7b]">{project.description}</p>}
      {project.url && <a href={project.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#d9d0ff] bg-[#f4f0ff] px-3 py-2 text-sm font-semibold text-[#5947a8] transition hover:bg-[#eee9ff]">Visit project <ExternalLink size={14} /></a>}
      {relatedPosts.length > 0 && <div className="mt-5 border-t border-[#e7dfd0] pt-4"><div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-bold uppercase tracking-wide text-[#858191]">Related updates</h4><span className="rounded-full bg-[#f4f0e8] px-2 py-0.5 text-[10px] text-[#6e6a7b]">{relatedPosts.length}</span></div><div className="space-y-2">{relatedPosts.map((post) => <PostPreview key={post.id} post={post} />)}</div></div>}
    </div>
  </article>;
}

function ProfileSections({ profile, posts = [] }) {
  const projects = profile.projects || [];
  const education = profile.education || [];
  const featured = profile.featured || [];
  const postsById = new Map(posts.map((post) => [String(post.id), post]));
  const projectsByKey = new Map(projects.map((project) => [String(project.key || project._id), project]));
  const hasFeatured = featured.some((item) => (item.type || (item.url ? "link" : "project")) === "link" || (item.type === "post" && postsById.has(String(item.postId))) || ((item.type || "project") === "project" && projectsByKey.has(String(item.projectKey))));

  return <div className="mt-6 space-y-5">
    {hasFeatured && <section className="rounded-[22px] border-2 border-[#191a32] bg-white p-5 shadow-[3px_4px_0_#ffe35b]">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Star size={19} className="text-[#6f56d9]" /> Featured</h2>
      <p className="mt-1 text-xs text-[#858191]">Selected work and updates</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{featured.map((item, index) => {
        const type = item.type || (item.url ? "link" : "project");
        if (type === "project") {
          const project = projectsByKey.get(String(item.projectKey));
          return project ? <ProjectCard key={`featured-${index}`} project={project} postsById={postsById} /> : null;
        }
        if (type === "post") {
          const post = postsById.get(String(item.postId));
          return post ? <PostPreview key={`featured-${index}`} post={post} /> : null;
        }
        return <article key={`featured-${index}`} className="rounded-2xl border-2 border-[#191a32] bg-[#fffdf9] p-4 shadow-[2px_3px_0_#c9bcff]"><h3 className="font-semibold">{item.title}</h3>{item.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#6e6a7b]">{item.description}</p>}<a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#6f56d9] hover:text-[#5947a8]">Open link <ExternalLink size={14} /></a></article>;
      })}</div>
    </section>}

    {projects.length > 0 && <section className="rounded-[22px] border-2 border-[#191a32] bg-white p-5 shadow-[3px_4px_0_#c9bcff]">
      <h2 className="flex items-center gap-2 text-lg font-bold"><FolderKanban size={19} className="text-[#6f56d9]" /> Projects</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{projects.map((project, index) => <ProjectCard key={project.key || project._id || `${project.title}-${index}`} project={project} postsById={postsById} />)}</div>
    </section>}

    {education.length > 0 && <section className="rounded-[22px] border-2 border-[#191a32] bg-white p-5 shadow-[3px_4px_0_#87d4f4]">
      <h2 className="flex items-center gap-2 text-lg font-bold"><GraduationCap size={20} className="text-[#6f56d9]" /> Education</h2>
      <div className="mt-4 space-y-3">{education.map((entry, index) => <article key={`${entry.school}-${index}`} className="rounded-2xl border-2 border-[#191a32] bg-[#fffdf9] p-4">
        <h3 className="font-semibold">{entry.school}</h3>
        {(entry.degree || entry.field) && <p className="mt-1 text-sm text-[#514e62]">{[entry.degree, entry.field].filter(Boolean).join(" · ")}</p>}
        {(entry.startYear || entry.endYear) && <p className="mt-1 text-xs text-[#858191]">{[entry.startYear, entry.endYear].filter(Boolean).join(" — ")}</p>}
        {entry.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6e6a7b]">{entry.description}</p>}
      </article>)}</div>
    </section>}
  </div>;
}

export default ProfileSections;

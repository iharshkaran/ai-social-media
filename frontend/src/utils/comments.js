const DUPLICATE_WINDOW_MS = 5_000;

export function removeRapidDuplicateComments(comments = []) {
  const visible = [];

  for (const comment of comments) {
    const createdAt = Date.parse(comment.createdAt || "");
    const isRapidDuplicate = visible.some((previous) => {
      const previousCreatedAt = Date.parse(previous.createdAt || "");
      return previous.name === comment.name
        && previous.text.trim() === comment.text.trim()
        && Number.isFinite(createdAt)
        && Number.isFinite(previousCreatedAt)
        && Math.abs(createdAt - previousCreatedAt) <= DUPLICATE_WINDOW_MS;
    });

    if (!isRapidDuplicate) visible.push(comment);
  }

  return visible;
}

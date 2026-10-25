import { ZodError } from "zod";

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} was not found.` });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: error.issues.map((issue) => issue.message).join(" "),
      errors: error.issues.map(({ path, message }) => ({ field: path.join("."), message })),
    });
  }
  if (error?.code === 11000) return res.status(409).json({ success: false, message: "This record already exists." });
  if (error?.name === "CastError") return res.status(400).json({ success: false, message: "Invalid id." });
  const status = error.status || 500;
  if (status >= 500) console.error(error.message);
  return res.status(status).json({ success: false, message: status >= 500 ? "Something went wrong. Please try again." : error.message });
}

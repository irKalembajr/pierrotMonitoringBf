export function checkToken(req: Request) {
  const header = req.headers.get("authorization");
  const token = process.env.SHARED_SECRET;
  if (!token) return true; // if not set, allow (dev)
  if (!header) return false;
  // Accept formats: "Bearer TOKEN" or raw TOKEN
  const raw = header.startsWith("Bearer ") ? header.slice(7) : header;
  return raw === token;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sanitize free-text input before embedding it in a PostgREST `.or()` ilike
// filter. Removes characters that break the surrounding double-quoted value
// (`"` and `\`) and neutralizes LIKE wildcards (`%`, `_`) so a search term
// containing a comma/parenthesis/quote can't break the query or inject extra
// filter conditions. Wrap the result in double quotes at the call site, e.g.
// `name.ilike."%${escapeForOrIlike(term)}%"`.
export function escapeForOrIlike(term: string): string {
  return term.replace(/[\\"%_]/g, " ").trim();
}

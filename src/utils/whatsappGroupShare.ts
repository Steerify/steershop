/**
 * Share helpers for posting Marketing Concierge content to the SteerSolo
 * WhatsApp marketplace group with a single tap.
 *
 * Mobile: uses the Web Share API to attach the post image + caption straight
 *         into WhatsApp's recipient picker (the user just chooses the group).
 * Desktop: copies the caption, downloads the image, and opens the group
 *          invite in a new tab.
 */

export const STEERSOLO_GROUP_INVITE =
  "https://chat.whatsapp.com/C9owGcbmv03EWG65ehYQD5";

async function fetchImageAsFile(imageUrl: string): Promise<File | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] || "jpg";
    return new File([blob], `steersolo-promo.${ext}`, { type: blob.type });
  } catch (err) {
    console.warn("[concierge] image fetch failed:", err);
    return null;
  }
}

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export interface ShareToGroupInput {
  caption: string;
  imageUrl?: string | null;
}

export interface ShareToGroupResult {
  method: "web-share" | "download-and-open" | "open-only";
  imageCopied: boolean;
  textCopied: boolean;
}

export async function shareToSteersoloGroup(
  input: ShareToGroupInput
): Promise<ShareToGroupResult> {
  const { caption, imageUrl } = input;

  // Mobile: try Web Share API with the image attached
  if (isMobile() && typeof navigator.share === "function") {
    const file = imageUrl ? await fetchImageAsFile(imageUrl) : null;

    if (file && (navigator as any).canShare?.({ files: [file] })) {
      try {
        await navigator.share({ text: caption, files: [file] });
        return { method: "web-share", imageCopied: true, textCopied: true };
      } catch (err) {
        // user cancelled or share blocked — fall through to fallback
        console.warn("[concierge] navigator.share failed:", err);
      }
    } else if (!file) {
      try {
        await navigator.share({ text: caption });
        // user picks group, but they'll still need to open invite link separately
        window.open(STEERSOLO_GROUP_INVITE, "_blank", "noopener");
        return { method: "web-share", imageCopied: false, textCopied: true };
      } catch {
        // fall through
      }
    }
  }

  // Desktop / fallback: copy text, download image, open the group invite
  const textCopied = await copyText(caption);
  let imageCopied = false;

  if (imageUrl) {
    const file = await fetchImageAsFile(imageUrl);
    if (file) {
      downloadFile(file);
      imageCopied = true;
    }
  }

  window.open(STEERSOLO_GROUP_INVITE, "_blank", "noopener");

  return {
    method: imageUrl ? "download-and-open" : "open-only",
    imageCopied,
    textCopied,
  };
}

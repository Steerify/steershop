import type { CanvasElement, CanvasSize } from "@/components/marketing/CanvasEditor";

interface CanvasData {
  elements: CanvasElement[];
  background: string;
  canvasSize?: CanvasSize;
}

/**
 * Transforms template data from either the database format or the editor format
 * into the CanvasEditor-compatible format. Handles:
 * - Center-based → top-left coordinate conversion
 * - Placeholder substitution ({{shop_name}}, etc.)
 * - Filtering unsupported element types (qrcode, shape)
 * - fontWeight → fontFamily mapping
 * - canvas wrapper extraction
 */
export const transformTemplateData = (raw: any, shopName: string): CanvasData => {
  if (!raw) {
    return getDefaultStarterContent(shopName);
  }

  // Already in correct format (has root-level background + properly sized elements)
  if (
    raw.background &&
    Array.isArray(raw.elements) &&
    raw.elements.length > 0 &&
    raw.elements[0]?.width != null &&
    !raw.canvas
  ) {
    // Still do placeholder substitution
    return {
      ...raw,
      elements: raw.elements.map((el: any) => ({
        ...el,
        content: substituteVars(el.content, shopName),
      })),
    };
  }

  // Transform from DB format (has canvas wrapper)
  const canvas = raw.canvas || {};
  const background = canvas.backgroundColor || raw.background || "#ffffff";
  const canvasSize: CanvasSize = {
    width: canvas.width || 1080,
    height: canvas.height || 1080,
    label: matchSizeLabel(canvas.width || 1080, canvas.height || 1080),
  };

  const elements: CanvasElement[] = (raw.elements || [])
    .filter((el: any) => el.type === "text" || el.type === "image")
    .map((el: any) => {
      const w = el.width || 400;
      const h = el.height || (el.fontSize || 24) * 1.5;
      return {
        id: el.id || `el-${Math.random().toString(36).slice(2, 8)}`,
        type: el.type as "text" | "image",
        content: substituteVars(el.content || "", shopName),
        x: el.x != null ? Math.max(0, el.x - w / 2) : 50,
        y: el.y != null ? Math.max(0, el.y - h / 2) : 50,
        width: w,
        height: h,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily || (el.fontWeight === "bold" ? "Montserrat" : "Inter"),
        color: el.color,
        backgroundColor: el.backgroundColor,
      };
    });

  return { elements, background, canvasSize };
};

const substituteVars = (text: string, shopName: string): string => {
  if (!text) return text;
  return text
    .replace(/\{\{shop_name\}\}/gi, shopName)
    .replace(/\{\{discount\}\}/gi, "20%")
    .replace(/\{\{code\}\}/gi, "PROMO20")
    .replace(/\{\{price\}\}/gi, "₦5,000");
};

const matchSizeLabel = (w: number, h: number): string => {
  if (w === 1080 && h === 1080) return "Instagram Post";
  if (w === 1080 && h === 1920) return "Instagram Story / WhatsApp Status";
  if (w === 1200 && h === 630) return "Facebook Post";
  if (w === 800 && h === 400) return "Twitter / X Post";
  return "Custom Square";
};

export const getDefaultStarterContent = (shopName: string): CanvasData => ({
  elements: [
    {
      id: "title",
      type: "text",
      content: shopName,
      x: 80,
      y: 350,
      width: 920,
      height: 100,
      fontSize: 64,
      fontFamily: "Montserrat",
      color: "#1e293b",
    },
    {
      id: "subtitle",
      type: "text",
      content: "Add your message here",
      x: 80,
      y: 480,
      width: 920,
      height: 50,
      fontSize: 28,
      fontFamily: "Inter",
      color: "#64748b",
    },
    {
      id: "cta",
      type: "text",
      content: "ORDER NOW →",
      x: 80,
      y: 600,
      width: 300,
      height: 60,
      fontSize: 22,
      fontFamily: "Inter",
      color: "#ffffff",
      backgroundColor: "#3b82f6",
    },
  ],
  background: "#f8fafc",
  canvasSize: { width: 1080, height: 1080, label: "Instagram Post" },
});

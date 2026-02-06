import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type, ImageIcon, Palette, Layout, Trash2, Move, Upload, ChevronUp, ChevronDown } from "lucide-react";

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
}

export interface CanvasSize {
  width: number;
  height: number;
  label: string;
}

interface CanvasEditorProps {
  initialData?: { elements: CanvasElement[]; background: string; canvasSize?: CanvasSize };
  onChange?: (data: { elements: CanvasElement[]; background: string; canvasSize?: CanvasSize }) => void;
  onSave: (data: { elements: CanvasElement[]; background: string; canvasSize?: CanvasSize }) => void;
  shopName: string;
  shopLogo?: string;
}

const fonts = [
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Poppins", label: "Poppins" },
  { value: "Oswald", label: "Oswald" },
];

const colorPresets = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
  "#1e293b", "#f1f5f9", "#dc2626", "#059669", "#7c3aed",
];

const sizePresets: CanvasSize[] = [
  { width: 1080, height: 1080, label: "Instagram Post" },
  { width: 1080, height: 1920, label: "Instagram Story / WhatsApp Status" },
  { width: 1200, height: 630, label: "Facebook Post" },
  { width: 800, height: 400, label: "Twitter / X Post" },
  { width: 400, height: 400, label: "Custom Square" },
];

const layouts = [
  { id: "hero", name: "Hero Banner", preview: "Large title + CTA button" },
  { id: "product", name: "Product Showcase", preview: "Product name + price" },
  { id: "minimal", name: "Minimal", preview: "Clean & simple" },
  { id: "bold", name: "Bold Sale", preview: "Big text impact" },
  { id: "flash-sale", name: "⚡ Flash Sale", preview: "Urgency + countdown style" },
  { id: "new-arrival", name: "🆕 New Arrival", preview: "Fresh product announcement" },
  { id: "whatsapp-promo", name: "📱 WhatsApp Promo", preview: "Status-optimized design" },
  { id: "ig-story", name: "📸 Instagram Story", preview: "Story-optimized vertical" },
];

export const CanvasEditor = ({ initialData, onChange, onSave, shopName, shopLogo }: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>(initialData?.elements || []);
  const [background, setBackground] = useState(initialData?.background || "#ffffff");
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(initialData?.canvasSize || sizePresets[0]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Responsive screen width
  useEffect(() => {
    const handler = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const MAX_DISPLAY = screenWidth < 640 ? Math.min(screenWidth - 32, 360) : 420;
  const scale = Math.min(MAX_DISPLAY / canvasSize.width, MAX_DISPLAY / canvasSize.height);
  const displayW = canvasSize.width * scale;
  const displayH = canvasSize.height * scale;

  const fireChange = useCallback((els: CanvasElement[], bg: string, size?: CanvasSize) => {
    onChange?.({ elements: els, background: bg, canvasSize: size || canvasSize });
  }, [onChange, canvasSize]);

  const selectedEl = elements.find((el) => el.id === selectedElement);

  const addTextElement = () => {
    const newEl: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Your text here",
      x: 50, y: 50, width: 300, height: 50,
      fontSize: 32, fontFamily: "Inter", color: "#000000",
    };
    const updated = [...elements, newEl];
    setElements(updated);
    setSelectedElement(newEl.id);
    fireChange(updated, background);
  };

  const addImageElement = (url: string) => {
    const newEl: CanvasElement = {
      id: `img-${Date.now()}`,
      type: "image",
      content: url,
      x: 50, y: 50, width: 250, height: 250,
    };
    const updated = [...elements, newEl];
    setElements(updated);
    setSelectedElement(newEl.id);
    fireChange(updated, background);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        addImageElement(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updated = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    setElements(updated);
    fireChange(updated, background);
  };

  const deleteElement = (id: string) => {
    const updated = elements.filter((el) => el.id !== id);
    setElements(updated);
    setSelectedElement(null);
    fireChange(updated, background);
  };

  const updateBackground = (bg: string) => {
    setBackground(bg);
    fireChange(elements, bg);
  };

  const changeCanvasSize = (label: string) => {
    const preset = sizePresets.find(s => s.label === label);
    if (preset) {
      setCanvasSize(preset);
      fireChange(elements, background, preset);
    }
  };

  const handleExport = () => {
    onSave({ elements, background, canvasSize });
  };

  // Shared drag logic
  const startDrag = (clientX: number, clientY: number, elId: string) => {
    const el = elements.find(x => x.id === elId);
    if (!el || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (clientX - rect.left) / scale;
    const mouseY = (clientY - rect.top) / scale;
    setDragging({ id: elId, offsetX: mouseX - el.x, offsetY: mouseY - el.y });
    setSelectedElement(elId);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (clientX - rect.left) / scale;
    const mouseY = (clientY - rect.top) / scale;
    updateElement(dragging.id, {
      x: Math.max(0, mouseX - dragging.offsetX),
      y: Math.max(0, mouseY - dragging.offsetY),
    });
  };

  const endDrag = () => setDragging(null);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent, elId: string) => {
    e.stopPropagation();
    startDrag(e.clientX, e.clientY, elId);
  };
  const handleMouseMove = (e: React.MouseEvent) => moveDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent, elId: string) => {
    e.stopPropagation();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, elId);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // prevent scroll while dragging
    const touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => endDrag();

  const applyLayout = (layoutId: string) => {
    let newElements: CanvasElement[] = [];
    let newBg = background;
    let newSize = canvasSize;

    switch (layoutId) {
      case "hero":
        newElements = [
          { id: "title", type: "text", content: shopName, x: 60, y: 200, width: 500, height: 80, fontSize: 64, fontFamily: "Playfair Display", color: "#000000" },
          { id: "subtitle", type: "text", content: "Your tagline here", x: 60, y: 300, width: 400, height: 40, fontSize: 24, fontFamily: "Inter", color: "#666666" },
          { id: "cta", type: "text", content: "SHOP NOW", x: 60, y: 400, width: 200, height: 60, fontSize: 20, fontFamily: "Inter", color: "#ffffff", backgroundColor: "#000000" },
        ];
        break;
      case "product":
        newElements = [
          { id: "product-name", type: "text", content: "Product Name", x: 60, y: 600, width: 400, height: 50, fontSize: 36, fontFamily: "Montserrat", color: "#000000" },
          { id: "price", type: "text", content: "₦5,000", x: 60, y: 670, width: 200, height: 50, fontSize: 42, fontFamily: "Inter", color: "#22c55e" },
          { id: "shop", type: "text", content: shopName, x: 60, y: 740, width: 300, height: 30, fontSize: 16, fontFamily: "Inter", color: "#999999" },
        ];
        break;
      case "minimal":
        newElements = [
          { id: "main-text", type: "text", content: shopName, x: 200, y: 450, width: 600, height: 80, fontSize: 48, fontFamily: "Inter", color: "#000000" },
        ];
        newBg = "#f5f5f5";
        break;
      case "bold":
        newElements = [
          { id: "big-text", type: "text", content: "SALE", x: 40, y: 200, width: 1000, height: 200, fontSize: 160, fontFamily: "Montserrat", color: "#ffffff" },
          { id: "percent", type: "text", content: "50% OFF", x: 40, y: 450, width: 500, height: 80, fontSize: 64, fontFamily: "Inter", color: "#eab308" },
          { id: "shop", type: "text", content: shopName, x: 40, y: 580, width: 400, height: 40, fontSize: 24, fontFamily: "Inter", color: "#888888" },
        ];
        newBg = "#000000";
        break;
      case "flash-sale":
        newElements = [
          { id: "flash", type: "text", content: "⚡ FLASH SALE ⚡", x: 100, y: 150, width: 880, height: 120, fontSize: 72, fontFamily: "Oswald", color: "#ffffff" },
          { id: "time", type: "text", content: "24 HOURS ONLY", x: 200, y: 300, width: 680, height: 60, fontSize: 36, fontFamily: "Inter", color: "#fbbf24" },
          { id: "discount", type: "text", content: "UP TO 70% OFF", x: 150, y: 420, width: 780, height: 100, fontSize: 64, fontFamily: "Montserrat", color: "#ffffff" },
          { id: "cta", type: "text", content: "SHOP NOW →", x: 300, y: 600, width: 400, height: 70, fontSize: 28, fontFamily: "Inter", color: "#000000", backgroundColor: "#fbbf24" },
        ];
        newBg = "#dc2626";
        break;
      case "new-arrival":
        newElements = [
          { id: "badge", type: "text", content: "NEW ARRIVAL", x: 60, y: 100, width: 280, height: 50, fontSize: 20, fontFamily: "Inter", color: "#ffffff", backgroundColor: "#059669" },
          { id: "product", type: "text", content: "Product Name", x: 60, y: 500, width: 500, height: 60, fontSize: 42, fontFamily: "Playfair Display", color: "#1e293b" },
          { id: "desc", type: "text", content: "Discover our latest addition", x: 60, y: 580, width: 500, height: 40, fontSize: 20, fontFamily: "Inter", color: "#64748b" },
          { id: "price", type: "text", content: "₦15,000", x: 60, y: 650, width: 250, height: 50, fontSize: 36, fontFamily: "Inter", color: "#059669" },
        ];
        newBg = "#f8fafc";
        break;
      case "whatsapp-promo":
        newSize = sizePresets[1];
        newElements = [
          { id: "shop", type: "text", content: shopName, x: 80, y: 200, width: 920, height: 80, fontSize: 48, fontFamily: "Montserrat", color: "#ffffff" },
          { id: "offer", type: "text", content: "Special Offer!", x: 80, y: 600, width: 920, height: 120, fontSize: 80, fontFamily: "Oswald", color: "#ffffff" },
          { id: "details", type: "text", content: "Order on WhatsApp today", x: 80, y: 800, width: 920, height: 50, fontSize: 28, fontFamily: "Inter", color: "#bbf7d0" },
          { id: "cta", type: "text", content: "TAP TO ORDER 📲", x: 200, y: 1100, width: 680, height: 80, fontSize: 32, fontFamily: "Inter", color: "#065f46", backgroundColor: "#34d399" },
        ];
        newBg = "#065f46";
        break;
      case "ig-story":
        newSize = sizePresets[1];
        newElements = [
          { id: "top", type: "text", content: shopName.toUpperCase(), x: 80, y: 150, width: 920, height: 50, fontSize: 24, fontFamily: "Inter", color: "#a855f7" },
          { id: "main", type: "text", content: "Don't Miss Out!", x: 80, y: 600, width: 920, height: 120, fontSize: 72, fontFamily: "Playfair Display", color: "#1e1b4b" },
          { id: "sub", type: "text", content: "Swipe up to shop now", x: 80, y: 780, width: 920, height: 40, fontSize: 22, fontFamily: "Inter", color: "#6b21a8" },
          { id: "arrow", type: "text", content: "↑ SWIPE UP", x: 350, y: 1500, width: 380, height: 60, fontSize: 28, fontFamily: "Inter", color: "#ffffff", backgroundColor: "#7c3aed" },
        ];
        newBg = "#faf5ff";
        break;
    }

    setElements(newElements);
    setBackground(newBg);
    setCanvasSize(newSize);
    setSelectedElement(null);
    fireChange(newElements, newBg, newSize);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Canvas Area */}
      <div
        className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-2 sm:p-4 overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={canvasRef}
          className="relative shadow-2xl select-none touch-none"
          style={{ width: displayW, height: displayH, backgroundColor: background, background: background }}
          onClick={() => setSelectedElement(null)}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              className={`absolute cursor-move ${selectedElement === el.id ? "ring-2 ring-primary ring-offset-1" : "hover:ring-1 hover:ring-primary/40"}`}
              style={{
                left: el.x * scale,
                top: el.y * scale,
                width: el.width * scale,
                height: el.height * scale,
                fontSize: (el.fontSize || 24) * scale,
                fontFamily: el.fontFamily,
                color: el.color,
                backgroundColor: el.backgroundColor,
                padding: el.backgroundColor ? `${4 * scale}px ${8 * scale}px` : 0,
                borderRadius: el.backgroundColor ? `${4 * scale}px` : 0,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                lineHeight: 1.2,
              }}
              onMouseDown={(e) => handleMouseDown(e, el.id)}
              onTouchStart={(e) => handleTouchStart(e, el.id)}
              onClick={(e) => { e.stopPropagation(); setSelectedElement(el.id); }}
            >
              {el.type === "image" ? (
                <img src={el.content} alt="" className="w-full h-full object-cover" draggable={false} />
              ) : (
                el.content
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tools Panel - collapsible on mobile */}
      <div className="w-full lg:w-72 bg-card rounded-lg border overflow-hidden">
        {/* Mobile toggle header */}
        <button
          className="w-full flex items-center justify-between p-3 lg:hidden border-b"
          onClick={() => setToolsExpanded(!toolsExpanded)}
        >
          <span className="font-medium text-sm">Tools & Settings</span>
          {toolsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        <div className={`p-4 space-y-4 overflow-y-auto max-h-[400px] lg:max-h-none ${toolsExpanded ? 'block' : 'hidden lg:block'}`}>
          {/* Canvas Size Selector */}
          <div>
            <Label className="text-xs font-medium">Canvas Size</Label>
            <Select value={canvasSize.label} onValueChange={changeCanvasSize}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizePresets.map((s) => (
                  <SelectItem key={s.label} value={s.label}>
                    {s.label} ({s.width}×{s.height})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="text" className="px-2"><Type className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="layout" className="px-2"><Layout className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="colors" className="px-2"><Palette className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="image" className="px-2"><ImageIcon className="w-4 h-4" /></TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-4">
              <Button onClick={addTextElement} className="w-full" variant="outline">
                <Type className="w-4 h-4 mr-2" />
                Add Text
              </Button>

              {selectedEl && selectedEl.type === "text" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Text Content</Label>
                    <Input value={selectedEl.content} onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Font</Label>
                    <Select value={selectedEl.fontFamily} onValueChange={(v) => updateElement(selectedEl.id, { fontFamily: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Font Size: {selectedEl.fontSize}px</Label>
                    <Slider value={[selectedEl.fontSize || 24]} min={12} max={200} step={2} onValueChange={([v]) => updateElement(selectedEl.id, { fontSize: v })} />
                  </div>
                  <div>
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {colorPresets.map((color) => (
                        <button key={color} className={`w-6 h-6 rounded border ${selectedEl.color === color ? "ring-2 ring-primary" : ""}`} style={{ backgroundColor: color }} onClick={() => updateElement(selectedEl.id, { color })} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Background Color</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <button className={`w-6 h-6 rounded border text-[8px] ${!selectedEl.backgroundColor ? "ring-2 ring-primary" : ""}`} onClick={() => updateElement(selectedEl.id, { backgroundColor: undefined })}>✕</button>
                      {colorPresets.map((color) => (
                        <button key={color} className={`w-6 h-6 rounded border ${selectedEl.backgroundColor === color ? "ring-2 ring-primary" : ""}`} style={{ backgroundColor: color }} onClick={() => updateElement(selectedEl.id, { backgroundColor: color })} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Slider value={[selectedEl.width]} min={50} max={canvasSize.width} step={10} onValueChange={([v]) => updateElement(selectedEl.id, { width: v })} />
                  </div>
                </div>
              )}

              {selectedEl && selectedEl.type === "image" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Slider value={[selectedEl.width]} min={50} max={canvasSize.width} step={10} onValueChange={([v]) => updateElement(selectedEl.id, { width: v })} />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Slider value={[selectedEl.height]} min={50} max={canvasSize.height} step={10} onValueChange={([v]) => updateElement(selectedEl.id, { height: v })} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="layout" className="space-y-3 mt-4">
              <p className="text-xs text-muted-foreground">Quick start with a layout:</p>
              {layouts.map((layout) => (
                <Button key={layout.id} variant="outline" className="w-full justify-start h-auto py-2" onClick={() => applyLayout(layout.id)}>
                  <div className="text-left">
                    <p className="font-medium">{layout.name}</p>
                    <p className="text-xs text-muted-foreground">{layout.preview}</p>
                  </div>
                </Button>
              ))}
            </TabsContent>

            <TabsContent value="colors" className="space-y-3 mt-4">
              <div>
                <Label className="text-xs">Background Color</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {colorPresets.map((color) => (
                    <button key={color} className={`w-6 h-6 rounded border ${background === color ? "ring-2 ring-primary" : ""}`} style={{ backgroundColor: color }} onClick={() => updateBackground(color)} />
                  ))}
                </div>
                <Input type="color" value={background.startsWith('#') ? background : '#ffffff'} onChange={(e) => updateBackground(e.target.value)} className="w-full h-8 mt-2" />
              </div>

              <div>
                <Label className="text-xs">Gradient Backgrounds</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {[
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
                  ].map((grad) => (
                    <button key={grad} className={`w-full h-8 rounded border ${background === grad ? "ring-2 ring-primary" : ""}`} style={{ background: grad }} onClick={() => updateBackground(grad)} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-3 mt-4">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <p className="text-xs text-muted-foreground">
                Upload product photos or logos to add to your poster. Supported: JPG, PNG, WebP.
              </p>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Tips:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Use high-quality product photos</li>
                  <li>Drag elements to reposition them</li>
                  <li>Adjust size with the sliders</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Delete Button */}
          {selectedElement && (
            <Button onClick={() => deleteElement(selectedElement)} variant="destructive" size="sm" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Element
            </Button>
          )}

          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Move className="w-3 h-3" />
              <span>Drag elements to reposition</span>
            </div>
            <Button onClick={handleExport} className="w-full">
              Save Poster
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export utility: renders canvas elements to a real canvas and returns a Blob
export const exportCanvasToBlob = async (
  elements: CanvasElement[],
  background: string,
  canvasSize: CanvasSize,
  format: "png" | "jpg" = "png"
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  const ctx = canvas.getContext("2d")!;

  // Draw background
  if (background.startsWith("linear-gradient") || background.startsWith("#")) {
    if (background.startsWith("linear-gradient")) {
      const colors = background.match(/#[a-f0-9]{6}/gi) || ["#ffffff", "#ffffff"];
      const gradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1] || colors[0]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = background;
    }
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }

  // Draw elements in order
  for (const el of elements) {
    if (el.type === "text") {
      if (el.backgroundColor) {
        ctx.fillStyle = el.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, 4);
        ctx.fill();
      }
      ctx.fillStyle = el.color || "#000";
      const weight = el.fontFamily === "Oswald" || el.fontFamily === "Montserrat" ? "bold " : "";
      ctx.font = `${weight}${el.fontSize || 24}px ${el.fontFamily || "Inter"}, sans-serif`;
      ctx.textBaseline = "middle";
      const textX = el.x + (el.backgroundColor ? 16 : 0);
      const textY = el.y + el.height / 2;
      ctx.fillText(el.content, textX, textY, el.width - (el.backgroundColor ? 32 : 0));
    } else if (el.type === "image" && el.content) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = el.content;
        });
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
      } catch {
        // Skip failed images
      }
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      format === "jpg" ? "image/jpeg" : "image/png",
      0.95
    );
  });
};

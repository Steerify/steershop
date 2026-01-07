import { useState, useRef } from "react";
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
import { Type, Image, Palette, Layout, Download, Undo, Redo } from "lucide-react";

interface CanvasElement {
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

interface CanvasEditorProps {
  initialData?: { elements: CanvasElement[]; background: string };
  onSave: (data: { elements: CanvasElement[]; background: string }) => void;
  shopName: string;
}

const fonts = [
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
];

const colorPresets = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

const layouts = [
  { id: "hero", name: "Hero", preview: "Large title + CTA" },
  { id: "product", name: "Product", preview: "Image + details" },
  { id: "minimal", name: "Minimal", preview: "Clean & simple" },
  { id: "bold", name: "Bold", preview: "Big text impact" },
];

export const CanvasEditor = ({ initialData, onSave, shopName }: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>(initialData?.elements || []);
  const [background, setBackground] = useState(initialData?.background || "#ffffff");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");

  const selectedEl = elements.find((el) => el.id === selectedElement);

  const addTextElement = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Your text here",
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      fontSize: 24,
      fontFamily: "Inter",
      color: "#000000",
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const handleExport = () => {
    onSave({ elements, background });
  };

  const applyLayout = (layoutId: string) => {
    let newElements: CanvasElement[] = [];

    switch (layoutId) {
      case "hero":
        newElements = [
          {
            id: "title",
            type: "text",
            content: shopName,
            x: 40,
            y: 120,
            width: 320,
            height: 60,
            fontSize: 48,
            fontFamily: "Playfair Display",
            color: "#000000",
          },
          {
            id: "subtitle",
            type: "text",
            content: "Your tagline here",
            x: 40,
            y: 190,
            width: 320,
            height: 30,
            fontSize: 18,
            fontFamily: "Inter",
            color: "#666666",
          },
          {
            id: "cta",
            type: "text",
            content: "SHOP NOW",
            x: 40,
            y: 280,
            width: 120,
            height: 40,
            fontSize: 14,
            fontFamily: "Inter",
            color: "#ffffff",
            backgroundColor: "#000000",
          },
        ];
        break;
      case "product":
        newElements = [
          {
            id: "product-name",
            type: "text",
            content: "Product Name",
            x: 40,
            y: 300,
            width: 200,
            height: 30,
            fontSize: 24,
            fontFamily: "Montserrat",
            color: "#000000",
          },
          {
            id: "price",
            type: "text",
            content: "₦5,000",
            x: 40,
            y: 340,
            width: 100,
            height: 30,
            fontSize: 28,
            fontFamily: "Inter",
            color: "#22c55e",
          },
        ];
        break;
      case "minimal":
        newElements = [
          {
            id: "main-text",
            type: "text",
            content: shopName,
            x: 100,
            y: 200,
            width: 200,
            height: 50,
            fontSize: 32,
            fontFamily: "Inter",
            color: "#000000",
          },
        ];
        setBackground("#f5f5f5");
        break;
      case "bold":
        newElements = [
          {
            id: "big-text",
            type: "text",
            content: "SALE",
            x: 20,
            y: 100,
            width: 360,
            height: 120,
            fontSize: 96,
            fontFamily: "Montserrat",
            color: "#ffffff",
          },
          {
            id: "percent",
            type: "text",
            content: "50% OFF",
            x: 20,
            y: 240,
            width: 200,
            height: 40,
            fontSize: 36,
            fontFamily: "Inter",
            color: "#eab308",
          },
        ];
        setBackground("#000000");
        break;
    }

    setElements(newElements);
    setSelectedElement(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4 overflow-auto">
        <div
          ref={canvasRef}
          className="relative shadow-2xl"
          style={{
            width: 400,
            height: 500,
            backgroundColor: background,
          }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              className={`absolute cursor-move ${
                selectedElement === el.id ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                fontSize: el.fontSize,
                fontFamily: el.fontFamily,
                color: el.color,
                backgroundColor: el.backgroundColor,
                padding: el.backgroundColor ? "8px 16px" : 0,
                borderRadius: el.backgroundColor ? "4px" : 0,
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => setSelectedElement(el.id)}
            >
              {el.content}
            </div>
          ))}
        </div>
      </div>

      {/* Tools Panel */}
      <div className="w-full lg:w-72 bg-card rounded-lg border p-4 space-y-4 overflow-y-auto max-h-[500px] lg:max-h-none">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="text" className="px-2">
              <Type className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="layout" className="px-2">
              <Layout className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="colors" className="px-2">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="image" className="px-2">
              <Image className="w-4 h-4" />
            </TabsTrigger>
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
                  <Input
                    value={selectedEl.content}
                    onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Font</Label>
                  <Select
                    value={selectedEl.fontFamily}
                    onValueChange={(v) => updateElement(selectedEl.id, { fontFamily: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Font Size: {selectedEl.fontSize}px</Label>
                  <Slider
                    value={[selectedEl.fontSize || 24]}
                    min={12}
                    max={120}
                    step={2}
                    onValueChange={([v]) => updateElement(selectedEl.id, { fontSize: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border ${
                          selectedEl.color === color ? "ring-2 ring-primary" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateElement(selectedEl.id, { color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="layout" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">Quick start with a layout:</p>
            {layouts.map((layout) => (
              <Button
                key={layout.id}
                variant="outline"
                className="w-full justify-start h-auto py-2"
                onClick={() => applyLayout(layout.id)}
              >
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
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border ${
                      background === color ? "ring-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackground(color)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full h-8 mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">
              Image support coming soon! For now, use text elements to create your poster.
            </p>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t space-y-2">
          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Save Poster
          </Button>
        </div>
      </div>
    </div>
  );
};

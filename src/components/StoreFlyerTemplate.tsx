import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Printer, FileText, Plus, Trash2, Move, Type, Image, Layout, Palette, 
  ShoppingCart, Download, ZoomIn, ZoomOut, RotateCw, FlipHorizontal, 
  FlipVertical, Layers, AlignLeft, AlignCenter, AlignRight, Bold, 
  Italic, Underline, Grid3X3, MousePointer, Minus, Copy, Paste
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState, useRef, useEffect } from "react";

interface StoreFlyerTemplateProps {
  shop: {
    shop_name: string;
    shop_slug: string;
    description?: string;
    logo_url?: string;
    whatsapp_number: string;
  };
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
  }>;
}

interface PosterElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'product' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  opacity: number;
  zIndex: number;
  productId?: string;
  locked: boolean;
}

const PATTERNS = [
  { id: 'none', name: 'No Pattern' },
  { id: 'dots', name: 'Dots' },
  { id: 'grid', name: 'Grid' },
  { id: 'lines', name: 'Lines' },
  { id: 'zigzag', name: 'Zig Zag' },
  { id: 'diagonal', name: 'Diagonal' },
];

const SHAPES = [
  { id: 'rectangle', name: 'Rectangle' },
  { id: 'circle', name: 'Circle' },
  { id: 'triangle', name: 'Triangle' },
  { id: 'star', name: 'Star' },
  { id: 'heart', name: 'Heart' },
];

const FONTS = [
  { id: 'inter', name: 'Inter' },
  { id: 'roboto', name: 'Roboto' },
  { id: 'poppins', name: 'Poppins' },
  { id: 'montserrat', name: 'Montserrat' },
  { id: 'open-sans', name: 'Open Sans' },
  { id: 'playfair', name: 'Playfair' },
];

const TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and modern design for businesses',
    backgroundColor: '#ffffff',
    elements: []
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant design',
    backgroundColor: '#f8fafc',
    elements: []
  },
  {
    id: 'bold',
    name: 'Bold & Colorful',
    description: 'Eye-catching with vibrant colors',
    backgroundColor: '#1e293b',
    elements: []
  },
  {
    id: 'sale',
    name: 'Sale Promotion',
    description: 'Perfect for discounts and promotions',
    backgroundColor: '#dc2626',
    elements: []
  }
];

export const StoreFlyerTemplate = ({ shop, products = [] }: StoreFlyerTemplateProps) => {
  const storeUrl = `${window.location.origin}/shop/${shop.shop_slug}`;
  const [elements, setElements] = useState<PosterElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('design');
  const [pattern, setPattern] = useState('none');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 700 });
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [fontFamily, setFontFamily] = useState('inter');
  const [clipboard, setClipboard] = useState<PosterElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCanvasSize({ width: 300, height: 500 });
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize with professional template
  useEffect(() => {
    const initialElements: PosterElement[] = [
      {
        id: '1',
        type: 'text',
        content: shop.shop_name,
        x: 50,
        y: 50,
        width: 400,
        height: 60,
        rotation: 0,
        flipX: false,
        flipY: false,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        opacity: 1,
        zIndex: 1,
        locked: false
      },
      {
        id: '2',
        type: 'text',
        content: shop.description || 'Welcome to our store!',
        x: 50,
        y: 120,
        width: 400,
        height: 40,
        rotation: 0,
        flipX: false,
        flipY: false,
        fontSize: 16,
        color: '#666666',
        opacity: 1,
        zIndex: 1,
        locked: false
      },
      {
        id: '3',
        type: 'qr',
        content: storeUrl,
        x: 50,
        y: 200,
        width: 180,
        height: 180,
        rotation: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        zIndex: 1,
        locked: false
      },
      {
        id: '4',
        type: 'text',
        content: 'Scan to Visit Our Store',
        x: 50,
        y: 390,
        width: 180,
        height: 30,
        rotation: 0,
        flipX: false,
        flipY: false,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
        opacity: 1,
        zIndex: 1,
        locked: false
      },
    ];

    if (shop.logo_url) {
      initialElements.push({
        id: '5',
        type: 'image',
        content: shop.logo_url,
        x: 400,
        y: 50,
        width: 80,
        height: 80,
        rotation: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        zIndex: 1,
        locked: false
      });
    }

    setElements(initialElements);
  }, [shop, storeUrl]);

  // Enhanced print functionality
  const handlePrint = () => {
    const printContent = document.getElementById('flyer-print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${shop.shop_name} - Marketing Flyer</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: white !important;
              }
              .flyer-container {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 15mm !important;
                box-sizing: border-box;
                background: white !important;
                position: relative;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .flyer-container {
              width: 210mm;
              min-height: 297mm;
              background: white;
              margin: 0 auto;
              padding: 15mm;
              box-sizing: border-box;
              border: 1px solid #ccc;
              position: relative;
            }
            
            .print-element {
              position: absolute;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
      setTimeout(() => !printWindow.closed && printWindow.close(), 1000);
    }, 500);
  };

  // Download as PNG
  const handleDownload = async () => {
    const flyerElement = document.getElementById('flyer-print-content');
    if (!flyerElement) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(flyerElement, {
        backgroundColor: backgroundColor,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `${shop.shop_slug}-flyer.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error downloading flyer:', error);
    }
  };

  // Element management
  const addElement = (type: PosterElement['type'], content?: string) => {
    const newElement: PosterElement = {
      id: Date.now().toString(),
      type,
      content: content || (type === 'text' ? 'New Text' : ''),
      x: 50,
      y: 50,
      width: type === 'text' ? 120 : 100,
      height: type === 'text' ? 40 : 100,
      rotation: 0,
      flipX: false,
      flipY: false,
      fontSize: type === 'text' ? 16 : undefined,
      color: '#000000',
      backgroundColor: type === 'shape' ? '#3b82f6' : undefined,
      opacity: 1,
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1,
      locked: false
    };

    if (type === 'qr') {
      newElement.content = storeUrl;
      newElement.width = 120;
      newElement.height = 120;
    }

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const addProduct = (product: any) => {
    const newElement: PosterElement = {
      id: Date.now().toString(),
      type: 'product',
      content: product.name,
      x: 100,
      y: 100,
      width: 120,
      height: 160,
      rotation: 0,
      flipX: false,
      flipY: false,
      productId: product.id,
      color: '#000000',
      opacity: 1,
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1,
      locked: false
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const newElement = {
      ...element,
      id: Date.now().toString(),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const copyElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) setClipboard(element);
  };

  const pasteElement = () => {
    if (!clipboard) return;

    const newElement = {
      ...clipboard,
      id: Date.now().toString(),
      x: clipboard.x + 20,
      y: clipboard.y + 20,
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<PosterElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: maxZ + 1 });
  };

  const sendToBack = (id: string) => {
    const minZ = Math.min(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: minZ - 1 });
  };

  // Drag and drop with grid snapping
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || element.locked) return;

    setSelectedElement(elementId);
    setIsDragging(true);
    
    setDragOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // Snap to grid
    if (snapToGrid) {
      newX = Math.round(newX / 10) * 10;
      newY = Math.round(newY / 10) * 10;
    }

    // Boundary checking
    newX = Math.max(0, Math.min(canvasSize.width - 50, newX));
    newY = Math.max(0, Math.min(canvasSize.height - 50, newY));

    updateElement(selectedElement, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setBackgroundColor(template.backgroundColor);
      // In a real app, you'd load template-specific elements here
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  const getPatternStyle = () => {
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(#ccc 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        };
      case 'grid':
        return {
          backgroundImage: `linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        };
      case 'lines':
        return {
          backgroundImage: `repeating-linear-gradient(0deg, #ccc, #ccc 1px, transparent 1px, transparent 20px)`
        };
      case 'zigzag':
        return {
          backgroundImage: `linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(225deg, #ccc 25%, transparent 25%), linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(315deg, #ccc 25%, transparent 25%)`,
          backgroundSize: '20px 20px'
        };
      case 'diagonal':
        return {
          backgroundImage: `repeating-linear-gradient(45deg, #ccc, #ccc 1px, transparent 1px, transparent 10px)`
        };
      default:
        return {};
    }
  };

  const renderElement = (element: PosterElement) => {
    const transform = `
      rotate(${element.rotation}deg)
      scaleX(${element.flipX ? -1 : 1})
      scaleY(${element.flipY ? -1 : 1})
    `;

    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform,
      opacity: element.opacity,
      border: selectedElement === element.id ? '2px dashed #3b82f6' : '1px solid transparent',
      cursor: element.locked ? 'not-allowed' : 'move',
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      textDecoration: element.textDecoration,
      textAlign: element.textAlign,
      color: element.color,
      backgroundColor: element.backgroundColor,
      fontFamily: fontFamily,
      zIndex: element.zIndex,
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center p-2 hover:shadow-lg transition-shadow bg-white bg-opacity-90 rounded"
          >
            {element.content}
          </div>
        );
      
      case 'image':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center overflow-hidden hover:shadow-lg transition-shadow bg-white bg-opacity-90 rounded"
          >
            <img 
              src={element.content} 
              alt="Poster element"
              className="w-full h-full object-contain"
            />
          </div>
        );
      
      case 'qr':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center bg-white p-2 hover:shadow-lg transition-shadow rounded"
          >
            <QRCodeSVG
              value={element.content}
              size={Math.min(element.width, element.height) - 16}
              level="H"
              includeMargin={true}
            />
          </div>
        );
      
      case 'product':
        const product = products.find(p => p.id === element.productId);
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow"
          >
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-3/4 object-cover mb-2 rounded"
              />
            )}
            <div className="text-center" style={{ color: element.color, fontSize: element.fontSize }}>
              <div className="font-semibold truncate w-full">{product?.name}</div>
              <div>₦{product?.price.toLocaleString()}</div>
            </div>
          </div>
        );
      
      case 'shape':
        const shapeStyle: React.CSSProperties = {
          ...style,
          borderRadius: element.content === 'circle' ? '50%' : 
                       element.content === 'triangle' ? '0' : '4px',
          clipPath: element.content === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                    element.content === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                    element.content === 'heart' ? 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' : undefined
        };
        return (
          <div
            key={element.id}
            style={shapeStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="hover:shadow-lg transition-shadow"
          />
        );
      
      default:
        return null;
    }
  };

  // Toolbar component for mobile
  const MobileToolbar = () => (
    <div className="md:hidden fixed bottom-4 left-4 right-4 bg-background border rounded-lg shadow-lg p-2 z-50">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm">{Math.round(zoom * 100)}%</span>
        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === 'elements' ? 'design' : 'elements')}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Create Printable Flyer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-2 md:p-6">
        <DialogHeader className="px-4">
          <DialogTitle>Design Your Store Flyer</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
          {/* Design Tools Sidebar */}
          <div className={`${isMobile && activeTab !== 'elements' ? 'hidden' : 'w-full md:w-80'} space-y-4 overflow-y-auto`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
                <TabsTrigger value="products" className="text-xs">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Templates</Label>
                      <Select onValueChange={applyTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose template" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATES.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-16"
                        />
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Pattern</Label>
                      <Select value={pattern} onValueChange={setPattern}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PATTERNS.map(pattern => (
                            <SelectItem key={pattern.id} value={pattern.id}>
                              {pattern.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map(font => (
                            <SelectItem key={font.id} value={font.id}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="grid-toggle">Show Grid</Label>
                      <Switch
                        id="grid-toggle"
                        checked={showGrid}
                        onCheckedChange={setShowGrid}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="snap-toggle">Snap to Grid</Label>
                      <Switch
                        id="snap-toggle"
                        checked={snapToGrid}
                        onCheckedChange={setSnapToGrid}
                      />
                    </div>
                  </CardContent>
                </Card>

                {selectedElementData && (
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Edit Element</h4>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateElement(selectedElementData.id)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteElement(selectedElementData.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {selectedElementData.type === 'text' && (
                        <>
                          <div className="space-y-2">
                            <Label>Text Content</Label>
                            <Textarea
                              value={selectedElementData.content}
                              onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label>Font Size</Label>
                              <Input
                                type="number"
                                value={selectedElementData.fontSize}
                                onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Color</Label>
                              <Input
                                type="color"
                                value={selectedElementData.color}
                                onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant={selectedElementData.fontWeight === 'bold' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedElementData.id, { 
                                fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                              })}
                            >
                              <Bold className="w-3 h-3" />
                            </Button>
                            <Button
                              variant={selectedElementData.fontStyle === 'italic' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedElementData.id, { 
                                fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                              })}
                            >
                              <Italic className="w-3 h-3" />
                            </Button>
                            <Button
                              variant={selectedElementData.textDecoration === 'underline' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedElementData.id, { 
                                textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' 
                              })}
                            >
                              <Underline className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            {(['left', 'center', 'right'] as const).map(align => (
                              <Button
                                key={align}
                                variant={selectedElementData.textAlign === align ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateElement(selectedElementData.id, { textAlign: align })}
                              >
                                {align === 'left' && <AlignLeft className="w-3 h-3" />}
                                {align === 'center' && <AlignCenter className="w-3 h-3" />}
                                {align === 'right' && <AlignRight className="w-3 h-3" />}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}

                      {selectedElementData.type === 'shape' && (
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <Input
                            type="color"
                            value={selectedElementData.backgroundColor}
                            onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Opacity</Label>
                        <Slider
                          value={[selectedElementData.opacity * 100]}
                          onValueChange={([value]) => updateElement(selectedElementData.id, { opacity: value / 100 })}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Rotation</Label>
                        <Slider
                          value={[selectedElementData.rotation]}
                          onValueChange={([value]) => updateElement(selectedElementData.id, { rotation: value })}
                          max={360}
                          step={1}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Width</Label>
                          <Input
                            type="number"
                            value={selectedElementData.width}
                            onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Height</Label>
                          <Input
                            type="number"
                            value={selectedElementData.height}
                            onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                        >
                          <FlipHorizontal className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                        >
                          <FlipVertical className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bringToFront(selectedElementData.id)}
                        >
                          <Layers className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { locked: !selectedElementData.locked })}
                        >
                          {selectedElementData.locked ? '🔒' : '🔓'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="elements" className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => addElement('text')} className="h-16 flex-col text-xs">
                    <Type className="w-4 h-4 mb-1" />
                    Add Text
                  </Button>
                  <Button variant="outline" onClick={() => addElement('image')} className="h-16 flex-col text-xs">
                    <Image className="w-4 h-4 mb-1" />
                    Add Image
                  </Button>
                  <Button variant="outline" onClick={() => addElement('qr')} className="h-16 flex-col text-xs">
                    <Layout className="w-4 h-4 mb-1" />
                    Add QR
                  </Button>
                  <Button variant="outline" onClick={() => addElement('shape', 'rectangle')} className="h-16 flex-col text-xs">
                    <Palette className="w-4 h-4 mb-1" />
                    Add Shape
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Shapes</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {SHAPES.map(shape => (
                        <Button
                          key={shape.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addElement('shape', shape.id)}
                          className="h-12 text-xs"
                        >
                          {shape.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {clipboard && (
                  <Card>
                    <CardContent className="p-4">
                      <Button
                        variant="outline"
                        onClick={pasteElement}
                        className="w-full gap-2"
                      >
                        <Paste className="w-4 h-4" />
                        Paste Element
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="products" className="space-y-2">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Your Products</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {products.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-accent"
                          onClick={() => addProduct(product)}
                        >
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()}</p>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Design Canvas */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 px-4">
              <h3 className="font-semibold">Design Canvas</h3>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                    disabled={zoom >= 2}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print Flyer
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4">
              <div
                ref={canvasRef}
                className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto"
                style={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                  backgroundColor: backgroundColor,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  ...getPatternStyle(),
                  ...(showGrid && {
                    backgroundImage: `linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  })
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {elements.sort((a, b) => a.zIndex - b.zIndex).map(renderElement)}
                
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Layout className="w-12 h-12 mx-auto mb-2" />
                      <p>Add elements from the sidebar to start designing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Toolbar */}
        {isMobile && <MobileToolbar />}

        {/* Hidden print content */}
        <div id="flyer-print-content" style={{ display: 'none' }}>
          <div 
            className="flyer-container"
            style={{
              backgroundColor: backgroundColor,
              ...getPatternStyle()
            }}
          >
            {elements.sort((a, b) => a.zIndex - b.zIndex).map((element) => {
              const style: React.CSSProperties = {
                position: 'absolute',
                left: element.x + 'px',
                top: element.y + 'px',
                width: element.width + 'px',
                height: element.height + 'px',
                fontSize: element.fontSize + 'px',
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textDecoration: element.textDecoration,
                textAlign: element.textAlign,
                color: element.color,
                backgroundColor: element.backgroundColor,
                fontFamily: fontFamily,
                opacity: element.opacity,
                transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`
              };

              switch (element.type) {
                case 'text':
                  return <div key={element.id} style={style} className="print-element">{element.content}</div>;
                case 'image':
                  return (
                    <div key={element.id} style={style} className="print-element">
                      <img src={element.content} alt="Poster element" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  );
                case 'qr':
                  return (
                    <div key={element.id} style={style} className="print-element">
                      <QRCodeSVG value={element.content} size={element.width - 16} level="H" includeMargin={true} />
                    </div>
                  );
                case 'product':
                  const product = products.find(p => p.id === element.productId);
                  return (
                    <div key={element.id} style={style} className="print-element">
                      {product?.image_url && (
                        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '75%', objectFit: 'cover' }} />
                      )}
                      <div style={{ color: element.color, fontSize: element.fontSize + 'px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold' }}>{product?.name}</div>
                        <div>₦{product?.price.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                case 'shape':
                  const shapeStyle: React.CSSProperties = {
                    ...style,
                    borderRadius: element.content === 'circle' ? '50%' : '4px',
                    clipPath: element.content === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined
                  };
                  return <div key={element.id} style={shapeStyle} className="print-element" />;
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
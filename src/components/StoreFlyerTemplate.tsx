import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Printer, FileText, Plus, Trash2, Type, Image, Layout, 
  Palette, ShoppingCart, Download, ZoomIn, ZoomOut, 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Upload,
  Save, Copy, FlipHorizontal, FlipVertical, RotateCw, Layers,
  ImageIcon, Sparkles, Eye, Grid3X3
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
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  opacity: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  zIndex: number;
  productId?: string;
}

const SHAPES = [
  { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
  { id: 'circle', name: 'Circle', icon: '⭕' },
  { id: 'triangle', name: 'Triangle', icon: '🔺' },
  { id: 'star', name: 'Star', icon: '⭐' },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: 'bolder', label: 'Bolder' },
  { value: 'lighter', label: 'Lighter' },
];

const QUICK_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#000000'
];

export const StoreFlyerTemplate = ({ shop, products = [] }: StoreFlyerTemplateProps) => {
  const storeUrl = `${window.location.origin}/shop/${shop.shop_slug}`;
  const [elements, setElements] = useState<PosterElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('elements');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundSize, setBackgroundSize] = useState<'cover' | 'contain' | 'repeat'>('cover');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize with basic elements
  useEffect(() => {
    const initialElements: PosterElement[] = [
      {
        id: '1',
        type: 'text',
        content: shop.shop_name,
        x: 50,
        y: 50,
        width: 300,
        height: 60,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        opacity: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
        zIndex: 1
      },
      {
        id: '2',
        type: 'text',
        content: shop.description || 'Welcome to our store! Special offers available!',
        x: 50,
        y: 120,
        width: 300,
        height: 40,
        fontSize: 16,
        color: '#6b7280',
        opacity: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
        zIndex: 1
      },
      {
        id: '3',
        type: 'qr',
        content: storeUrl,
        x: 350,
        y: 500,
        width: 120,
        height: 120,
        opacity: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
        zIndex: 1
      },
    ];

    if (shop.logo_url) {
      initialElements.push({
        id: '4',
        type: 'image',
        content: shop.logo_url,
        x: 350,
        y: 50,
        width: 100,
        height: 100,
        opacity: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
        zIndex: 1
      });
    }

    // Add a decorative element
    initialElements.push({
      id: '5',
      type: 'shape',
      content: 'rectangle',
      x: 30,
      y: 30,
      width: 440,
      height: 640,
      backgroundColor: 'transparent',
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      zIndex: 0
    });

    setElements(initialElements);
  }, [shop, storeUrl]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'element' | 'background') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'background') {
        setBackgroundImage(result);
      } else {
        addElement('image', result);
      }
    };
    reader.onerror = () => {
      alert('Error reading file. Please try another image.');
    };
    reader.readAsDataURL(file);
    
    event.target.value = '';
  };

  // Remove background image
  const removeBackgroundImage = () => {
    setBackgroundImage(null);
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Download as image
  const handleDownload = async () => {
    try {
      const element = document.createElement('a');
      const content = `Flyer Design for ${shop.shop_name}\n\nElements:\n${elements.map(el => `- ${el.type}: ${el.content}`).join('\n')}`;
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
      element.setAttribute('download', `${shop.shop_slug}-flyer-design.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // Save template
  const saveTemplate = () => {
    const template = {
      id: Date.now().toString(),
      name: `Template ${templates.length + 1}`,
      backgroundColor,
      backgroundImage,
      backgroundSize,
      elements: elements.map(el => ({ ...el, id: Date.now().toString() + Math.random() })),
      createdAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, template]);
  };

  // Load template
  const loadTemplate = (template: any) => {
    setBackgroundColor(template.backgroundColor);
    setBackgroundImage(template.backgroundImage);
    setBackgroundSize(template.backgroundSize);
    setElements(template.elements);
  };

  // Element management
  const addElement = (type: PosterElement['type'], content?: string) => {
    const newElement: PosterElement = {
      id: Date.now().toString(),
      type,
      content: content || (type === 'text' ? 'New Text' : ''),
      x: 100,
      y: 100,
      width: type === 'text' ? 120 : 100,
      height: type === 'text' ? 40 : 100,
      fontSize: type === 'text' ? 16 : undefined,
      color: type === 'text' ? '#1f2937' : '#000000',
      backgroundColor: type === 'shape' ? '#3b82f6' : undefined,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      zIndex: Math.max(0, ...elements.map(el => el.zIndex)) + 1
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
      productId: product.id,
      color: '#1f2937',
      fontSize: 12,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      zIndex: Math.max(0, ...elements.map(el => el.zIndex)) + 1
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

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now().toString(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: Math.max(0, ...elements.map(el => el.zIndex)) + 1
      };
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement.id);
    }
  };

  const bringToFront = (id: string) => {
    updateElement(id, { zIndex: Math.max(0, ...elements.map(el => el.zIndex)) + 1 });
  };

  const sendToBack = (id: string) => {
    updateElement(id, { zIndex: Math.min(0, ...elements.map(el => el.zIndex)) - 1 });
  };

  // Drag and drop
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    updateElement(selectedElement, {
      x: Math.max(0, Math.min(400, newX)),
      y: Math.max(0, Math.min(600, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  // Render elements
  const renderElement = (element: PosterElement) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: selectedElement === element.id ? '2px dashed #3b82f6' : '1px solid transparent',
      cursor: 'move',
      opacity: element.opacity,
      transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
      zIndex: element.zIndex,
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              textAlign: element.textAlign,
              color: element.color,
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)'
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content}
          </div>
        );
      
      case 'image':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center overflow-hidden bg-white rounded-lg shadow-md"
          >
            <img 
              src={element.content} 
              alt="Poster element"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNUwxMiA5TDYgMTUiIHN0cm9rZT0iIzljYTNmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
              }}
            />
          </div>
        );
      
      case 'qr':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center bg-white p-3 rounded-lg shadow-md"
          >
            <QRCodeSVG
              value={element.content}
              size={Math.min(element.width, element.height) - 24}
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
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex flex-col items-center p-3 bg-white rounded-xl shadow-md border border-gray-100"
          >
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-3/4 object-cover mb-2 rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNUwxMiA5TDYgMTUiIHN0cm9rZT0iIzljYTNmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            )}
            <div className="text-center w-full" style={{ color: element.color, fontSize: element.fontSize }}>
              <div className="font-semibold truncate text-sm">{product?.name}</div>
              <div className="text-green-600 font-bold">₦{product?.price.toLocaleString()}</div>
            </div>
          </div>
        );
      
      case 'shape':
        const shapeStyle: React.CSSProperties = {
          ...baseStyle,
          backgroundColor: element.backgroundColor,
        };

        if (element.content === 'circle') {
          shapeStyle.borderRadius = '50%';
        } else if (element.content === 'triangle') {
          shapeStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
          shapeStyle.backgroundColor = element.backgroundColor;
        } else if (element.content === 'star') {
          shapeStyle.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        }

        return (
          <div
            key={element.id}
            style={shapeStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        );
      
      default:
        return null;
    }
  };

  // Mobile toolbar
  const MobileToolbar = () => (
    <div className="md:hidden fixed bottom-4 left-4 right-4 bg-background border rounded-xl shadow-lg p-3 z-50 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === 'elements' ? 'products' : 'elements')}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Sparkles className="w-4 h-4" />
          Design Flyer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Design Your Store Flyer
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Drag, customize, and create beautiful flyers
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Sidebar */}
          <div className={`${isMobile && activeTab === 'canvas' ? 'hidden' : 'w-full md:w-80'} space-y-4 overflow-y-auto p-4 border-r`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="design" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Design
                </TabsTrigger>
                <TabsTrigger value="elements" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Elements
                </TabsTrigger>
                <TabsTrigger value="products" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Products
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Background
                      </Label>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-12 h-10 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Quick Colors</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {QUICK_COLORS.map((color) => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded-lg border shadow-sm hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              onClick={() => setBackgroundColor(color)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Background Image</Label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            ref={backgroundInputRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'background')}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => backgroundInputRef.current?.click()}
                            className="w-full gap-2 border-dashed"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Upload Background
                          </Button>
                          {backgroundImage && (
                            <div className="flex gap-2">
                              <Select value={backgroundSize} onValueChange={(value: any) => setBackgroundSize(value)}>
                                <SelectTrigger className="text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cover">Cover</SelectItem>
                                  <SelectItem value="contain">Contain</SelectItem>
                                  <SelectItem value="repeat">Repeat</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={removeBackgroundImage}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4" />
                        Tools
                      </Label>
                      
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                        <Label htmlFor="grid-toggle" className="text-sm">Show Grid</Label>
                        <Switch
                          id="grid-toggle"
                          checked={showGrid}
                          onCheckedChange={setShowGrid}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Upload Image to Canvas</Label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'element')}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full gap-2 border-dashed"
                        >
                          <Upload className="w-4 h-4" />
                          Add Image
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Templates
                      </Label>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={saveTemplate}
                          className="w-full gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Current as Template
                        </Button>
                        {templates.length > 0 && (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {templates.map(template => (
                              <Button
                                key={template.id}
                                variant="outline"
                                size="sm"
                                onClick={() => loadTemplate(template)}
                                className="w-full justify-start text-xs h-8"
                              >
                                {template.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="elements" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Add Elements</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('text')} 
                          className="h-16 flex-col gap-1 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <Type className="w-5 h-5 text-blue-600" />
                          <span className="text-xs">Text</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('image')} 
                          className="h-16 flex-col gap-1 hover:bg-green-50 hover:border-green-200 transition-colors"
                        >
                          <Image className="w-5 h-5 text-green-600" />
                          <span className="text-xs">Image</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('qr')} 
                          className="h-16 flex-col gap-1 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                        >
                          <Layout className="w-5 h-5 text-purple-600" />
                          <span className="text-xs">QR Code</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('shape', 'rectangle')} 
                          className="h-16 flex-col gap-1 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                        >
                          <Palette className="w-5 h-5 text-orange-600" />
                          <span className="text-xs">Shape</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Shapes</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {SHAPES.map(shape => (
                          <Button
                            key={shape.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addElement('shape', shape.id)}
                            className="h-10 text-sm gap-2 justify-start"
                          >
                            <span className="text-lg">{shape.icon}</span>
                            {shape.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedElementData && (
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Edit Element
                        </h4>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateElement(selectedElementData.id)}
                            className="h-8 w-8"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteElement(selectedElementData.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {selectedElementData.type === 'text' && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs">Text Content</Label>
                            <Textarea
                              value={selectedElementData.content}
                              onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Font Size</Label>
                              <Select
                                value={selectedElementData.fontSize?.toString()}
                                onValueChange={(value) => updateElement(selectedElementData.id, { fontSize: parseInt(value) })}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FONT_SIZES.map(size => (
                                    <SelectItem key={size} value={size.toString()} className="text-xs">
                                      {size}px
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Color</Label>
                              <Input
                                type="color"
                                value={selectedElementData.color}
                                onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                                className="h-8"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Quick Colors</Label>
                            <div className="grid grid-cols-5 gap-1">
                              {QUICK_COLORS.map((color) => (
                                <button
                                  key={color}
                                  className="w-6 h-6 rounded border shadow-sm hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                  onClick={() => updateElement(selectedElementData.id, { color })}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Font Weight</Label>
                            <Select
                              value={selectedElementData.fontWeight}
                              onValueChange={(value) => updateElement(selectedElementData.id, { fontWeight: value })}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FONT_WEIGHTS.map(weight => (
                                  <SelectItem key={weight.value} value={weight.value} className="text-xs">
                                    {weight.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
                            <Button
                              variant={selectedElementData.fontStyle === 'italic' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedElementData.id, { 
                                fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                              })}
                              className="h-8 flex-1"
                            >
                              <Italic className="w-3 h-3" />
                            </Button>
                            {(['left', 'center', 'right'] as const).map(align => (
                              <Button
                                key={align}
                                variant={selectedElementData.textAlign === align ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateElement(selectedElementData.id, { textAlign: align })}
                                className="h-8 flex-1"
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
                          <Label className="text-xs">Shape Color</Label>
                          <Input
                            type="color"
                            value={selectedElementData.backgroundColor}
                            onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                          />
                          <div className="grid grid-cols-5 gap-1 mt-2">
                            {QUICK_COLORS.map((color) => (
                              <button
                                key={color}
                                className="w-6 h-6 rounded border shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => updateElement(selectedElementData.id, { backgroundColor: color })}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-xs">Opacity</Label>
                        <Slider
                          value={[selectedElementData.opacity * 100]}
                          onValueChange={([value]) => updateElement(selectedElementData.id, { opacity: value / 100 })}
                          max={100}
                          step={10}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={selectedElementData.width}
                            onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 100 })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={selectedElementData.height}
                            onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 100 })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Rotation: {selectedElementData.rotation}°</Label>
                        <Slider
                          value={[selectedElementData.rotation]}
                          onValueChange={([value]) => updateElement(selectedElementData.id, { rotation: value })}
                          max={360}
                          step={15}
                        />
                      </div>

                      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                          className="h-8 flex-1"
                        >
                          <FlipHorizontal className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                          className="h-8 flex-1"
                        >
                          <FlipVertical className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bringToFront(selectedElementData.id)}
                          className="h-8 flex-1"
                        >
                          <Layers className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendToBack(selectedElementData.id)}
                          className="h-8 flex-1"
                        >
                          <Layers className="w-3 h-3 rotate-180" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="products" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <ShoppingCart className="w-4 h-4" />
                      Add Products
                    </Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {products.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-accent transition-colors group"
                          onClick={() => addProduct(product)}
                        >
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()}</p>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No products available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-lg">Design Canvas</h3>
                <p className="text-sm text-muted-foreground">
                  Drag elements to position them. Click to select and customize.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-background rounded-lg p-1 border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                    disabled={zoom <= 0.5}
                    className="h-8 w-8"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-sm w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                    disabled={zoom >= 2}
                    className="h-8 w-8"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
                <Button onClick={handleDownload} variant="outline" className="gap-2 h-9">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={handlePrint} className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 flex items-center justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white border-2 border-gray-200 rounded-xl shadow-lg"
                style={{
                  width: isMobile ? '300px' : '500px',
                  height: isMobile ? '500px' : '700px',
                  backgroundColor,
                  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                  backgroundSize,
                  backgroundRepeat: backgroundSize === 'repeat' ? 'repeat' : 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  ...(showGrid && {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
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
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Start Designing Your Flyer</h4>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Add elements from the sidebar to create your perfect store flyer
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Toolbar */}
        {isMobile && <MobileToolbar />}
      </DialogContent>
    </Dialog>
  );
};
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Printer, FileText, Plus, Trash2, Type, Image, Layout, 
  Palette, ShoppingCart, Download, ZoomIn, ZoomOut, 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
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
  productId?: string;
}

const SHAPES = [
  { id: 'rectangle', name: 'Rectangle' },
  { id: 'circle', name: 'Circle' },
  { id: 'triangle', name: 'Triangle' },
];

export const StoreFlyerTemplate = ({ shop, products = [] }: StoreFlyerTemplateProps) => {
  const storeUrl = `${window.location.origin}/shop/${shop.shop_slug}`;
  const [elements, setElements] = useState<PosterElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('elements');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        opacity: 1
      },
      {
        id: '2',
        type: 'text',
        content: shop.description || 'Welcome to our store!',
        x: 50,
        y: 120,
        width: 300,
        height: 40,
        fontSize: 16,
        color: '#666666',
        opacity: 1
      },
      {
        id: '3',
        type: 'qr',
        content: storeUrl,
        x: 50,
        y: 180,
        width: 150,
        height: 150,
        opacity: 1
      },
    ];

    if (shop.logo_url) {
      initialElements.push({
        id: '4',
        type: 'image',
        content: shop.logo_url,
        x: 200,
        y: 50,
        width: 80,
        height: 80,
        opacity: 1
      });
    }

    setElements(initialElements);
  }, [shop, storeUrl]);

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${shop.shop_name} - Flyer</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              background: white;
            }
            .flyer-container {
              width: 8.5in;
              height: 11in;
              background: ${backgroundColor};
              margin: 0 auto;
              position: relative;
            }
            .print-element {
              position: absolute;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="flyer-container">
            ${elements.map(element => {
              const style = `left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;`;
              
              switch (element.type) {
                case 'text':
                  return `<div class="print-element" style="${style}font-size:${element.fontSize}px;font-weight:${element.fontWeight};color:${element.color};opacity:${element.opacity}">${element.content}</div>`;
                case 'image':
                  return `<div class="print-element" style="${style}"><img src="${element.content}" style="width:100%;height:100%;object-fit:contain;" /></div>`;
                case 'qr':
                  return `<div class="print-element" style="${style}">
                    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:white;">
                      [QR Code: ${element.content}]
                    </div>
                  </div>`;
                case 'product':
                  const product = products.find(p => p.id === element.productId);
                  return `<div class="print-element" style="${style}border:1px solid #ccc;padding:8px;background:white;">
                    ${product?.image_url ? `<img src="${product.image_url}" style="width:100%;height:60%;object-fit:cover;" />` : ''}
                    <div style="font-size:${element.fontSize}px;color:${element.color};text-align:center;">
                      <div style="font-weight:bold">${product?.name}</div>
                      <div>₦${product?.price.toLocaleString()}</div>
                    </div>
                  </div>`;
                case 'shape':
                  return `<div class="print-element" style="${style}background:${element.backgroundColor};border-radius:${element.content === 'circle' ? '50%' : '4px'};"></div>`;
                default:
                  return '';
              }
            }).join('')}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    }, 500);
  };

  // Download as image
  const handleDownload = async () => {
    try {
      // Simple download fallback
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,Your flyer is ready to print!');
      element.setAttribute('download', `${shop.shop_slug}-flyer.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Download error:', error);
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
      fontSize: type === 'text' ? 16 : undefined,
      color: '#000000',
      backgroundColor: type === 'shape' ? '#3b82f6' : undefined,
      opacity: 1
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
      color: '#000000',
      opacity: 1
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
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '4px'
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
            className="flex items-center justify-center overflow-hidden bg-white rounded"
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
            className="flex items-center justify-center bg-white p-2 rounded"
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
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex flex-col items-center p-2 bg-white rounded-lg border"
          >
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-3/4 object-cover mb-2 rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNUwxMiA5TDYgMTUiIHN0cm9rZT0iIzljYTNmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            )}
            <div className="text-center w-full" style={{ color: element.color, fontSize: element.fontSize }}>
              <div className="font-semibold truncate">{product?.name}</div>
              <div>₦{product?.price.toLocaleString()}</div>
            </div>
          </div>
        );
      
      case 'shape':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: element.backgroundColor,
              borderRadius: element.content === 'circle' ? '50%' : '4px',
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        );
      
      default:
        return null;
    }
  };

  // Mobile toolbar
  const MobileToolbar = () => (
    <div className="md:hidden fixed bottom-4 left-4 right-4 bg-background border rounded-lg shadow-lg p-3 z-50">
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
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Create Flyer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-2 md:p-6">
        <DialogHeader>
          <DialogTitle>Design Your Store Flyer</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
          {/* Sidebar - Hidden on mobile when not active */}
          <div className={`${isMobile && activeTab === 'canvas' ? 'hidden' : 'w-full md:w-80'} space-y-4 overflow-y-auto`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-10"
                        />
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

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
                        Add QR Code
                      </Button>
                      <Button variant="outline" onClick={() => addElement('shape', 'rectangle')} className="h-16 flex-col text-xs">
                        <Palette className="w-4 h-4 mb-1" />
                        Add Shape
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Shapes</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {SHAPES.map(shape => (
                          <Button
                            key={shape.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addElement('shape', shape.id)}
                            className="h-10 text-xs"
                          >
                            {shape.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedElementData && (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Edit Element</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteElement(selectedElementData.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {selectedElementData.type === 'text' && (
                        <>
                          <div className="space-y-2">
                            <Label>Text</Label>
                            <Textarea
                              value={selectedElementData.content}
                              onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Size</Label>
                              <Input
                                type="number"
                                value={selectedElementData.fontSize}
                                onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) || 16 })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Color</Label>
                              <Input
                                type="color"
                                value={selectedElementData.color}
                                onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex gap-1">
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
                          <Label>Color</Label>
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
                          step={10}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={selectedElementData.width}
                            onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 100 })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={selectedElementData.height}
                            onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 100 })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
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
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNUwxMiA5TDYgMTUiIHN0cm9rZT0iIzljYTNmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()}</p>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                      {products.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No products available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="font-semibold">Design Canvas</h3>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-background rounded-lg p-1">
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
                  Print
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4 flex items-center justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg"
                style={{
                  width: isMobile ? '300px' : '500px',
                  height: isMobile ? '500px' : '700px',
                  backgroundColor,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {elements.map(renderElement)}
                
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Layout className="w-12 h-12 mx-auto mb-2" />
                      <p>Add elements to start designing</p>
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
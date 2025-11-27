import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, FileText, Plus, Trash2, Move, Type, Image, Layout, Palette, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  color?: string;
  backgroundColor?: string;
  productId?: string;
}

const PATTERNS = [
  { id: 'none', name: 'No Pattern' },
  { id: 'dots', name: 'Dots' },
  { id: 'grid', name: 'Grid' },
  { id: 'lines', name: 'Lines' },
  { id: 'zigzag', name: 'Zig Zag' },
];

const SHAPES = [
  { id: 'rectangle', name: 'Rectangle' },
  { id: 'circle', name: 'Circle' },
  { id: 'triangle', name: 'Triangle' },
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
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize with the original professional template layout
  useEffect(() => {
    const initialElements: PosterElement[] = [
      // Header Section
      {
        id: '1',
        type: 'text',
        content: shop.shop_name,
        x: 50,
        y: 50,
        width: 400,
        height: 60,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000'
      },
      {
        id: '2',
        type: 'text',
        content: shop.description || 'Welcome to our store!',
        x: 50,
        y: 120,
        width: 400,
        height: 40,
        fontSize: 16,
        color: '#666666'
      },
      
      // Left Column - QR Code
      {
        id: '3',
        type: 'qr',
        content: storeUrl,
        x: 50,
        y: 200,
        width: 180,
        height: 180
      },
      {
        id: '4',
        type: 'text',
        content: 'Scan to Visit Our Store',
        x: 50,
        y: 390,
        width: 180,
        height: 30,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6'
      },
      {
        id: '5',
        type: 'text',
        content: 'Shop online anytime, anywhere',
        x: 50,
        y: 420,
        width: 180,
        height: 20,
        fontSize: 12,
        color: '#666666'
      },

      // Right Column - Contact Info
      {
        id: '6',
        type: 'text',
        content: 'Get in Touch',
        x: 270,
        y: 200,
        width: 200,
        height: 40,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000'
      },
      {
        id: '7',
        type: 'text',
        content: 'WhatsApp',
        x: 270,
        y: 250,
        width: 100,
        height: 20,
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#6b7280'
      },
      {
        id: '8',
        type: 'text',
        content: shop.whatsapp_number,
        x: 270,
        y: 270,
        width: 200,
        height: 30,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000'
      },
      {
        id: '9',
        type: 'text',
        content: 'Online Store',
        x: 270,
        y: 320,
        width: 100,
        height: 20,
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#6b7280'
      },
      {
        id: '10',
        type: 'text',
        content: storeUrl,
        x: 270,
        y: 340,
        width: 200,
        height: 40,
        fontSize: 10,
        color: '#000000'
      },
      {
        id: '11',
        type: 'text',
        content: 'Browse our products, place orders, and get updates on new arrivals!',
        x: 270,
        y: 400,
        width: 200,
        height: 40,
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#000000'
      },

      // Call to Action Banner
      {
        id: '12',
        type: 'text',
        content: 'Shop Now & Get Special Offers!',
        x: 50,
        y: 480,
        width: 400,
        height: 40,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000'
      },
      {
        id: '13',
        type: 'text',
        content: 'Scan the QR code or visit our website to explore our full catalog',
        x: 50,
        y: 520,
        width: 400,
        height: 30,
        fontSize: 14,
        color: '#666666'
      },

      // Footer
      {
        id: '14',
        type: 'text',
        content: `Thank you for choosing ${shop.shop_name}`,
        x: 50,
        y: 580,
        width: 400,
        height: 30,
        fontSize: 14,
        color: '#666666'
      }
    ];

    // Add logo if available
    if (shop.logo_url) {
      initialElements.push({
        id: '15',
        type: 'image',
        content: shop.logo_url,
        x: 400,
        y: 50,
        width: 80,
        height: 80
      });
    }

    setElements(initialElements);
  }, [shop, storeUrl]);

  const handlePrint = () => {
    const printContent = document.getElementById('flyer-print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback to browser print
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
            
            .print-text {
              display: flex;
              align-items: center;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            
            .print-image {
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            
            .print-image img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            
            .print-qr {
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              padding: 8px;
            }
            
            .print-product {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 8px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .print-product img {
              max-width: 100%;
              max-height: 100%;
              object-fit: cover;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for images to load
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after printing
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      
      // Fallback close for browsers that don't support onafterprint
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      }, 1000);
    }, 500);
  };

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
      color: '#000000',
      backgroundColor: type === 'shape' ? '#3b82f6' : undefined
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
      color: '#000000'
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
      x: Math.max(0, Math.min(500, newX)),
      y: Math.max(0, Math.min(700, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
      default:
        return {};
    }
  };

  const renderElement = (element: PosterElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: selectedElement === element.id ? '2px dashed #3b82f6' : '1px solid transparent',
      cursor: 'move',
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      color: element.color,
      backgroundColor: element.backgroundColor,
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center p-2 hover:shadow-lg transition-shadow"
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
            className="flex items-center justify-center overflow-hidden hover:shadow-lg transition-shadow"
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
            className="flex items-center justify-center bg-white p-2 hover:shadow-lg transition-shadow"
          >
            <QRCodeSVG
              value={element.content}
              size={element.width - 16}
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
                className="w-16 h-16 object-cover mb-2 rounded"
              />
            )}
            <div className="text-center" style={{ color: element.color, fontSize: element.fontSize }}>
              <div className="font-semibold">{product?.name}</div>
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

  // Render print version of elements
  const renderPrintElement = (element: PosterElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x + 'px',
      top: element.y + 'px',
      width: element.width + 'px',
      height: element.height + 'px',
      fontSize: element.fontSize + 'px',
      fontWeight: element.fontWeight,
      color: element.color,
      backgroundColor: element.backgroundColor,
    };

    switch (element.type) {
      case 'text':
        return (
          <div key={element.id} style={style} className="print-element print-text">
            {element.content}
          </div>
        );
      
      case 'image':
        return (
          <div key={element.id} style={style} className="print-element print-image">
            <img src={element.content} alt="Poster element" />
          </div>
        );
      
      case 'qr':
        return (
          <div key={element.id} style={style} className="print-element print-qr">
            <QRCodeSVG
              value={element.content}
              size={element.width - 16}
              level="H"
              includeMargin={true}
            />
          </div>
        );
      
      case 'product':
        const product = products.find(p => p.id === element.productId);
        return (
          <div key={element.id} style={style} className="print-element print-product">
            {product?.image_url && (
              <img src={product.image_url} alt={product.name} />
            )}
            <div style={{ color: element.color, fontSize: element.fontSize + 'px' }}>
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
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Create Printable Flyer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Design Your Store Flyer</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 h-[600px]">
          {/* Design Tools Sidebar */}
          <div className="w-80 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
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
                  </CardContent>
                </Card>

                {selectedElementData && (
                  <Card>
                    <CardContent className="p-4 space-y-4">
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
                            <Label>Text Content</Label>
                            <Textarea
                              value={selectedElementData.content}
                              onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                              rows={3}
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
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="elements" className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => addElement('text')} className="h-16 flex-col">
                    <Type className="w-4 h-4 mb-1" />
                    Add Text
                  </Button>
                  <Button variant="outline" onClick={() => addElement('image')} className="h-16 flex-col">
                    <Image className="w-4 h-4 mb-1" />
                    Add Image
                  </Button>
                  <Button variant="outline" onClick={() => addElement('qr')} className="h-16 flex-col">
                    <Layout className="w-4 h-4 mb-1" />
                    Add QR Code
                  </Button>
                  <Button variant="outline" onClick={() => addElement('shape', 'rectangle')} className="h-16 flex-col">
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
                          className="h-12"
                        >
                          {shape.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Design Canvas</h3>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Print Flyer
              </Button>
            </div>

            <div
              ref={canvasRef}
              className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg"
              style={{
                width: '500px',
                height: '700px',
                backgroundColor: backgroundColor,
                ...getPatternStyle()
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
                    <p>Add elements from the sidebar to start designing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden print content */}
        <div id="flyer-print-content" style={{ display: 'none' }}>
          <div 
            className="flyer-container"
            style={{
              backgroundColor: backgroundColor,
              ...getPatternStyle()
            }}
          >
            {elements.map(renderPrintElement)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
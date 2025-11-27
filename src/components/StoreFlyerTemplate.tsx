import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Printer, FileText, Plus, Trash2, Move, Type, Image, Layout, Palette, 
  ShoppingCart, Copy, RotateCcw, ZoomIn, ZoomOut, Grid, Layers, Download,
  MousePointer, Square, Circle, Triangle, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Link, Ungroup, Group, FlipHorizontal, FlipVertical,
  Save, Upload, Eye, EyeOff, ChevronUp, ChevronDown, Wand2, Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useRef, useEffect, useCallback } from "react";

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
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity: number;
  zIndex: number;
  isLocked?: boolean;
  isVisible?: boolean;
  productId?: string;
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
}

interface HistoryState {
  elements: PosterElement[];
  timestamp: number;
}

const PATTERNS = [
  { id: 'none', name: 'No Pattern' },
  { id: 'dots', name: 'Dots' },
  { id: 'grid', name: 'Grid' },
  { id: 'lines', name: 'Lines' },
  { id: 'zigzag', name: 'Zig Zag' },
  { id: 'polka', name: 'Polka Dots' },
  { id: 'cross', name: 'Cross Pattern' },
];

const FONT_FAMILIES = [
  { id: 'inter', name: 'Inter', value: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', value: 'Roboto, sans-serif' },
  { id: 'opensans', name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { id: 'serif', name: 'Serif', value: 'serif' },
  { id: 'monospace', name: 'Monospace', value: 'monospace' },
  { id: 'cursive', name: 'Cursive', value: 'cursive' },
];

const SHAPES = [
  { id: 'rectangle', name: 'Rectangle', icon: Square },
  { id: 'circle', name: 'Circle', icon: Circle },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
  { id: 'line', name: 'Line', icon: Minus },
];

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean and professional design',
    backgroundColor: '#ffffff',
    elements: []
  },
  {
    id: 'vibrant',
    name: 'Vibrant Colorful',
    description: 'Eye-catching colorful design',
    backgroundColor: '#fef3c7',
    elements: []
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate and business style',
    backgroundColor: '#f8fafc',
    elements: []
  }
];

export const StoreFlyerTemplate = ({ shop, products = [] }: StoreFlyerTemplateProps) => {
  const storeUrl = `${window.location.origin}/shop/${shop.shop_slug}`;
  const [elements, setElements] = useState<PosterElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('elements');
  const [pattern, setPattern] = useState('none');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMultiselect, setIsMultiselect] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Save state to history
  const saveToHistory = useCallback((newElements: PosterElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      elements: JSON.parse(JSON.stringify(newElements)),
      timestamp: Date.now()
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1].elements);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1].elements);
    }
  };

  // Initialize with template
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
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'inter',
        textAlign: 'center',
        color: '#000000',
        opacity: 1,
        zIndex: 1,
        isVisible: true
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
        fontSize: 16,
        fontFamily: 'inter',
        color: '#666666',
        opacity: 1,
        zIndex: 2,
        isVisible: true
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
        opacity: 1,
        zIndex: 3,
        isVisible: true
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
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'inter',
        color: '#3b82f6',
        opacity: 1,
        zIndex: 4,
        isVisible: true
      }
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
        opacity: 1,
        zIndex: 5,
        isVisible: true
      });
    }

    setElements(initialElements);
    saveToHistory(initialElements);
  }, [shop, storeUrl, saveToHistory]);

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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
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
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', sans-serif;
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
    }, 500);
  };

  const addElement = (type: PosterElement['type'], content?: string) => {
    const newElement: PosterElement = {
      id: Date.now().toString(),
      type,
      content: content || (type === 'text' ? 'Your Text Here' : ''),
      x: 200,
      y: 200,
      width: type === 'text' ? 120 : 100,
      height: type === 'text' ? 40 : 100,
      rotation: 0,
      fontSize: type === 'text' ? 16 : undefined,
      fontFamily: 'inter',
      textAlign: 'left',
      color: '#000000',
      backgroundColor: type === 'shape' ? '#3b82f6' : undefined,
      borderColor: '#000000',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 1,
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1,
      isLocked: false,
      isVisible: true,
      shadow: { x: 0, y: 0, blur: 0, color: '#000000' }
    };

    if (type === 'qr') {
      newElement.content = storeUrl;
      newElement.width = 120;
      newElement.height = 120;
    }

    if (type === 'line') {
      newElement.width = 200;
      newElement.height = 2;
      newElement.backgroundColor = '#000000';
    }

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    setSelectedElements(new Set([newElement.id]));
    saveToHistory(newElements);
  };

  const addProduct = (product: any) => {
    const newElement: PosterElement = {
      id: Date.now().toString(),
      type: 'product',
      content: product.name,
      x: 200,
      y: 200,
      width: 140,
      height: 180,
      rotation: 0,
      productId: product.id,
      color: '#000000',
      fontSize: 14,
      opacity: 1,
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1,
      isLocked: false,
      isVisible: true
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    setSelectedElements(new Set([newElement.id]));
    saveToHistory(newElements);
  };

  const updateElement = (id: string, updates: Partial<PosterElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const updateMultipleElements = (ids: string[], updates: Partial<PosterElement>) => {
    const newElements = elements.map(el => 
      ids.includes(el.id) ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedElement(null);
    setSelectedElements(new Set());
    saveToHistory(newElements);
  };

  const deleteSelectedElements = () => {
    const newElements = elements.filter(el => !selectedElements.has(el.id));
    setElements(newElements);
    setSelectedElement(null);
    setSelectedElements(new Set());
    saveToHistory(newElements);
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const duplicated = {
      ...element,
      id: Date.now().toString(),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: Math.max(...elements.map(el => el.zIndex), 0) + 1
    };

    const newElements = [...elements, duplicated];
    setElements(newElements);
    setSelectedElement(duplicated.id);
    setSelectedElements(new Set([duplicated.id]));
    saveToHistory(newElements);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    if (isMultiselect && e.ctrlKey) {
      // Multi-select mode
      const newSelected = new Set(selectedElements);
      if (newSelected.has(elementId)) {
        newSelected.delete(elementId);
      } else {
        newSelected.add(elementId);
      }
      setSelectedElements(newSelected);
      if (newSelected.size === 1) {
        setSelectedElement(Array.from(newSelected)[0]);
      } else {
        setSelectedElement(null);
      }
    } else {
      // Single select mode
      setSelectedElement(elementId);
      setSelectedElements(new Set([elementId]));
    }
    
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
    if (!isDragging || selectedElements.size === 0) return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;

    const newElements = elements.map(el => {
      if (selectedElements.has(el.id) && !el.isLocked) {
        return {
          ...el,
          x: Math.max(0, Math.min(500 - el.width, deltaX)),
          y: Math.max(0, Math.min(700 - el.height, deltaY))
        };
      }
      return el;
    });

    setElements(newElements);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (elements.some((el, index) => JSON.stringify(el) !== JSON.stringify(history[historyIndex]?.elements[index]))) {
      saveToHistory(elements);
    }
  };

  const bringToFront = (id: string) => {
    const maxZIndex = Math.max(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: maxZIndex + 1 });
  };

  const sendToBack = (id: string) => {
    const minZIndex = Math.min(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: minZIndex - 1 });
  };

  const alignElements = (alignment: 'left' | 'center' | 'right') => {
    if (selectedElements.size === 0) return;

    const selected = Array.from(selectedElements);
    const firstElement = elements.find(el => el.id === selected[0]);
    if (!firstElement) return;

    let newX = firstElement.x;
    
    if (alignment === 'center') {
      newX = 250 - (firstElement.width / 2);
    } else if (alignment === 'right') {
      newX = 500 - firstElement.width;
    }

    updateMultipleElements(selected, { x: newX });
  };

  const flipElement = (direction: 'horizontal' | 'vertical') => {
    if (selectedElement) {
      const newRotation = direction === 'horizontal' ? 180 : 0; // Simplified flip
      updateElement(selectedElement, { rotation: newRotation });
    }
  };

  const toggleVisibility = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, { isVisible: !element.isVisible });
    }
  };

  const toggleLock = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, { isLocked: !element.isLocked });
    }
  };

  const groupElements = () => {
    if (selectedElements.size < 2) return;
    
    // Create a group (for simplicity, we'll just adjust positions)
    const selected = Array.from(selectedElements);
    const groupX = Math.min(...selected.map(id => elements.find(el => el.id === id)?.x || 0));
    const groupY = Math.min(...selected.map(id => elements.find(el => el.id === id)?.y || 0));
    
    // In a real implementation, you'd create a group object
    // For now, we'll just log it
    console.log('Grouping elements:', selected);
  };

  const applyTemplate = (template: any) => {
    setBackgroundColor(template.backgroundColor);
    // In a real implementation, you'd set the template elements
  };

  const exportAsImage = () => {
    // Implementation for exporting canvas as image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // ... export logic
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  const getPatternStyle = () => {
    switch (pattern) {
      case 'dots':
        return { backgroundImage: `radial-gradient(#ccc 1px, transparent 1px)`, backgroundSize: '20px 20px' };
      case 'grid':
        return { backgroundImage: `linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)`, backgroundSize: '20px 20px' };
      case 'lines':
        return { backgroundImage: `repeating-linear-gradient(0deg, #ccc, #ccc 1px, transparent 1px, transparent 20px)` };
      case 'zigzag':
        return { backgroundImage: `linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(225deg, #ccc 25%, transparent 25%), linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(315deg, #ccc 25%, transparent 25%)`, backgroundSize: '20px 20px' };
      case 'polka':
        return { backgroundImage: `radial-gradient(#ccc 2px, transparent 2px)`, backgroundSize: '30px 30px' };
      case 'cross':
        return { backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`, backgroundSize: '20px 20px' };
      default:
        return {};
    }
  };

  const renderElement = (element: PosterElement) => {
    if (!element.isVisible) return null;

    const isSelected = selectedElements.has(element.id);
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      border: isSelected ? '2px dashed #3b82f6' : element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : '1px solid transparent',
      cursor: element.isLocked ? 'not-allowed' : 'move',
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      fontFamily: FONT_FAMILIES.find(f => f.id === element.fontFamily)?.value || 'inherit',
      textAlign: element.textAlign,
      color: element.color,
      backgroundColor: element.backgroundColor,
      borderRadius: element.borderRadius + 'px',
      opacity: element.opacity,
      zIndex: element.zIndex,
      boxShadow: element.shadow ? `${element.shadow.x}px ${element.shadow.y}px ${element.shadow.blur}px ${element.shadow.color}` : 'none',
      pointerEvents: element.isLocked ? 'none' : 'auto'
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center p-2 hover:shadow-lg transition-all"
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
            className="flex items-center justify-center overflow-hidden hover:shadow-lg transition-all"
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
            className="flex items-center justify-center bg-white p-2 hover:shadow-lg transition-all"
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
            className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all"
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
          borderRadius: element.content === 'circle' ? '50%' : 
                       element.content === 'triangle' ? '0' : element.borderRadius + 'px',
          clipPath: element.content === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                   element.content === 'line' ? 'none' : undefined,
          border: element.content === 'line' ? 'none' : style.border
        };
        return (
          <div
            key={element.id}
            style={shapeStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="hover:shadow-lg transition-all"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Design Poster
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Poster Designer - {shop.shop_name}</span>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMultiselect(!isMultiselect)}
                      className={isMultiselect ? "bg-blue-50 border-blue-200" : ""}
                    >
                      <MousePointer className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Multi-select mode {isMultiselect ? '(On)' : '(Off)'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Undo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                      <RotateCcw className="w-4 h-4 rotate-180" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Redo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Tools */}
          <div className="w-80 border-r overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="p-4 space-y-4">
                <h3 className="font-semibold">Choose a Template</h3>
                {TEMPLATES.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:border-primary">
                    <CardContent className="p-4" onClick={() => applyTemplate(template)}>
                      <div className="aspect-video rounded-lg mb-2" style={{ backgroundColor: template.backgroundColor }} />
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="elements" className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => addElement('text')} className="h-16 flex-col">
                    <Type className="w-4 h-4 mb-1" />
                    Text
                  </Button>
                  <Button variant="outline" onClick={() => addElement('image')} className="h-16 flex-col">
                    <Image className="w-4 h-4 mb-1" />
                    Image
                  </Button>
                  <Button variant="outline" onClick={() => addElement('qr')} className="h-16 flex-col">
                    <Layout className="w-4 h-4 mb-1" />
                    QR Code
                  </Button>
                  <Button variant="outline" onClick={() => addElement('shape', 'rectangle')} className="h-16 flex-col">
                    <Square className="w-4 h-4 mb-1" />
                    Shape
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Shapes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SHAPES.map(shape => (
                      <Button
                        key={shape.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addElement('shape', shape.id)}
                        className="h-12 flex-col"
                      >
                        <shape.icon className="w-4 h-4 mb-1" />
                        {shape.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="design" className="p-4 space-y-4">
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

                <div className="flex items-center justify-between">
                  <Label>Show Grid</Label>
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                </div>

                <div className="space-y-2">
                  <Label>Zoom: {Math.round(zoom * 100)}%</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
                      {Math.round(zoom * 100)}%
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="p-4">
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Toolbar */}
            <div className="border-b p-2">
              <div className="flex items-center gap-2">
                {selectedElements.size > 0 && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => deleteSelectedElements()}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Selected</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {selectedElements.size === 1 && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => duplicateElement(Array.from(selectedElements)[0])}>
                                <Copy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Duplicate</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => toggleLock(Array.from(selectedElements)[0])}>
                                <Lock className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lock/Unlock</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => toggleVisibility(Array.from(selectedElements)[0])}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Show/Hide</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => bringToFront(Array.from(selectedElements)[0])}>
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bring to Front</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => sendToBack(Array.from(selectedElements)[0])}>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send to Back</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => alignElements('left')}>
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Align Left</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => alignElements('center')}>
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Align Center</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => alignElements('right')}>
                            <AlignRight className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Align Right</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-100 overflow-auto p-8">
              <div
                ref={canvasRef}
                className="relative bg-white border-2 border-gray-300 rounded-lg mx-auto shadow-lg"
                style={{
                  width: '500px',
                  height: '700px',
                  backgroundColor: backgroundColor,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  ...getPatternStyle()
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid Overlay */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                      opacity: 0.3
                    }}
                  />
                )}

                {/* Elements */}
                {elements.sort((a, b) => a.zIndex - b.zIndex).map(renderElement)}
                
                {/* Empty State */}
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Start designing your poster</p>
                      <p className="text-sm">Add elements from the sidebar or choose a template</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          {selectedElementData && (
            <div className="w-80 border-l overflow-y-auto">
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Properties</h3>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => duplicateElement(selectedElementData.id)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleLock(selectedElementData.id)}>
                      {selectedElementData.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleVisibility(selectedElementData.id)}>
                      {selectedElementData.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          value={selectedElementData.fontSize}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={selectedElementData.fontFamily}
                          onValueChange={(value) => updateElement(selectedElementData.id, { fontFamily: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_FAMILIES.map(font => (
                              <SelectItem key={font.id} value={font.id}>
                                {font.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Alignment</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={selectedElementData.textAlign === 'left' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { textAlign: 'left' })}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={selectedElementData.textAlign === 'center' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { textAlign: 'center' })}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={selectedElementData.textAlign === 'right' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { textAlign: 'right' })}
                        >
                          <AlignRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Weight</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={selectedElementData.fontWeight === 'normal' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { fontWeight: 'normal' })}
                        >
                          Normal
                        </Button>
                        <Button
                          variant={selectedElementData.fontWeight === 'bold' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateElement(selectedElementData.id, { fontWeight: 'bold' })}
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <Input
                    type="color"
                    value={selectedElementData.color}
                    onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                  />
                </div>

                {(selectedElementData.type === 'shape' || selectedElementData.type === 'text') && (
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X Position</Label>
                    <Input
                      type="number"
                      value={selectedElementData.x}
                      onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Position</Label>
                    <Input
                      type="number"
                      value={selectedElementData.y}
                      onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {(selectedElementData.type === 'shape' || selectedElementData.type === 'text') && (
                  <>
                    <div className="space-y-2">
                      <Label>Border Width</Label>
                      <Slider
                        value={[selectedElementData.borderWidth || 0]}
                        onValueChange={([value]) => updateElement(selectedElementData.id, { borderWidth: value })}
                        max={10}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Border Color</Label>
                      <Input
                        type="color"
                        value={selectedElementData.borderColor}
                        onChange={(e) => updateElement(selectedElementData.id, { borderColor: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Border Radius</Label>
                      <Slider
                        value={[selectedElementData.borderRadius || 0]}
                        onValueChange={([value]) => updateElement(selectedElementData.id, { borderRadius: value })}
                        max={50}
                        step={1}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
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
            {elements.filter(el => el.isVisible).map((element) => {
              const style: React.CSSProperties = {
                position: 'absolute',
                left: element.x + 'px',
                top: element.y + 'px',
                width: element.width + 'px',
                height: element.height + 'px',
                fontSize: element.fontSize + 'px',
                fontWeight: element.fontWeight,
                fontFamily: FONT_FAMILIES.find(f => f.id === element.fontFamily)?.value || 'inherit',
                textAlign: element.textAlign,
                color: element.color,
                backgroundColor: element.backgroundColor,
                borderRadius: (element.borderRadius || 0) + 'px',
                opacity: element.opacity,
                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
              };

              switch (element.type) {
                case 'text':
                  return <div key={element.id} style={style} className="print-element print-text">{element.content}</div>;
                case 'image':
                  return (
                    <div key={element.id} style={style} className="print-element print-image">
                      <img src={element.content} alt="Poster element" />
                    </div>
                  );
                case 'qr':
                  return (
                    <div key={element.id} style={style} className="print-element print-qr">
                      <QRCodeSVG value={element.content} size={element.width - 16} level="H" includeMargin={true} />
                    </div>
                  );
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

// Missing icon components
const Minus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const Lock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Unlock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);
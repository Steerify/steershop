import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Printer, FileText, Plus, Trash2, Move, Type, Image, Layout, 
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

const PATTERNS = [
  { id: 'none', name: 'No Pattern' },
  { id: 'dots', name: 'Dots' },
  { id: 'grid', name: 'Grid' },
  { id: 'lines', name: 'Lines' },
  { id: 'zigzag', name: 'Zig Zag' },
];

export const StoreFlyerTemplate = ({ shop, products = [] }: StoreFlyerTemplateProps) => {
  const storeUrl = `${window.location.origin}/shop/${shop.shop_slug}`;
  const [elements, setElements] = useState<PosterElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('design');
  const [pattern, setPattern] = useState('none');
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

  // Canvas dimensions for different screen sizes
  const canvasDimensions = {
    desktop: { width: 500, height: 700 },
    mobile: { width: 300, height: 500 }
  };

  const currentCanvas = isMobile ? canvasDimensions.mobile : canvasDimensions.desktop;

  // Check mobile device and adjust elements on resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Adjust elements for mobile if needed
      if (mobile) {
        setElements(prev => prev.map(el => ({
          ...el,
          x: Math.min(el.x, canvasDimensions.mobile.width - el.width),
          y: Math.min(el.y, canvasDimensions.mobile.height - el.height)
        })));
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize with responsive template layout
  useEffect(() => {
    const getMobileLayout = () => {
      if (isMobile) {
        return [
          // Header Section - Mobile
          {
            id: '1',
            type: 'text',
            content: shop.shop_name,
            x: 20,
            y: 20,
            width: 260,
            height: 50,
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          {
            id: '2',
            type: 'text',
            content: shop.description || 'Welcome to our store!',
            x: 20,
            y: 75,
            width: 260,
            height: 35,
            fontSize: 12,
            color: '#6b7280',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          
          // QR Code Section - Centered for mobile
          {
            id: '3',
            type: 'qr',
            content: storeUrl,
            x: 90,
            y: 120,
            width: 120,
            height: 120,
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          {
            id: '4',
            type: 'text',
            content: 'Scan to Visit',
            x: 90,
            y: 250,
            width: 120,
            height: 25,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#3b82f6',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          
          // Contact Info - Stacked for mobile
          {
            id: '5',
            type: 'text',
            content: 'Contact Us',
            x: 20,
            y: 290,
            width: 260,
            height: 30,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          {
            id: '6',
            type: 'text',
            content: `WhatsApp: ${shop.whatsapp_number}`,
            x: 20,
            y: 325,
            width: 260,
            height: 20,
            fontSize: 12,
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          {
            id: '7',
            type: 'text',
            content: 'Website:',
            x: 20,
            y: 350,
            width: 260,
            height: 15,
            fontSize: 10,
            color: '#6b7280',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          {
            id: '8',
            type: 'text',
            content: storeUrl,
            x: 20,
            y: 365,
            width: 260,
            height: 30,
            fontSize: 9,
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          
          // Call to Action
          {
            id: '9',
            type: 'text',
            content: 'Shop Now & Get Special Offers!',
            x: 20,
            y: 405,
            width: 260,
            height: 30,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          {
            id: '10',
            type: 'text',
            content: 'Scan QR code to visit store',
            x: 20,
            y: 435,
            width: 260,
            height: 20,
            fontSize: 11,
            color: '#666666',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          
          // Footer
          {
            id: '11',
            type: 'text',
            content: `Thank you for choosing ${shop.shop_name}`,
            x: 20,
            y: 465,
            width: 260,
            height: 20,
            fontSize: 10,
            color: '#666666',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          }
        ];
      } else {
        return [
          // Header Section - Desktop
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
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          {
            id: '2',
            type: 'text',
            content: shop.description || 'Welcome to our store! Special offers available!',
            x: 50,
            y: 120,
            width: 400,
            height: 40,
            fontSize: 16,
            color: '#6b7280',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },
          
          // Left Column - QR Code Section
          {
            id: '3',
            type: 'qr',
            content: storeUrl,
            x: 50,
            y: 200,
            width: 180,
            height: 180,
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#3b82f6',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#666666',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          },

          // Right Column - Contact Info Section
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
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#6b7280',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#6b7280',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#1f2937',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#666666',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
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
            color: '#666666',
            opacity: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: 2
          }
        ];
      }
    };

    const initialElements = getMobileLayout();

    // Add logo if available
    if (shop.logo_url) {
      initialElements.push({
        id: 'logo',
        type: 'image',
        content: shop.logo_url,
        x: isMobile ? 220 : 400,
        y: isMobile ? 20 : 50,
        width: isMobile ? 60 : 80,
        height: isMobile ? 60 : 80,
        opacity: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
        zIndex: 2
      });
    }

    // Add decorative border
    initialElements.push({
      id: 'border',
      type: 'shape',
      content: 'rectangle',
      x: isMobile ? 10 : 30,
      y: isMobile ? 10 : 30,
      width: isMobile ? 280 : 440,
      height: isMobile ? 480 : 640,
      backgroundColor: 'transparent',
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      zIndex: 1
    });

    setElements(initialElements);
  }, [shop, storeUrl, isMobile]);

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
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      }, 1000);
    }, 500);
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
      pattern,
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
    setPattern(template.pattern);
    setElements(template.elements);
  };

  // Element management
  const addElement = (type: PosterElement['type'], content?: string) => {
    const newElement: PosterElement = {
      id: Date.now().toString(),
      type,
      content: content || (type === 'text' ? 'New Text' : ''),
      x: 50,
      y: 50,
      width: type === 'text' ? (isMobile ? 200 : 120) : (isMobile ? 80 : 100),
      height: type === 'text' ? (isMobile ? 30 : 40) : (isMobile ? 80 : 100),
      fontSize: type === 'text' ? (isMobile ? 12 : 16) : undefined,
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
      newElement.width = isMobile ? 100 : 120;
      newElement.height = isMobile ? 100 : 120;
    }

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const addProduct = (product: any) => {
    const newElement: PosterElement = {
      id: Date.now().toString(),
      type: 'product',
      content: product.name,
      x: 50,
      y: 50,
      width: isMobile ? 100 : 120,
      height: isMobile ? 140 : 160,
      productId: product.id,
      color: '#1f2937',
      fontSize: isMobile ? 10 : 12,
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

  // Drag and drop with responsive boundaries
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
      x: Math.max(0, Math.min(currentCanvas.width - (elements.find(el => el.id === selectedElement)?.width || 0), newX)),
      y: Math.max(0, Math.min(currentCanvas.height - (elements.find(el => el.id === selectedElement)?.height || 0), newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
              padding: isMobile ? '4px' : '8px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '6px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)',
              wordWrap: 'break-word',
              overflow: 'hidden'
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
            className="flex items-center justify-center overflow-hidden bg-white rounded-lg shadow-sm"
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
            className="flex items-center justify-center bg-white p-2 rounded-lg shadow-sm"
          >
            <QRCodeSVG
              value={element.content}
              size={Math.min(element.width, element.height) - (isMobile ? 16 : 24)}
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
            className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-3/4 object-cover mb-1 rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNUwxMiA5TDYgMTUiIHN0cm9rZT0iIzljYTNmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            )}
            <div className="text-center w-full" style={{ color: element.color, fontSize: element.fontSize }}>
              <div className="font-semibold truncate text-xs">{product?.name}</div>
              <div className="text-green-600 font-bold text-xs">₦{product?.price.toLocaleString()}</div>
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
        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}>
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
              {isMobile ? 'Mobile-optimized view' : 'Professional marketing flyer'}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Sidebar - Hidden on mobile when not active */}
          <div className={`${isMobile && activeTab === 'canvas' ? 'hidden' : 'w-full md:w-80'} space-y-4 overflow-y-auto p-4 border-r`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="design" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">
                  Design
                </TabsTrigger>
                <TabsTrigger value="elements" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">
                  Elements
                </TabsTrigger>
                <TabsTrigger value="products" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">
                  Products
                </TabsTrigger>
              </TabsList>

              {/* Design Tab Content */}
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
                        <Label className="text-xs">Background Pattern</Label>
                        <Select value={pattern} onValueChange={setPattern}>
                          <SelectTrigger className="text-xs">
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
                            className="w-full gap-2 border-dashed text-xs h-9"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Upload Background
                          </Button>
                          {backgroundImage && (
                            <div className="flex gap-2">
                              <Select value={backgroundSize} onValueChange={(value: any) => setBackgroundSize(value)}>
                                <SelectTrigger className="text-xs h-9">
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
                                className="text-red-600 hover:text-red-700 h-9"
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
                          className="w-full gap-2 border-dashed text-xs h-9"
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
                          className="w-full gap-2 text-xs h-9"
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

              {/* Elements Tab Content */}
              <TabsContent value="elements" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Add Elements</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('text')} 
                          className="h-16 flex-col gap-1 hover:bg-blue-50 hover:border-blue-200 transition-colors text-xs"
                        >
                          <Type className="w-5 h-5 text-blue-600" />
                          <span>Text</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('image')} 
                          className="h-16 flex-col gap-1 hover:bg-green-50 hover:border-green-200 transition-colors text-xs"
                        >
                          <Image className="w-5 h-5 text-green-600" />
                          <span>Image</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('qr')} 
                          className="h-16 flex-col gap-1 hover:bg-purple-50 hover:border-purple-200 transition-colors text-xs"
                        >
                          <Layout className="w-5 h-5 text-purple-600" />
                          <span>QR Code</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => addElement('shape', 'rectangle')} 
                          className="h-16 flex-col gap-1 hover:bg-orange-50 hover:border-orange-200 transition-colors text-xs"
                        >
                          <Palette className="w-5 h-5 text-orange-600" />
                          <span>Shape</span>
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
                            className="h-10 text-xs gap-2 justify-start"
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

                      {/* Element editing controls remain the same but with responsive sizing */}
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

              {/* Products Tab Content */}
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
                <h3 className="font-semibold text-lg">
                  {isMobile ? 'Mobile Flyer Template' : 'Professional Flyer Template'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isMobile 
                    ? 'Optimized for mobile viewing and printing'
                    : 'Pre-designed layout with QR code and contact information'
                  }
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-background rounded-lg p-1 border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoom(z => Math.max(isMobile ? 0.3 : 0.5, z - 0.1))}
                    disabled={zoom <= (isMobile ? 0.3 : 0.5)}
                    className="h-8 w-8"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-sm w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoom(z => Math.min(isMobile ? 1.5 : 2, z + 0.1))}
                    disabled={zoom >= (isMobile ? 1.5 : 2)}
                    className="h-8 w-8"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
                <Button onClick={handleDownload} variant="outline" className="gap-2 h-9 text-xs">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={handlePrint} className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs">
                  <Printer className="w-4 h-4" />
                  Print Flyer
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 flex items-center justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white border-2 border-gray-200 rounded-xl shadow-lg"
                style={{
                  width: `${currentCanvas.width}px`,
                  height: `${currentCanvas.height}px`,
                  backgroundColor,
                  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                  backgroundSize,
                  backgroundRepeat: backgroundSize === 'repeat' ? 'repeat' : 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  ...getPatternStyle(),
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
                      <h4 className="font-semibold mb-2">
                        {isMobile ? 'Mobile Flyer Template' : 'Professional Flyer Template'}
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {isMobile
                          ? 'Optimized layout for mobile devices'
                          : 'Pre-designed layout with QR code, contact info, and call-to-action'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
            {elements.sort((a, b) => a.zIndex - b.zIndex).map((element) => {
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
                opacity: element.opacity,
                transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                zIndex: element.zIndex,
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
                    clipPath: element.content === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                              element.content === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined
                  };
                  return <div key={element.id} style={shapeStyle} className="print-element" />;
                default:
                  return null;
              }
            })}
          </div>
        </div>

        {/* Mobile Toolbar */}
        {isMobile && <MobileToolbar />}
      </DialogContent>
    </Dialog>
  );
};
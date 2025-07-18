
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Download, Printer, Ticket, Loader2, ArrowRight } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Sticker } from "@/components/sticker";

const formSchema = z.object({
  sku: z.string().min(1, { message: "SKU is required." }),
  regularPrice: z.coerce.number().min(0, { message: "Price must be positive." }),
  salePrice: z.coerce.number().optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }).max(100, { message: "Max 100 stickers at a time." }),
});

type StickerData = z.infer<typeof formSchema>;

export default function StickerPressPage() {
  const [stickers, setStickers] = React.useState<StickerData[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const stickerSheetRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<StickerData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      regularPrice: "" as any,
      salePrice: "" as any,
      quantity: 1,
    },
  });

  function onSubmit(data: StickerData) {
    const newStickers = Array(data.quantity).fill({
      sku: data.sku,
      regularPrice: data.regularPrice,
      salePrice: data.salePrice,
    });
    setStickers(newStickers);
  }

  const handlePrint = () => {
    if (!stickerSheetRef.current || stickers.length === 0) {
      toast({
        variant: "destructive",
        title: "No stickers to print",
        description: "Please generate some stickers first.",
      });
      return;
    }

    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Stickers</title>');
      printWindow.document.write(`
        <style>
          @page {
            size: 38mm 25mm;
            margin: 0;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .sticker-container {
            width: 38mm;
            height: 25mm;
            box-sizing: border-box;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            padding: 2mm 0;
            background-color: white;
            color: black;
            overflow: hidden;
            font-family: sans-serif;
          }
          .sku-container, .price-container {
            flex: 0 1 auto;
          }
          .barcode-container {
            flex: 1 1 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
          }
          .sku-text {
            font-size: 8pt;
            font-family: monospace;
          }
          .barcode-svg-container {
            width: 90%;
            height: 8mm;
          }
          .barcode-svg-container svg {
             width: 100%;
             height: 100%;
          }
          .price-text {
            font-size: 10pt;
            font-weight: bold;
            line-height: 1;
          }
          .regular-price-strikethrough {
            position: relative;
            display: inline-block;
            font-size: 8pt;
            color: #555;
            margin-right: 4px;
          }
          .regular-price-strikethrough::after {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            right: 0;
            border-top: 1px solid #000;
            transform: translateY(-50%);
          }
        </style>
      `);
      printWindow.document.write('</head><body>');
      const stickerSheetContent = stickerSheetRef.current.innerHTML;
      printWindow.document.write(stickerSheetContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    } else {
      toast({
        variant: "destructive",
        title: "Could not open print window",
        description: "Please disable your pop-up blocker and try again.",
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!stickerSheetRef.current || stickers.length === 0) {
      toast({
        variant: "destructive",
        title: "No stickers to download",
        description: "Please generate some stickers first.",
      });
      return;
    }
  
    setIsGeneratingPdf(true);
  
    try {
      const stickerData = stickers[0];
      const stickerWidth = 38;
      const stickerHeight = 25;
      const orientation = 'l'; // 'l' for landscape
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [stickerWidth, stickerHeight]
      });
      
      // Since all stickers are the same, we can render one and reuse the barcode image
      const firstStickerElement = stickerSheetRef.current?.querySelector('.sticker-container');
      const barcodeElement = firstStickerElement?.querySelector('.barcode-svg-container svg');
      
      if (!barcodeElement) {
        throw new Error("Barcode element not found");
      }
      
      const canvas = await html2canvas(barcodeElement.parentElement as HTMLElement, {
        scale: 3,
        backgroundColor: null,
      });
      const barcodeImgData = canvas.toDataURL('image/png');

      for (let i = 0; i < stickers.length; i++) {
        if (i > 0) {
          pdf.addPage([stickerWidth, stickerHeight], orientation);
        }

        // SKU
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(`SKU: ${stickerData.sku}`, stickerWidth / 2, 4.5, { align: 'center' });

        // Barcode
        const barcodeWidth = stickerWidth * 0.9; 
        const barcodeHeight = 8;
        const barcodeX = (stickerWidth - barcodeWidth) / 2;
        const barcodeY = (stickerHeight - barcodeHeight) / 2;
        pdf.addImage(barcodeImgData, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);
        
        // Price
        const finalSalePrice = typeof stickerData.salePrice === 'number' && stickerData.salePrice > 0 ? stickerData.salePrice : undefined;
        const priceY = 21.5;
        
        if (finalSalePrice) {
          const regularPriceString = stickerData.regularPrice.toLocaleString();
          const salePriceString = `${finalSalePrice.toLocaleString()}/-`;
          const mrpString = `MRP: `;

          // Calculate widths for centering
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          const mrpWidth = pdf.getStringUnitWidth(mrpString) * pdf.getFontSize() / pdf.internal.scaleFactor;
          const regularPriceWidth = pdf.getStringUnitWidth(regularPriceString) * pdf.getFontSize() / pdf.internal.scaleFactor;
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          const salePriceWidth = pdf.getStringUnitWidth(salePriceString) * pdf.getFontSize() / pdf.internal.scaleFactor;
          
          const totalWidth = mrpWidth + regularPriceWidth + 2 + salePriceWidth;
          let currentX = (stickerWidth - totalWidth) / 2;

          // Draw MRP
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.text(mrpString, currentX, priceY, { baseline: 'middle' });
          currentX += mrpWidth;

          // Draw Regular Price
          pdf.text(regularPriceString, currentX, priceY, { baseline: 'middle' });
          
          // Draw strikethrough
          const lineY = priceY;
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.3);
          pdf.line(currentX, lineY, currentX + regularPriceWidth, lineY);
          currentX += regularPriceWidth + 2;

          // Draw Sale Price
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.text(salePriceString, currentX, priceY, { baseline: 'middle' });

        } else {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.text(`MRP: ${stickerData.regularPrice.toLocaleString()}/-`, stickerWidth / 2, priceY, { align: 'center', baseline: 'middle' });
        }
      }
  
      pdf.save('stickers.pdf');
  
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "Something went wrong while creating the PDF.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              StickerPress
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Generate and print your product stickers with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            <div className="mx-auto w-full max-w-xl">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>
                    Enter the product info to create stickers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU / Product Code</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., TSHIRT-BLK-L" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="regularPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Regular Price</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="500" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="salePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sale Price (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="400" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} value={field.value ?? 1} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        <Ticket className="mr-2 h-4 w-4" />
                        Generate Stickers
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Sticker Preview</h2>
                {stickers.length > 0 && (
                   <div className="flex items-center gap-2">
                    <Button onClick={handlePrint} variant="outline">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                      {isGeneratingPdf ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </div>
                )}
              </div>
              <Separator className="mb-6" />
              
              <div
                id="sticker-sheet"
                ref={stickerSheetRef}
                className="bg-gray-200 rounded-lg p-2 min-h-[200px] flex flex-row flex-wrap gap-2 items-start content-start justify-center border-dashed border-2 border-muted-foreground/30"
              >
                {stickers.length > 0 ? (
                  stickers.map((sticker, index) => (
                    <Sticker
                      key={index}
                      sku={sticker.sku}
                      regularPrice={sticker.regularPrice as number}
                      salePrice={sticker.salePrice as number | undefined}
                    />
                  ))
                ) : (
                  <div className="w-full text-center py-16 text-muted-foreground">
                    <p>Your generated stickers will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center bg-accent/20 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-accent-foreground">
              Ready to Automate Your E-commerce Business?
            </h3>
            <p className="mt-2 text-muted-foreground">
              For custom e-commerce automation solutions and website development, feel free to reach out. Let's build something great together.
            </p>
            <a href="https://riaz.com.bd/contact" target="_blank" rel="noopener noreferrer">
              <Button className="mt-6">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} <a href="https://commercians.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">COMMERCIANS</a>. All rights reserved.
            </p>
            <p className="mt-2 sm:mt-0">
              Developed by <a href="https://riaz.com.bd" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">Mahmudul Hasan Riaz</a>.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

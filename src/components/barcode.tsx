"use client";

import React, { useRef, useEffect } from 'react';
import type { Options } from 'jsbarcode';

declare global {
  interface Window {
    JsBarcode?: (element: any, data: string, options?: Options) => void;
  }
}

interface BarcodeProps {
  value: string;
}

export function Barcode({ value }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && window.JsBarcode) {
      try {
        window.JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          displayValue: false,
          width: 1.5,
          height: 40,
          margin: 0,
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }
  }, [value]);

  return <svg ref={svgRef} className="w-full h-auto" />;
};

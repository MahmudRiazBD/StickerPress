
"use client";

import { Barcode } from './barcode';

interface StickerProps {
  sku: string;
  regularPrice: number;
  salePrice?: number | string;
}

export function Sticker({ sku, regularPrice, salePrice }: StickerProps) {
  const finalSalePrice = typeof salePrice === 'number' && salePrice > 0 ? salePrice : undefined;

  return (
    <div
      className="sticker-container"
      style={{
        width: '38mm',
        height: '25mm',
        border: '1px solid #ccc',
        backgroundColor: 'white',
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1mm 0',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <div className="sku-container" style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          className="sku-text"
          style={{ 
            fontSize: '8pt', 
            fontFamily: 'monospace',
          }}
        >
          SKU: {sku}
        </div>
      </div>
      
      <div className="barcode-container" style={{ flex: '1 1 0%', width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          className="barcode-svg-container"
          style={{ 
            width: '100%', 
            height: '8mm',
          }}
        >
          <Barcode value={sku} />
        </div>
      </div>
      
      <div className="price-container" style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          className="price-text"
          style={{ 
            fontSize: '10pt', 
            fontWeight: 'bold',
            lineHeight: 1,
          }}
        >
          <span>MRP: </span>
          {finalSalePrice ? (
            <>
              <span 
                className="regular-price-strikethrough"
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  fontSize: '8pt',
                  color: '#555',
                  marginRight: '4px'
                }}
              >
                 <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    right: 0,
                    borderTop: '1px solid #000',
                    transform: 'translateY(0%)',
                    width: '100%'
                 }}></span>
                {regularPrice.toLocaleString()}
              </span>
              <span className="sale-price">{finalSalePrice.toLocaleString()}/-</span>
            </>
          ) : (
            <span>{regularPrice.toLocaleString()}/-</span>
          )}
        </div>
      </div>
    </div>
  );
}

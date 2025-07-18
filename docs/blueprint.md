# **App Name**: StickerPress

## Core Features:

- Product Input Form: Input form for SKU, Regular Price, Sale Price, and Quantity.
- Sticker Generation: Generates individual sticker elements based on the entered quantity, incorporating the SKU barcode and price information.
- Barcode Generation with Tool: Uses JsBarcode library to generate CODE128 barcodes from the SKU. Generative tool makes decision if the product has sale price and generates the output text for that contingency
- Print Preview: Provides a print-optimized view of the generated stickers for thermal printers (3x4 cm).
- Print Stickers: Opens the browser’s print dialog, formatted for thermal label printing.
- Download PDF: Generates and allows download of a PDF file containing the sticker layout.

## Style Guidelines:

- Primary color: Soft blue (#77B5FE), reminiscent of printing and labels, to give a sense of reliability. It will also contrast well with the likely background, which is typically white for sticker printing.
- Background color: Very light blue (#F0F8FF), nearly white, for a clean and professional appearance.
- Accent color: Light green (#B0E37D), which creates a contrast and aligns to the analogous color palette and invokes the feeling of reliability.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text, which creates a clean and modern reading experience
- Simple, outline-style icons for buttons to maintain a clean interface.
- Clean, single-column layout optimized for form input and sticker preview, focusing on a print-friendly design.
- Subtle transition animations on button hover states to provide feedback without being distracting.
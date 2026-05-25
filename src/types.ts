export interface CodeDecomposition {
  prefix: string;
  category: string;
  subCategory: string;
  abbr: string;
  temp: string;
  shelfLife: string;
  seq: string;
}

export interface GeneratedSKUDetails {
  sku: string;
  categoryName: string;
  subCategoryName: string;
  temperatureLabel: string;
  shelfLifeExplanation: string;
  allergens: string[];
  codeDecomposition: CodeDecomposition;
  handlingInstructions: string;
}

export interface DecodedSKUDetails {
  isValid: boolean;
  errorReason: string;
  category: string;
  subCategory: string;
  productNameGuess: string;
  temperatureReq: string;
  shelfLifeDays: number;
  allergensWarning: string;
  operationalTips: string;
}

export interface SavedRTEProduct {
  id: string;
  name: string;
  sku: string;
  pluCode?: string; // PLU code for quick cash register scanning
  category: string;
  subCategory: string;
  temp: string;
  shelfLife: number;
  seq: string;
  createdAt: string;
  notes?: string;
  allergens?: string[];
  handlingInstructions?: string;
}

export interface CategoryOption {
  code: string;
  name: string;
  description: string;
}

export interface SubCategoryOption {
  code: string;
  name: string;
  categoryCode: string;
}

export interface TempOption {
  code: string;
  name: string;
  tempRange: string;
  color: string;
}

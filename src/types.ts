export interface FeatureImportance {
  feature: string;
  impact: number;
}

export interface ScanResult {
  id: number;
  date: string;
  prediction: "benign" | "malignant";
  confidence: number;
  risk: number;
  biRads: number;
  guidance: string;
  causes: string[];
  precautions: string[];
  recommendedActions: string[];
  image: string;
  heatmapDescription: string;
  featureImportance: FeatureImportance[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

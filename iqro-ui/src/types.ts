export interface IqroContentItem {
  order_id: number;
  position: {
    row: number;
    col: number;
  };
  latin: string;
  arabic: string;
}

export interface IqroPageData {
  level_id: number;
  level_title: string;
  topic?: {
    latin: string;
    arab: string;
  };
  instruction_id?: string;
  instruction_en?: string;
  instruction_ar?: string;
  content: IqroContentItem[];
}

export interface LevelInfo {
  id: number;
  title: string;
  pagesCount: number;
  pages: number[];
}

export interface OcrEngineInfo {
  id: string;
  name: string;
}

export interface IqroManifest {
  ocrEngines?: OcrEngineInfo[];
  levels: LevelInfo[];
}

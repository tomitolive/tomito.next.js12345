import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "data", "content");

export interface ContentData {
  id: string | number;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  genres?: any[];
  ai_content?: {
    intro?: string;
    desc_ar?: string;
    meta_desc?: string;
    outro?: string;
    opinion?: string;
    faq?: any[];
    keywords?: string;
  };
}

/**
 * Fetches content from local JSON store. 
 * This is where the Python bot writes its results.
 */
export async function getLocalContent(id: string): Promise<ContentData | null> {
  const filePath = path.join(CONTENT_DIR, `${id}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading local content for ${id}:`, error);
    return null;
  }
}

/**
 * Save content to local store. 
 * Can be used by API routes if we want to bridge Python and Next.js.
 */
export async function saveLocalContent(id: string, data: ContentData) {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const filePath = path.join(CONTENT_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

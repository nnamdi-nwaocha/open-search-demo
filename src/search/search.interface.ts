export type SearchParams = {
    q?: string;
    phrase?: string;
    tags?: string[];
    category?: string;
    featured?: boolean;
    sort?: '_score' | 'recent' | 'views';
    page?: number;
    pageSize?: number;
  };
  
  export interface QueryClause {
    multi_match?: {
      query: string;
      fields: string[];
      fuzziness?: string;
      operator?: string;
      type?: string;
      slop?: number;
    };
    bool?: {
      should: QueryClause[];
    };
    terms?: {
      [key: string]: string[];
    };
    term?: {
      [key: string]: string | boolean;
    };
  }
  
  
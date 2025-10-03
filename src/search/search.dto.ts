import { IsString, IsArray, IsNumber, IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsIn, Min, Max } from 'class-validator';

export class SearchParamsDTO {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  phrase?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsIn(['_score', 'recent', 'views'])
  sort?: '_score' | 'recent' | 'views';

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

export class DocumentDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsDateString()
  publishedAt: string;

  @IsNumber()
  views: number;

  @IsBoolean()
  isFeatured: boolean;
}

export interface SearchHit {
  id: string;
  score: number | null;
  title: string;
  tags: string[];
  category: string;
  publishedAt: string;
  views: number;
  highlight?: {
    title?: string[];
    body?: string[];
  };
}

export interface SearchResponse {
  total: number;
  hits: SearchHit[];
}


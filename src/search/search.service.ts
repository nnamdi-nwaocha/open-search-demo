import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { Search_Response } from '@opensearch-project/opensearch/api/_core/search';
import { DocumentDTO, SearchResponse, SearchHit } from './search.dto';
import { SearchParams, QueryClause } from './search.interface';
import { ConfigService } from '@nestjs/config';
import { TotalHits } from '@opensearch-project/opensearch/api/_types/_core.search';

@Injectable()
export class SearchService {
    private readonly indexAlias: string;
 
    constructor(private readonly os: Client, private readonly cfg: ConfigService) {
      this.indexAlias = this.cfg.getOrThrow<string>('OPENSEARCH_INDEX_ALIAS');
    }
 
    // Search
    async search(params: SearchParams): Promise<SearchResponse> {
        try {
          const {
            q,
            phrase,
            tags,
            category,
            featured,
            sort = 'relevance',
            page = 1,
            pageSize = 10,
          } = params;
       
          const should: QueryClause[] = [];
          const filter: QueryClause[] = [];
       
          if (q) {
            should.push({
              multi_match: {
                query: q,
                fields: ['title^3', 'body', 'tags^2'],
                fuzziness: 'AUTO',
                operator: 'and',
              },
            });
          }
         
          if (phrase) {
            should.push({
              multi_match: {
                query: phrase,
                type: "phrase",
                fields: ['title^2', 'body'],
                slop: 2,
              },
            });
          }
       
          if (tags?.length) filter.push({ terms: { tags } });
          if (category) filter.push({ term: { category } });
          if (featured !== undefined) filter.push({ term: { isFeatured: featured } });
       
          const sortClause =
            sort === 'recent' ? [{ publishedAt: 'desc' }] :
            sort === 'views'  ? [{ views: 'desc' }] :
                                ['_score'];
       
          const size = pageSize ?? 10;
          // Convert page number to OpenSearch offset (from)
          const from = ((page ?? 1) - 1) * size;
    
          const queryBody = { bool: { filter, should } };
    
          const body: Record<string, unknown> = {
            query: queryBody,
            sort: sortClause,
            from,
            size,
            track_total_hits: true,
            _source: ['id', 'title', 'tags', 'category', 'publishedAt', 'views'],
            highlight: {
              pre_tags: ['<mark>'],
              post_tags: ['</mark>'],
              fields: { title: {}, body: {} },
            },
          };
       
          const res: Search_Response = await this.os.search({ index: this.indexAlias, body });
          const raw = res?.body ?? {};
          const totalRaw = raw?.hits?.total as TotalHits;
          const total = totalRaw.value;
       
          const hits = raw?.hits?.hits ?? [];
          const items: SearchHit[] = hits
            .map((h) => {
              const src = h?._source;
              if (!src) throw new Error('Hit missing _source');
              return {
                id: src.id,
                score: h?._score as number,
                title: src.title,
                tags: src.tags,
                category: src.category,
                publishedAt: src.publishedAt,
                views: src.views,
                ...(h?.highlight && { highlight: h.highlight }),
              };
            })
       
          return { total, hits: items };
        } catch (error) {
          throw new InternalServerErrorException('Search operation failed. Please try again later.');
        }
      }
    

    // Upsert document
    async indexDocument(doc: DocumentDTO): Promise<void> {
        try {
        await this.os.index({
            index: this.indexAlias,
            id: doc.id,
            body: doc,
            refresh: 'wait_for'
        });
        } catch (error) {
        throw new InternalServerErrorException('Failed to index document. Please try again later.');
        }
    }

    // Delete document
    async removeDocument(id: string): Promise<void> {
        try {
        await this.os.delete({
            index: this.indexAlias,
            id,
            refresh: 'wait_for'
        });
        } catch (error) {
        throw new InternalServerErrorException('Failed to remove document. Please try again later.');
        }
    }

    // Delete all documents
    async deleteAllDocuments(): Promise<void> {
        try {
        await this.os.deleteByQuery({
            index: this.indexAlias,
            body: {
            query: {
                match_all: {}
            }
            },
            refresh: true,
        });
        } catch (error) {
        throw new InternalServerErrorException('Failed to delete all documents. Please try again later.');
        }
    }
}




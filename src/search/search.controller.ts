import { Controller, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { SearchService } from './search.service';
import { DocumentDTO, SearchParamsDTO, SearchResponse } from './search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Post('/query')
  find(@Body() query: SearchParamsDTO): Promise<SearchResponse> {
    return this.search.search(query);
  }

  @Put('/upsert')
  upsertDocument(@Body() document: DocumentDTO) {
    return this.search.indexDocument(document);
  }

  @Delete('/delete/:id')
  removeDocument(@Param('id') id: string) {
    return this.search.removeDocument(id);
  }

  @Delete('/delete-all')
  deleteAllDocuments() {
    return this.search.deleteAllDocuments();
  }
}


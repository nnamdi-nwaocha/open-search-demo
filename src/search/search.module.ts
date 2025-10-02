import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: Client,
      useFactory: (cfg: ConfigService) => {
        const node = cfg.getOrThrow<string>('OPENSEARCH_NODE');
        const username = cfg.getOrThrow<string>('OPENSEARCH_USERNAME');
        const password = cfg.getOrThrow<string>('OPENSEARCH_PASSWORD');

        return new Client({
          node,
          auth: {
            username,
            password,
          },
          ssl: {
            rejectUnauthorized: false,
          },
        });
      },
      inject: [ConfigService],
    },
    SearchService,
  ],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}


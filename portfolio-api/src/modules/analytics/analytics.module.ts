import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PageView, PageViewSchema } from './schemas/pageview.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PageView.name, schema: PageViewSchema }])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

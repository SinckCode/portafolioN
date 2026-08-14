import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';

@Module({
  imports: [PostsModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}

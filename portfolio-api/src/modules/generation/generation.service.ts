import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PostsService } from '../posts/posts.service';
import { PostStatus } from '../posts/schemas/post.schema';
import { GenerateBlogDto } from './dto/generate-blog.dto';

interface GeneratedContent {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly postsService: PostsService,
  ) {}

  async generateBlogPost(dto: GenerateBlogDto, authorId: string) {
    const apiKey = this.configService.get<string>('generation.anthropicApiKey');
    if (!apiKey) {
      throw new BadRequestException(
        'ANTHROPIC_API_KEY no configurada. Agrega la variable de entorno.',
      );
    }

    this.logger.log(`Generating blog post for topic: "${dto.topic}"`);

    const generated = await this.generateContent(dto, apiKey);

    const post = await this.postsService.create(
      {
        title: generated.title,
        slug: generated.slug,
        excerpt: generated.excerpt,
        content: generated.content,
        contentFormat: 'html',
        tags: generated.tags,
        status: PostStatus.DRAFT,
        seo: {
          metaTitle: generated.seoTitle,
          metaDescription: generated.seoDescription,
          metaKeywords: generated.tags,
        },
      },
      authorId,
    );

    this.logger.log(`Blog post generated as draft: "${generated.title}" (${post._id})`);
    return post;
  }

  private async generateContent(
    dto: GenerateBlogDto,
    apiKey: string,
  ): Promise<GeneratedContent> {
    const anthropic = new Anthropic({ apiKey });
    const language = dto.language || 'es';
    const style = dto.style || 'guide';
    const keywordsHint = dto.targetKeywords?.length
      ? `Integra naturalmente estas keywords: ${dto.targetKeywords.join(', ')}.`
      : '';

    const prompt = `Genera un artículo de blog completo sobre: "${dto.topic}"

Estilo: ${style}
Idioma: ${language === 'es' ? 'Español' : 'English'}
${keywordsHint}

INSTRUCCIONES:
- El contenido debe ser HTML válido (NO markdown)
- Usa h2 y h3 para secciones (NO h1, el título va aparte)
- Incluye párrafos informativos y bien desarrollados
- Si aplica, incluye bloques de código con <pre><code class="language-LANG">...</code></pre>
- Puedes usar <div class="callout callout--info" data-callout-type="info">...</div> para notas importantes
- Usa listas <ul>/<ol> cuando sea apropiado
- El contenido debe tener entre 800 y 1500 palabras
- Genera un slug URL-friendly derivado del título
- El excerpt debe ser de 1-2 oraciones (máximo 155 caracteres)
- Genera 3-5 tags relevantes
- Genera metaTitle (max 60 chars) y metaDescription (max 155 chars) optimizados para SEO

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin \`\`\`):
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["tag1", "tag2", ...],
  "seoTitle": "...",
  "seoDescription": "..."
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      message.content[0].type === 'text' ? message.content[0].text : '';

    try {
      // Extraer JSON incluso si viene envuelto en ```json
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta');
      }
      return JSON.parse(jsonMatch[0]) as GeneratedContent;
    } catch (err) {
      this.logger.error('Failed to parse AI response', text);
      throw new BadRequestException(
        'Error al procesar la respuesta de la IA. Intenta de nuevo.',
      );
    }
  }
}

import type {
  ArticlePackageGeneratorInput,
  ArticlePackageGeneratorResult,
} from "@/lib/articlePackageContract";

/**
 * Provider-neutral contract for generating a prepared article package.
 *
 * Implementations may use any server-side generation provider, but they must:
 * - return a version 3 package;
 * - choose blog-to-blog links only from input.existingArticles;
 * - use only approved fixed site pages for commercial/site links;
 * - generate a draft package only, never publish or schedule an article.
 */
export interface ArticlePackageGenerator {
  generate(input: ArticlePackageGeneratorInput): Promise<ArticlePackageGeneratorResult>;
}

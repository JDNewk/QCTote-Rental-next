CREATE TABLE "prepared_article_packages" (
  "id" TEXT NOT NULL,
  "plan_slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "package_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "prepared_article_packages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "prepared_article_packages_plan_slug_key"
ON "prepared_article_packages"("plan_slug");
import { components } from "@/lib/velite-content";
import { MDXContent } from "@/components/mdx-components";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface ComponentPageProps {
  params: { slug: string[] };
}

async function getComponentFromParams(params: ComponentPageProps["params"]) {
  const slug = params?.slug.join("/");
  const component = components.find(
    (component) => component.slugAsParams === slug
  );

  return component;
}

export async function generateMetadata({
  params,
}: ComponentPageProps): Promise<Metadata> {
  const component = await getComponentFromParams(params);

  if (!component) {
    return {};
  }

  const ogSearchParams = new URLSearchParams();
  ogSearchParams.set("title", component.title);

  return {
    title: component.title,
    description: component.description,
    authors: { name: siteConfig.author },
    openGraph: {
      title: component.title,
      description: component.description,
      type: "article",
      url: component.slug,
      images: [
        {
          url: `/api/og?${ogSearchParams.toString()}`,
          width: 1200,
          height: 630,
          alt: component.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: component.title,
      description: component.description,
      images: [`/api/og?${ogSearchParams.toString()}`],
    },
  };
}

export async function generateStaticParams(): Promise<
  ComponentPageProps["params"][]
> {
  return components.map((component) => ({
    slug: component.slugAsParams.split("/"),
  }));
}

export default async function ComponentPage({ params }: ComponentPageProps) {
  const component = await getComponentFromParams(params);

  if (!component || !component.published) {
    return notFound();
  }

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <article className="prose prose-invert max-w-none px-6 py-10 lg:px-10">
        <MDXContent code={component.body} />
      </article>
    </div>
  );
}

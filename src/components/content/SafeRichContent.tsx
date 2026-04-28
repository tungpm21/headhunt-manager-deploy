import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";
import { normalizeSafeHtmlEmbeds } from "@/lib/content-blocks";

type SafeRichContentProps = {
  content: string;
  allowHtml?: boolean;
  className?: string;
};

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "section",
    "article",
    "figure",
    "figcaption",
    "iframe",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...((defaultSchema.attributes?.a as string[] | undefined) ?? []),
      "target",
      "rel",
    ],
    img: [
      ...((defaultSchema.attributes?.img as string[] | undefined) ?? []),
      "loading",
      "width",
      "height",
    ],
    iframe: [
      "src",
      "title",
      "loading",
      "allow",
      "allowFullScreen",
      "allowfullscreen",
      "width",
      "height",
      "referrerPolicy",
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto", "tel"],
    src: ["http", "https"],
  },
};

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return getNodeText(node.props.children);
  return "";
}

function createHeadingAnchor(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug ? `section-${slug}` : "";
}

const components: Components = {
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  h2: ({ children, ...props }) => {
    const explicitId = typeof props.id === "string" ? props.id : "";
    const headingId = explicitId || createHeadingAnchor(getNodeText(children));

    return (
      <h2 {...props} id={headingId || undefined}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const explicitId = typeof props.id === "string" ? props.id : "";
    const headingId = explicitId || createHeadingAnchor(getNodeText(children));

    return (
      <h3 {...props} id={headingId || undefined}>
        {children}
      </h3>
    );
  },
  img: ({ alt, src, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={src ?? ""} loading="lazy" {...props} />
  ),
  iframe: ({ src, title, ...props }) => (
    <span className="my-6 block overflow-hidden rounded-2xl border border-gray-200 bg-black">
      <iframe
        src={src}
        title={title ?? "Video"}
        className="aspect-video w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        {...props}
      />
    </span>
  ),
};

export function SafeRichContent({ content, allowHtml = false, className = "" }: SafeRichContentProps) {
  const source = allowHtml ? normalizeSafeHtmlEmbeds(content) : content;
  const rehypePlugins: PluggableList = allowHtml
    ? [rehypeRaw, [rehypeSanitize, sanitizeSchema]]
    : [[rehypeSanitize, sanitizeSchema]];

  return (
    <div
      className={`rich-content max-w-none leading-7 [&_a]:font-semibold [&_a]:text-[var(--color-fdi-primary)] [&_a]:underline-offset-4 [&_a:hover]:underline [&_blockquote]:my-5 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-fdi-primary)] [&_blockquote]:bg-sky-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:scroll-mt-28 [&_h3]:text-xl [&_h3]:font-bold [&_hr]:my-8 [&_img]:my-5 [&_img]:rounded-2xl [&_img]:border [&_img]:border-gray-100 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-gray-950 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-bold [&_table]:my-5 [&_table]:w-full [&_table]:overflow-hidden [&_td]:border [&_td]:border-gray-200 [&_td]:p-3 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:p-3 [&_th]:text-left [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

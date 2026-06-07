import { JsonLd } from "@/components/seo/json-ld";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function StructuredData({ data }: JsonLdProps) {
  return <JsonLd data={data} />;
}

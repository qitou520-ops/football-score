import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function LeaguePage({ params }: Props) {
  const { id } = await params;
  redirect(`/league/${id}/standings`);
}

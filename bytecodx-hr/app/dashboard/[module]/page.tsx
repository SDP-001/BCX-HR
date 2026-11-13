import { redirect } from "next/navigation";

export default async function LegacyHrModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  redirect(`/portal/${slug}`);
}

import { redirect } from "next/navigation";

export default async function PathsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  if (subject) redirect(`/subjects/${subject}`);
  redirect("/subjects");
}

import { redirect } from "next/navigation";
import { getActiveChild, getDefaultLearningPath } from "@/lib/queries";

export default async function UnitsPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const path = await getDefaultLearningPath();
  if (!path) redirect("/subjects");

  redirect(`/paths/${path.slug}`);
}

import { getAdminEmployerOptions } from "@/lib/admin-job-posting-actions";
import { NewJobPostingForm } from "./new-job-posting-form";

export default async function NewAdminJobPostingPage() {
  const employers = await getAdminEmployerOptions();

  return <NewJobPostingForm employers={employers} />;
}

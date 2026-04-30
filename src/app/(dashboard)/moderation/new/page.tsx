import { getAdminEmployerOptions } from "@/lib/admin-job-posting-actions";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { getOptionsForSelect } from "@/lib/config-options";
import { NewJobPostingForm } from "./new-job-posting-form";

export default async function NewAdminJobPostingPage() {
  const [employers, industryOptions, locationOptions] = await Promise.all([
    getAdminEmployerOptions(),
    getOptionsForSelect(OPTION_GROUPS.industry),
    getOptionsForSelect(OPTION_GROUPS.location),
  ]);

  return (
    <NewJobPostingForm
      employers={employers}
      industryOptions={industryOptions}
      locationOptions={locationOptions}
    />
  );
}

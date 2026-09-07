import { redirect } from "next/navigation";

import ProfilePage from "@/components/profile/profile-page";
import { getProfile } from "@/lib/actions/profile";

export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const user = await getProfile();

    return <ProfilePage user={user} />;
  } catch {
    redirect("/login");
  }
}

import AdminProfilePage from "@/components/admin/admin-profile-page";
import { getAdminProfile } from "@/lib/actions/admin-profile";

export const dynamic = "force-dynamic";

export default async function AdminProfileRoute() {
  const profile = await getAdminProfile();

  return <AdminProfilePage profile={profile} />;
}

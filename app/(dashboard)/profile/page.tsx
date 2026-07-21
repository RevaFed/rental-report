import ProfilePage from "@/components/profile/profile-page";

import { createSupabaseServer } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = createSupabaseServer();

  const { data } = await supabase.from("users").select("id,nama,username").limit(1).single();

  return <ProfilePage user={data} />;
}

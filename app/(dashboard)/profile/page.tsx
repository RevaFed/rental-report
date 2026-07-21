import { notFound } from "next/navigation";

import ProfilePage from "@/components/profile/profile-page";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = createSupabaseServer();

  const { data } = await supabase.from("users").select("id,nama,username").limit(1).single();

  if (!data) {
    notFound();
  }

  return <ProfilePage user={data} />;
}

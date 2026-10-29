"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { authClient } from "@/lib/auth/client";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={pending}
      size="sm"
    >
      <Icon name="logOut" className="size-4" />
      Sign out
    </Button>
  );
}

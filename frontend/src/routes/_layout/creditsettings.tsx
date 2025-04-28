// frontend/src/routes/_layout/creditsettings.tsx
import { Container, Heading } from "@chakra-ui/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import CreditSettings from "@/components/Admin/CreditSettings";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { isLoggedIn } from "@/hooks/useAuth";
import type { UserPublic } from "@/client";

export const Route = createFileRoute("/_layout/creditsettings")({
  component: CreditSettingsPage,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function CreditSettingsPage() {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);

  useEffect(() => {
    // Redirect if user is not a superuser
    if (currentUser && !currentUser.is_superuser) {
      throw redirect({
        to: "/",
      });
    }
  }, [currentUser]);

  // Only render if the user is a superuser
  if (!currentUser?.is_superuser) {
    return null;
  }

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Credit Settings
      </Heading>
      <CreditSettings />
    </Container>
  );
}

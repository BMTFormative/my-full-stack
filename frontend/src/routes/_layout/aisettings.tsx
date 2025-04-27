import { Container, Heading } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import AiSettings from "@/components/AiSettings/AiSettings";

export const Route = createFileRoute("/_layout/aisettings")({
  component: AiSettingsPage,
});

function AiSettingsPage() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        AI Settings
      </Heading>
      <AiSettings />
    </Container>
  );
}

// routes/_layout/aisettings.tsx
import { Container, Heading } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import React from "react"
import AISettings from "@/components/AISettings"

export const Route = createFileRoute("/_layout/aisettings")({
  component: AISettingsPage,
});

function AISettingsPage() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        AI Settings
      </Heading>
      <AISettings />
    </Container>
  );
}
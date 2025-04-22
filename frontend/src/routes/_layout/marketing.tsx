import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import MarketingDashboard from "@/components/Marketing/MarketingDashboard"

export const Route = createFileRoute("/_layout/marketing")({
  component: Marketing,
})

function Marketing() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Marketing AI Dashboard
      </Heading>
      <MarketingDashboard />
    </Container>
  )
}
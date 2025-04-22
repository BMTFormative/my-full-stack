import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Spinner,
  Badge,
  Icon
} from "@chakra-ui/react"
import { Alert,AlertIcon} from "@chakra-ui/alert";
import { toaster } from "@/components/ui/toaster"
import axios from "axios"
import { 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiBarChart2, 
  FiTarget, 
  FiDollarSign, 
  FiStar, 
  FiUsers, 
  FiAward 
} from "react-icons/fi"

type AIInsightsProps = {
  data: any | null
}

type InsightData = {
  growthOpportunity: string
  performanceAlert: string
  trendDetected: string
  forecast: string
  budgetAllocation: string
  campaignOptimization: string
  conversionFunnel: string
  competitiveAdvantage: string
}

type InsightCard = {
  title: string
  icon: React.ReactElement
  color: string
  insightKey: keyof InsightData
}

function AIInsights({ data }: AIInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = async () => {
    if (!data) return

    setIsLoading(true)
    setError(null)

    try {
      // Prepare metrics from the data for the AI
      const currentPeriod = {
        metrics: {
          spend: 0,
          revenue: 0,
          roas: 0,
          profit: 0,
          conversionRate: 0,
          ctr: 0,
          cpc: 0,
          cpa: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        },
        topPlatforms: [],
        topCampaigns: [],
        timeframe: "30 days"
      }

      // Fetch AI settings
      const settingsResponse = await axios.get('/api/settings/ai')
      const aiSettings = settingsResponse.data

      // Call the AI insights API
      const response = await axios.post('/api/insights', {
        data: {
          currentPeriod,
          changes: {
            roas: "+12.5%",
            spend: "+5.3%",
            revenue: "+18.2%"
          }
        },
        apiKey: aiSettings.apiKey,
        model: aiSettings.model || "gpt-4o",
        temperature: aiSettings.temperature || 0.7
      })

      setInsights(response.data)
    } catch (error) {
      console.error("Error generating AI insights:", error)
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error
        ? error.response.data.error
        : "An error occurred while generating AI insights"
      
      setError(errorMessage)
      
      toaster.create({
        title: "Error generating insights",
        description: errorMessage,
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (data) {
      generateInsights()
    }
  }, [data])

  const insightCards: InsightCard[] = [
    {
      title: "Growth Opportunity",
      icon: <Icon as={FiTrendingUp} boxSize={6} />,
      color: "green.500",
      insightKey: "growthOpportunity"
    },
    {
      title: "Performance Alert",
      icon: <Icon as={FiAlertTriangle} boxSize={6} />,
      color: "red.500",
      insightKey: "performanceAlert"
    },
    {
      title: "Trend Detected",
      icon: <Icon as={FiBarChart2} boxSize={6} />,
      color: "blue.500",
      insightKey: "trendDetected"
    },
    {
      title: "Forecast",
      icon: <Icon as={FiTarget} boxSize={6} />,
      color: "purple.500",
      insightKey: "forecast"
    },
    {
      title: "Budget Allocation",
      icon: <Icon as={FiDollarSign} boxSize={6} />,
      color: "teal.500",
      insightKey: "budgetAllocation"
    },
    {
      title: "Campaign Optimization",
      icon: <Icon as={FiStar} boxSize={6} />,
      color: "orange.500",
      insightKey: "campaignOptimization"
    },
    {
      title: "Conversion Funnel",
      icon: <Icon as={FiUsers} boxSize={6} />,
      color: "cyan.500",
      insightKey: "conversionFunnel"
    },
    {
      title: "Competitive Advantage",
      icon: <Icon as={FiAward} boxSize={6} />,
      color: "yellow.500",
      insightKey: "competitiveAdvantage"
    }
  ]

  if (!data) {
    return (
      <Box p={4}>
        <Alert status="info">
          <AlertIcon />
          Please upload data first
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="md" mb={4}>AI-Powered Marketing Insights</Heading>
          <Text mb={4}>
            Using artificial intelligence to analyze your marketing data and provide actionable insights.
          </Text>

          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Button
            colorScheme="teal"
            onClick={generateInsights}
            loading={isLoading}
            loadingText="Generating Insights"
            mb={6}
          >
            Refresh Insights
          </Button>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" h="300px">
            <Spinner
              borderWidth="4px"
              animationDuration="0.65s"
              css={{ "--spinner-track-color": "colors.gray.200" }}
              color="teal.500"
              size="xl"
            />
          </Box>
        ) : insights ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {insightCards.map((card, index) => (
              <Card.Root key={index}>
                <CardHeader pb={2}>
                  <Box display="flex" alignItems="center">
                    <Box color={card.color} mr={3}>
                      {card.icon}
                    </Box>
                    <Heading size="sm">{card.title}</Heading>
                  </Box>
                </CardHeader>
                <CardBody>
                  <Text>{insights[card.insightKey]}</Text>
                </CardBody>
              </Card.Root>
            ))}
          </SimpleGrid>
        ) : (
          <Alert status="info">
            <AlertIcon />
            No insights available. Click "Refresh Insights" to generate AI analysis.
          </Alert>
        )}
      </VStack>
    </Box>
  )
}

export default AIInsights
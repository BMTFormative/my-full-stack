import { useState, useEffect } from "react"
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Select,
  NativeSelect, 
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatHelpText,
  Badge,
  Separator ,
} from "@chakra-ui/react"
import { Table, Tbody, Td, Th,  Thead,  Tr } from "@chakra-ui/table";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { StatNumber } from "@chakra-ui/stat";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from "recharts"

type DataVisualizationProps = {
  data: any | null
}

function DataVisualization({ data }: DataVisualizationProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [platforms, setPlatforms] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedPage, setSelectedPage] = useState(1)
  const [rowsPerPage] = useState(10)
  
  useEffect(() => {
    if (data) {
      // Process data for visualization
      processData()
    }
  }, [data])
  
  const processData = async () => {
    try {
      // In a real-world scenario, you'd calculate these from the data
      // For now, we'll call the API endpoints defined in the server
      const [metricsResponse, platformsResponse, campaignsResponse] = await Promise.all([
        fetch('/api/data/metrics').then(res => res.json()),
        fetch('/api/data/channel-analysis').then(res => res.json()),
        fetch('/api/data/campaign-analysis').then(res => res.json())
      ])
      
      setMetrics(metricsResponse.metrics)
      setPlatforms(platformsResponse.platforms)
      setCampaigns(campaignsResponse.campaigns)
    } catch (error) {
      console.error("Error fetching visualization data:", error)
    }
  }

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
  
  if (!metrics || platforms.length === 0 || campaigns.length === 0) {
    return (
      <Box p={4}>
        <Alert status="info">
          <AlertIcon />
          Processing data...
        </Alert>
      </Box>
    )
  }

  const COLORS = ['#009688', '#2196F3', '#F44336', '#FFEB3B', '#4CAF50', '#9C27B0']

  // Calculate pagination
  const startIndex = (selectedPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const displayedData = data.data.slice(startIndex, endIndex)
  const totalPages = Math.ceil(data.data.length / rowsPerPage)
  
  return (
    <Box>
      {/* Key metrics summary */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6} mb={8}>
        <GridItem>
          <Card.Root>
            <CardHeader pb={0}>
              <Heading size="md">Return on Ad Spend</Heading>
            </CardHeader>
            <CardBody>
              <Stat.Root>
                <StatNumber>{metrics.roas.toFixed(2)}</StatNumber>
                <StatHelpText>
                  {metrics.roas >= 2 ? (
                    <Badge colorScheme="green">Good</Badge>
                  ) : (
                    <Badge colorScheme="red">Needs Improvement</Badge>
                  )}
                </StatHelpText>
              </Stat.Root>
            </CardBody>
          </Card.Root>
        </GridItem>
        
        <GridItem>
          <Card.Root>
            <CardHeader pb={0}>
              <Heading size="md">Spend vs Revenue</Heading>
            </CardHeader>
            <CardBody>
              <Stat.Root>
                <StatNumber>€{metrics.spend.toFixed(2)} / €{metrics.revenue.toFixed(2)}</StatNumber>
                <StatHelpText>
                  Profit: €{metrics.profit.toFixed(2)}
                </StatHelpText>
              </Stat.Root>
            </CardBody>
          </Card.Root>
        </GridItem>
        
        <GridItem>
          <Card.Root>
            <CardHeader pb={0}>
              <Heading size="md">Conversion Rate</Heading>
            </CardHeader>
            <CardBody>
              <Stat.Root>
                <StatNumber>{(metrics.conversionRate * 100).toFixed(2)}%</StatNumber>
                <StatHelpText>
                  CPA: €{metrics.cpa.toFixed(2)}
                </StatHelpText>
              </Stat.Root>
            </CardBody>
          </Card.Root>
        </GridItem>
      </Grid>

      {/* Platform Performance */}
      <Card.Root mb={8}>
        <CardHeader>
          <Heading size="md">Platform Performance</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            <GridItem>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platforms}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis yAxisId="left" orientation="left" stroke="#009688" />
                    <YAxis yAxisId="right" orientation="right" stroke="#F44336" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="spend" name="Spend (€)" fill="#009688" />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue (€)" fill="#F44336" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </GridItem>
            <GridItem>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platforms}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="budgetShare"
                      nameKey="platform"
                    >
                      {platforms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${(value * 100).toFixed(2)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </GridItem>
          </Grid>
          
          <Separator  my={4} />
          
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Platform</Th>
                <Th isNumeric>Spend</Th>
                <Th isNumeric>Revenue</Th>
                <Th isNumeric>ROAS</Th>
                <Th isNumeric>Conv. Rate</Th>
                <Th isNumeric>CPA</Th>
              </Tr>
            </Thead>
            <Tbody>
              {platforms.map((platform, index) => (
                <Tr key={index}>
                  <Td>{platform.platform}</Td>
                  <Td isNumeric>€{platform.spend.toFixed(2)}</Td>
                  <Td isNumeric>€{platform.revenue.toFixed(2)}</Td>
                  <Td isNumeric>{platform.roas.toFixed(2)}</Td>
                  <Td isNumeric>{(platform.conversionRate * 100).toFixed(2)}%</Td>
                  <Td isNumeric>€{platform.cpa.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card.Root>

      {/* Campaign Performance */}
      <Card.Root mb={8}>
        <CardHeader>
          <Heading size="md">Campaign Performance</Heading>
        </CardHeader>
        <CardBody>
          <Box height="300px" mb={4}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="campaign" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="roas" name="ROAS" fill="#009688" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Campaign</Th>
                <Th>Platform</Th>
                <Th isNumeric>Spend</Th>
                <Th isNumeric>Revenue</Th>
                <Th isNumeric>ROAS</Th>
                <Th isNumeric>Conv. Rate</Th>
              </Tr>
            </Thead>
            <Tbody>
              {campaigns.map((campaign, index) => (
                <Tr key={index}>
                  <Td>{campaign.campaign}</Td>
                  <Td>{campaign.platform}</Td>
                  <Td isNumeric>€{campaign.spend.toFixed(2)}</Td>
                  <Td isNumeric>€{campaign.revenue.toFixed(2)}</Td>
                  <Td isNumeric>{campaign.roas.toFixed(2)}</Td>
                  <Td isNumeric>{(campaign.conversionRate * 100).toFixed(2)}%</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card.Root>

      {/* Raw Data Table */}
      <Card.Root mb={8}>
        <CardHeader>
          <Heading size="md">Raw Data</Heading>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  {data.columns.map((column: string, index: number) => (
                    <Th key={index}>{column}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {displayedData.map((row: any, rowIndex: number) => (
                  <Tr key={rowIndex}>
                    {data.columns.map((column: string, colIndex: number) => (
                      <Td key={colIndex}>{row[column]}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          
          <HStack mt={4} justify="flex-end">
            <Text>
              Page {selectedPage} of {totalPages}
            </Text>
            <NativeSelect.Field
              value={selectedPage}
              onChange={(e) => setSelectedPage(parseInt(e.target.value))}
              width="auto"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </NativeSelect.Field>
          </HStack>
        </CardBody>
      </Card.Root>

      {/* Data Issues and Warnings */}
      {data.validation && data.validation.issues.length > 0 && (
        <Card.Root mb={8}>
          <CardHeader>
            <Heading size="md">Data Issues</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              Your data has some issues that might affect the analysis
            </Alert>
            
            <VStack align="start" gap={2}>
              {data.validation.issues.map((issue: string, index: number) => (
                <Text key={index}>• {issue}</Text>
              ))}
            </VStack>
          </CardBody>
        </Card.Root>
      )}
    </Box>
  )
}

export default DataVisualization
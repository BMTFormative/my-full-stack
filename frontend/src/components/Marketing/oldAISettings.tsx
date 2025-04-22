// components/AISettings/AISettings.tsx
import { useState, useEffect } from "react";
import React from "react"
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  VStack,
  Card,
  CardBody
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/alert";

function AISettings() {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Corrected: Changed useState to useEffect for side effects
  useEffect(() => {
    const savedApiKey = localStorage.getItem("aiApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("aiApiKey", apiKey);
      setIsLoading(false);
      toast({
        title: "API Key Saved",
        description: "Your AI API key has been saved successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }, 1000);
  };

  const handleClear = () => {
    setApiKey("");
    localStorage.removeItem("aiApiKey");
    toast({
      title: "API Key Cleared",
      description: "Your AI API key has been removed.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Card.Root maxW="xl" mt={8}>
      <CardBody>
        <VStack gap={6} align="stretch">
          <Text fontSize="xl" fontWeight="bold">
            AI API Settings
          </Text>
          
          {!apiKey ? (
            <Alert status="warning" borderRadius="md" alignItems="flex-start">
                <AlertIcon boxSize="4" mr={2} mt={1} /> {/* Smaller icon */}
                <Box>
                <AlertTitle fontSize="sm">No API Key Configured</AlertTitle>
                <AlertDescription fontSize="sm">
                    Please enter your AI service API key to enable all features.
                </AlertDescription>
                </Box>
            </Alert>
            ) : (
            <Alert status="success" borderRadius="md" alignItems="flex-start">
                <AlertIcon boxSize="4" mr={2} mt={1} /> {/* Smaller icon */}
                <Box>
                <AlertTitle fontSize="sm">API Key Configured</AlertTitle>
                <AlertDescription fontSize="sm">
                    Your AI service is ready to use with the configured API key.
                </AlertDescription>
                </Box>
            </Alert>
            )}

          <FormControl>
            <FormLabel>AI Service API Key</FormLabel>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your AI API key"
            />
            <Text fontSize="sm" color="gray.500" mt={2}>
              This key will be stored locally in your browser.
            </Text>
          </FormControl>

          <Box>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              loading={isLoading}
              mr={4}
            >
              Save API Key
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!apiKey || isLoading}
            >
              Clear API Key
            </Button>
          </Box>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}

export default AISettings;
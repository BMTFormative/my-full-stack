import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  Flex,
  Input,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { FaPlus } from "react-icons/fa";
import AddApiKey from "./AddApiKey";
import ApiKeysList from "./ApiKeysList";
import PendingApiKeys from "../Pending/PendingApiKeys";

// Since the client may not have AiSettings service yet, we'll create direct API calls
// You should update these functions to match your actual API endpoints and types

interface ApiKey {
  id: string;
  key?: string;
  api_key?: string; // Alternative field name that might be used
  created_at: string;
}

const fetchApiKeys = async (): Promise<ApiKey[]> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/aisettings/api-keys`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }
    throw new Error("Failed to fetch API keys");
  }

  return response.json();
};

const deleteApiKey = async (id: string): Promise<void> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/aisettings/api-keys/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }
    throw new Error("Failed to delete API key");
  }
};

const AiSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: apiKeys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: fetchApiKeys,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      toast({
        title: "API Key deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <Box mt={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="lg">Manage your AI API Keys</Text>
        <Button onClick={() => setIsAddDialogOpen(true)} my={4}>
          <FaPlus />
          Add API Key
        </Button>
      </Flex>

      <Card.Root p={4}>
        {isLoading ? (
          <PendingApiKeys />
        ) : error ? (
          <Text color="red.500">Error loading API keys. Please try again.</Text>
        ) : (
          <ApiKeysList apiKeys={apiKeys || []} onDelete={handleDelete} />
        )}
      </Card.Root>

      <AddApiKey
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </Box>
  );
};

export default AiSettings;

// frontend/src/components/Admin/CreditSettings.tsx
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import PendingApiKeys from "../Pending/PendingApiKeys";

interface CreditProfile {
  id: string;
  name: string;
  amount: number;
  description: string;
  created_at: string;
  updated_at: string;
}

// API functions
const fetchCreditProfiles = async (): Promise<CreditProfile[]> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/aisettings/credit-profiles`,
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
    throw new Error("Failed to fetch credit profiles");
  }

  return response.json();
};

const updateCreditProfile = async ({
  id,
  amount,
  description,
}: {
  id: string;
  amount: number;
  description?: string;
}): Promise<CreditProfile> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  // Create URL with query params
  const url = new URL(
    `${import.meta.env.VITE_API_URL}/api/v1/aisettings/credit-profiles/${id}`
  );
  url.searchParams.append("amount", amount.toString());
  if (description) {
    url.searchParams.append("description", description);
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }
    throw new Error("Failed to update credit profile");
  }

  return response.json();
};

const CreditSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [editDescriptions, setEditDescriptions] = useState<
    Record<string, string>
  >({});

  const {
    data: creditProfiles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["creditProfiles"],
    queryFn: fetchCreditProfiles,
  });

  useEffect(() => {
    if (creditProfiles) {
      const initialEditValues: Record<string, number> = {};
      const initialEditDescriptions: Record<string, string> = {};
      creditProfiles.forEach((profile) => {
        initialEditValues[profile.id] = profile.amount;
        initialEditDescriptions[profile.id] = profile.description;
      });
      setEditValues(initialEditValues);
      setEditDescriptions(initialEditDescriptions);
    }
  }, [creditProfiles]);

  const updateMutation = useMutation({
    mutationFn: updateCreditProfile,
    onSuccess: () => {
      toast({
        title: "Credit profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["creditProfiles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleEditToggle = (id: string) => {
    setEditMode((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = (profile: CreditProfile) => {
    updateMutation.mutate({
      id: profile.id,
      amount: editValues[profile.id],
      description: editDescriptions[profile.id],
    });
    handleEditToggle(profile.id);
  };

  const handleAmountChange = (id: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setEditValues((prev) => ({
        ...prev,
        [id]: numValue,
      }));
    }
  };

  const handleDescriptionChange = (id: string, value: string) => {
    setEditDescriptions((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <Box mt={8}>
      <Heading size="md" mb={4}>
        Credit Profile Management
      </Heading>
      <Text mb={4}>
        Manage the credit amounts for different user profile tiers. These
        settings will affect how many AI operations users of each tier can
        perform.
      </Text>

      <Card.Root p={4}>
        {isLoading ? (
          <PendingApiKeys />
        ) : error ? (
          <Text color="red.500">
            Error loading credit profiles. Please try again.
          </Text>
        ) : (
          <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Profile Name</Table.ColumnHeader>
                <Table.ColumnHeader>Credit Amount</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {creditProfiles?.map((profile) => (
                <Table.Row key={profile.id}>
                  <Table.Cell>
                    <Text fontWeight="bold">{profile.name}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {editMode[profile.id] ? (
                      <Input
                        type="number"
                        value={editValues[profile.id]}
                        onChange={(e) =>
                          handleAmountChange(profile.id, e.target.value)
                        }
                        size="sm"
                        width="100px"
                      />
                    ) : (
                      <Text>{profile.amount}</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editMode[profile.id] ? (
                      <Input
                        value={editDescriptions[profile.id]}
                        onChange={(e) =>
                          handleDescriptionChange(profile.id, e.target.value)
                        }
                        size="sm"
                      />
                    ) : (
                      <Text>{profile.description}</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editMode[profile.id] ? (
                      <Flex gap={2}>
                        <Button
                          size="sm"
                          colorScheme="teal"
                          onClick={() => handleSave(profile)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditToggle(profile.id)}
                        >
                          Cancel
                        </Button>
                      </Flex>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditToggle(profile.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Card.Root>
    </Box>
  );
};

export default CreditSettings;

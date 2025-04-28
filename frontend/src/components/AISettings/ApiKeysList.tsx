import { Button, Table, Flex, Text } from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";

interface ApiKey {
  id: string;
  key?: string;
  api_key?: string; // Alternative field name that might be used
  created_at: string;
}

interface ApiKeysListProps {
  apiKeys: ApiKey[];
  onDelete: (id: string) => void;
}

const ApiKeysList = ({ apiKeys, onDelete }: ApiKeysListProps) => {
  if (apiKeys.length === 0) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        p={6}
      >
        <Text mb={4}>
          No API keys found. Add your first API key to get started.
        </Text>
      </Flex>
    );
  }

  // Function to mask API key - shows only last 4 characters
  const maskApiKey = (key: string | undefined) => {
    if (!key) return "••••••••";
    return `••••••••${key.slice(-4)}`;
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Table.Root size={{ base: "sm", md: "md" }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>API Key</Table.ColumnHeader>
          <Table.ColumnHeader>Added On</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {apiKeys.map((apiKey) => (
          <Table.Row key={apiKey.id}>
            <Table.Cell>
              <Text fontFamily="mono">
                {maskApiKey(apiKey.key || apiKey.api_key)}
              </Text>
            </Table.Cell>
            <Table.Cell>{formatDate(apiKey.created_at)}</Table.Cell>
            <Table.Cell textAlign="right">
              <Button
                variant="ghost"
                size="sm"
                colorPalette="red"
                onClick={() => onDelete(apiKey.id)}
              >
                <FiTrash2 />
                Delete
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default ApiKeysList;

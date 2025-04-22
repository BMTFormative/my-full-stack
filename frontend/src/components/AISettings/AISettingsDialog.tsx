// components/AISettings/AISettingsDialog.tsx
import { useToast } from "@chakra-ui/toast"
import { 
  Box,
  Button,
  Input,
  Text,
  VStack,
  Dialog
} from "@chakra-ui/react"
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/alert";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useForm } from "react-hook-form"
import { AISettingsFormData } from "./types"

interface AISettingsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialApiKey?: string
}

const AISettingsDialog = ({ 
  isOpen, 
  onOpenChange,
  initialApiKey = ""
}: AISettingsDialogProps) => {
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<AISettingsFormData>({
    defaultValues: {
      apiKey: initialApiKey
    }
  })

  const onSubmit = (data: AISettingsFormData) => {
    localStorage.setItem("aiApiKey", data.apiKey)
    toast({
      title: "API Key Saved",
      description: "Your AI API key has been saved successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    })
    onOpenChange(false)
  }

  const handleClear = () => {
    localStorage.removeItem("aiApiKey")
    reset({ apiKey: "" })
    toast({
      title: "API Key Cleared",
      description: "Your AI API key has been removed.",
      status: "info",
      duration: 5000,
      isClosable: true,
    })
  }

  return (
    <Dialog.Root
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      //onOpenChange={onOpenChange}
    >
      <Dialog.Content>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Header>
            <Dialog.Title>AI Settings</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap={4} align="stretch">
              {!initialApiKey ? (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>No API Key Configured</AlertTitle>
                    <AlertDescription>
                      Please enter your AI service API key to enable all features.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>API Key Configured</AlertTitle>
                    <AlertDescription>
                      Your AI service is ready to use with the configured API key.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <FormControl>
                <FormLabel>AI Service API Key</FormLabel>
                <Input
                  type="password"
                  {...register("apiKey")}
                  placeholder="Enter your AI API key"
                />
                <Text fontSize="sm" color="gray.500" mt={2}>
                  This key will be stored locally in your browser.
                </Text>
              </FormControl>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer gap={2}>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!initialApiKey || isSubmitting}
            >
              Clear API Key
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              loading={isSubmitting}
            >
              Save API Key
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AISettingsDialog
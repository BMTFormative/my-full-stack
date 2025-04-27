import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Button,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import {
  DialogActionTrigger,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
} from "../ui/dialog";
import { Field } from "../ui/field";
import { SubmitHandler, useForm } from "react-hook-form";

interface AddApiKeyProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  key: string;
}

// Create a function to add an API key
const addApiKey = async (key: string): Promise<any> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  // The API might expect a different structure for the request body
  // Adjusting to match what the backend expects
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/aisettings/api-keys`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Try different payload formats based on the backend expectations
      body: JSON.stringify({ api_key: key }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    } else if (response.status === 422) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);
      throw new Error(errorData.detail || "Invalid input format");
    }
    throw new Error("Failed to add API key");
  }

  return response.json();
};

const AddApiKey = ({ isOpen, onClose }: AddApiKeyProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: (data: FormData) => addApiKey(data.key),
    onSuccess: () => {
      toast({
        title: "API Key added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error: Error) => {
      if (
        error.message === "Not authenticated" ||
        error.message === "Session expired. Please login again."
      ) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onClose();
        navigate({ to: "/login" });
        return;
      }

      toast({
        title: "Error adding API Key",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Enter your AI provider API key below</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.key}
                errorText={errors.key?.message}
                label="API Key"
              >
                <Input
                  id="key"
                  type="password"
                  placeholder="Enter your API key"
                  {...register("key", {
                    required: "API Key is required",
                  })}
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
                onClick={() => reset()}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddApiKey;

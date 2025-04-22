import { useState, useRef } from "react"
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Spinner
} from "@chakra-ui/react"
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/alert";
import { toaster } from "@/components/ui/toaster"
import { FiUpload } from "react-icons/fi"
import axios from "axios"

type FileUploadProps = {
  onDataUploaded: (data: any) => void
  onError: (message: string) => void
  setIsLoading: (isLoading: boolean) => void
}

function FileUpload({ onDataUploaded, onError, setIsLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      
      if (fileExt === 'csv' || fileExt === 'xlsx' || fileExt === 'xls') {
        setSelectedFile(file)
        setUploadError(null)
      } else {
        setSelectedFile(null)
        setUploadError("Please select a valid CSV or Excel file (.csv, .xlsx, .xls)")
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setIsLoading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // Upload the file
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (uploadResponse.data && uploadResponse.data.success) {
        // Get the data from the uploaded file
        const dataResponse = await axios.get('/api/data', {
          params: {
            filename: uploadResponse.data.filename
          }
        })

        onDataUploaded(dataResponse.data)
        toaster.create({
          title: "File uploaded successfully",
          type: "success",
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error
        ? error.response.data.error
        : "An error occurred while uploading the file"
      
      setUploadError(errorMessage)
      onError(errorMessage)
      
      toaster.create({
        title: "Upload failed",
        description: errorMessage,
        type: "error",
      })
    } finally {
      setIsUploading(false)
      setIsLoading(false)
    }
  }

  return (
    <VStack gap={6} align="stretch">
      <Text>
        Upload your marketing data file (CSV or Excel) to analyze and get AI-powered insights.
      </Text>

      {uploadError && (
        <Alert status="error" rounded="md">
          <AlertIcon />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <FormControl>
        <FormLabel htmlFor="file-upload">Select file to upload</FormLabel>
        <Input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          display="none"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          colorScheme="teal"
          variant="outline"
          w="full"
          h="100px"
          border="2px dashed"
          borderColor="teal.300"
        >
          <FiUpload />{selectedFile ? selectedFile.name : "Click to select file"}
        </Button>
      </FormControl>

      <Box>
        <Button
          onClick={handleUpload}
          loading={isUploading}
          loadingText="Uploading"
          colorScheme="teal"
          disabled={!selectedFile || isUploading}
          w="full"
        >
          Upload and Analyze
        </Button>
      </Box>

      {isUploading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Spinner
            borderWidth="4px"
            animationDuration="0.65s"
            css={{ "--spinner-track-color": "colors.gray.200" }}
            color="teal.500"
            size="xl"
          />
        </Box>
      )}
    </VStack>
  )
}

export default FileUpload
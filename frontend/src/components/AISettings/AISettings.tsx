// components/AISettings/AISettings.tsx
import { useState } from "react"
import { Button } from "@chakra-ui/react"
import { FaCog } from "react-icons/fa"
import AISettingsDialog from "./AISettingsDialog"

const AISettings = () => {
  const [isOpen, setIsOpen] = useState(false)
  const savedApiKey = localStorage.getItem("aiApiKey")

  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => setIsOpen(true)}
      >
        <FaCog />AI Settings
      </Button>
      
      <AISettingsDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        initialApiKey={savedApiKey || ""}
      />
    </>
  )
}

export default AISettings
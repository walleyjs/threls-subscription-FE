"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { apiService } from "@/services/api-service"

interface Feature {
  _id: string
  name: string
  description: string
  key: string
  category: string
  isHighlighted: boolean
  limitType: string
  defaultLimitValue: any
  displayOrder: number
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface SelectedFeature {
  featureId: string
  limitValue: any
}

interface FeatureManagementProps {
  selectedFeatures: SelectedFeature[]
  onFeaturesChange: (features: SelectedFeature[]) => void
}

export function FeatureManagement({ selectedFeatures, onFeaturesChange }: FeatureManagementProps) {
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // New feature form state
  const [featureName, setFeatureName] = useState("")
  const [featureDescription, setFeatureDescription] = useState("")
  const [featureKey, setFeatureKey] = useState("")
  const [featureCategory, setFeatureCategory] = useState("")
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [limitType, setLimitType] = useState("boolean")
  const [defaultLimitValue, setDefaultLimitValue] = useState<any>(false)
  const [displayOrder, setDisplayOrder] = useState(0)

  // Feature selection state
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("")
  const [featureLimitValue, setFeatureLimitValue] = useState<any>("")

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getFeatures()

     
        setAvailableFeatures(data.data)
   
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load features",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFeature = () => {
    if (!selectedFeatureId) return

    const feature = availableFeatures.find((f) => f._id === selectedFeatureId)
    if (!feature) return

    // Determine the value based on the feature type
    let limitValue: any = featureLimitValue
    if (feature.limitType === "boolean" && typeof featureLimitValue !== "boolean") {
      limitValue = featureLimitValue === "true"
    } else if (feature.limitType === "number" && typeof featureLimitValue !== "number") {
      limitValue = Number(featureLimitValue)
    }

    // Check if feature already exists
    const exists = selectedFeatures.some((f) => f.featureId === selectedFeatureId)
    if (exists) {
      toast({
        title: "Feature already added",
        description: "This feature is already part of the plan",
        variant: "destructive",
      })
      return
    }

    // Add the feature
    const newFeatures = [...selectedFeatures, { featureId: selectedFeatureId, limitValue }]
    onFeaturesChange(newFeatures)

    // Reset selection
    setSelectedFeatureId("")
    setFeatureLimitValue("")
  }

  const handleRemoveFeature = (featureId: string) => {
    const newFeatures = selectedFeatures.filter((f) => f.featureId !== featureId)
    onFeaturesChange(newFeatures)
  }

  const handleCreateFeature = async () => {
    try {
      // Validate inputs
      if (!featureName || !featureKey) {
        toast({
          title: "Validation Error",
          description: "Feature name and key are required",
          variant: "destructive",
        })
        return
      }

      // Prepare the feature data
      let processedDefaultValue: any = defaultLimitValue
      if (limitType === "boolean" && typeof defaultLimitValue !== "boolean") {
        processedDefaultValue = defaultLimitValue === "true"
      } else if (limitType === "number" && typeof defaultLimitValue !== "number") {
        processedDefaultValue = Number(defaultLimitValue)
      }

      const featureData = {
        name: featureName,
        description: featureDescription,
        key: featureKey,
        category: featureCategory,
        isHighlighted,
        limitType,
        defaultLimitValue: processedDefaultValue,
        displayOrder,
        isActive: true,
        isDeleted: false,
      }

      const data = await apiService.createFeature(featureData)
        fetchFeatures()
        setFeatureName("")
        setFeatureDescription("")
        setFeatureKey("")
        setFeatureCategory("")
        setIsHighlighted(false)
        setLimitType("boolean")
        setDefaultLimitValue(false)
        setDisplayOrder(0)

        setIsDialogOpen(false)
    
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create feature",
        variant: "destructive",
      })
    }
  }

  const getFeatureById = (id: string) => {
    return availableFeatures.find((f) => f._id === id)
  }

  const renderFeatureValueInput = () => {
    if (!selectedFeatureId) return null

    const feature = availableFeatures.find((f) => f._id === selectedFeatureId)
    if (!feature) return null

    switch (feature.limitType) {
      case "boolean":
        return (
          <div className="space-y-2">
            <Label htmlFor="featureLimitValue">Value</Label>
            <Select value={String(featureLimitValue)} onValueChange={(value) => setFeatureLimitValue(value === "true")}>
              <SelectTrigger id="featureLimitValue">
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Enabled</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor="featureLimitValue">Limit Value</Label>
            <Input
              id="featureLimitValue"
              type="number"
              value={featureLimitValue?.toString() || ""}
              onChange={(e) => setFeatureLimitValue(Number(e.target.value))}
            />
          </div>
        )
      case "string":
        return (
          <div className="space-y-2">
            <Label htmlFor="featureLimitValue">Value</Label>
            <Input
              id="featureLimitValue"
              value={featureLimitValue?.toString() || ""}
              onChange={(e) => setFeatureLimitValue(e.target.value)}
            />
          </div>
        )
      default:
        return null
    }
  }

  const renderCreateFeatureForm = () => {
    return (
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="featureName">Feature Name*</Label>
          <Input
            id="featureName"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            placeholder="e.g. API Access, Storage Space"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="featureDescription">Description</Label>
          <Textarea
            id="featureDescription"
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
            placeholder="Describe what this feature provides"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="featureKey">Feature Key*</Label>
            <Input
              id="featureKey"
              value={featureKey}
              onChange={(e) => setFeatureKey(e.target.value)}
              placeholder="e.g. api_access"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featureCategory">Category</Label>
            <Input
              id="featureCategory"
              value={featureCategory}
              onChange={(e) => setFeatureCategory(e.target.value)}
              placeholder="e.g. API, Storage, Support"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="limitType">Limit Type</Label>
            <Select
              value={limitType}
              onValueChange={(value: string) => {
                setLimitType(value)
                // Reset default value based on type
                if (value === "boolean") setDefaultLimitValue(false)
                else if (value === "number") setDefaultLimitValue(0)
                else setDefaultLimitValue("")
              }}
            >
              <SelectTrigger id="limitType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Boolean (On/Off)</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="string">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              min="0"
              value={displayOrder.toString()}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
            />
          </div>
        </div>

        {limitType === "boolean" && (
          <div className="space-y-2">
            <Label htmlFor="defaultLimitValue">Default Value</Label>
            <Select value={String(defaultLimitValue)} onValueChange={(value) => setDefaultLimitValue(value === "true")}>
              <SelectTrigger id="defaultLimitValue">
                <SelectValue placeholder="Select default value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Enabled</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {limitType === "number" && (
          <div className="space-y-2">
            <Label htmlFor="defaultLimitValue">Default Limit Value</Label>
            <Input
              id="defaultLimitValue"
              type="number"
              value={defaultLimitValue?.toString() || "0"}
              onChange={(e) => setDefaultLimitValue(Number(e.target.value))}
            />
          </div>
        )}

        {limitType === "string" && (
          <div className="space-y-2">
            <Label htmlFor="defaultLimitValue">Default Value</Label>
            <Input
              id="defaultLimitValue"
              value={defaultLimitValue?.toString() || ""}
              onChange={(e) => setDefaultLimitValue(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isHighlighted"
            checked={isHighlighted}
            onCheckedChange={(checked) => setIsHighlighted(checked === true)}
          />
          <Label htmlFor="isHighlighted">Highlight this feature in plan comparisons</Label>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Plan Features</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Feature
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Feature</DialogTitle>
              <DialogDescription>Add a new feature that can be included in subscription plans.</DialogDescription>
            </DialogHeader>
            {renderCreateFeatureForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFeature}>Create Feature</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <div className="p-6">
          <h3 className="text-lg font-medium">Selected Features</h3>
          <p className="text-sm text-muted-foreground">Features included in this plan</p>
        </div>

        <div className="p-6 pt-0">
          {selectedFeatures.length > 0 ? (
            <div className="space-y-2">
              {selectedFeatures.map((feature) => {
                const featureDetails = getFeatureById(feature.featureId)
                if (!featureDetails) return null

                return (
                  <div key={feature.featureId} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{featureDetails.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {featureDetails.limitType === "boolean"
                          ? feature.limitValue
                            ? "Enabled"
                            : "Disabled"
                          : `Limit: ${feature.limitValue}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFeature(feature.featureId)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No features added to this plan yet.</p>
          )}
        </div>

        <div className="border-t p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="featureSelect">Add Feature</Label>
              <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId}>
                <SelectTrigger id="featureSelect">
                  <SelectValue placeholder="Select a feature" />
                </SelectTrigger>
                <SelectContent>
                  {availableFeatures.map((feature) => (
                    <SelectItem key={feature._id} value={feature._id}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderFeatureValueInput()}

            <Button
              className="w-full"
              onClick={handleAddFeature}
              disabled={!selectedFeatureId || featureLimitValue === ""}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Feature
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


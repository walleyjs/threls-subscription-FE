"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/services/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Search, AlertCircle, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  useEffect(() => {
    filterSubscribers()
  }, [subscribers, searchQuery, statusFilter])

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getSubscribers()
      setSubscribers(data.data)
      setFilteredSubscribers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscribers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterSubscribers = () => {
    let filtered = [...subscribers]


    if (searchQuery) {
      filtered = filtered.filter(
        (subscriber) =>
         subscriber.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subscriber.userId.FirstName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }


    if (statusFilter !== "all") {
      filtered = filtered.filter((subscriber) => subscriber.status === statusFilter)
    }

    setFilteredSubscribers(filtered)
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subscribers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => fetchSubscribers()}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="data-table-container">
            <Table className="data-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber._id}>
                      <TableCell className="font-medium">{subscriber?.userId?.firstName} {subscriber?.userId?.lastName}</TableCell>
                      <TableCell>{subscriber?.userId?.email}</TableCell>
                      <TableCell>{subscriber.planId.name}</TableCell>
                      <TableCell>
                        <div className="status-indicator">
                          {subscriber.status === "active" ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 status-indicator-active" />
                              <span className="font-medium status-indicator-active">Active</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="mr-2 h-4 w-4 status-indicator-inactive" />
                              <span className="font-medium status-indicator-inactive">
                                {subscriber.status.charAt(0).toUpperCase() +
                                  subscriber.status.slice(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
                      <TableCell>{formatDate(subscriber.currentPeriodEnd)}</TableCell>
                      <TableCell>
                        <Button  variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/subscribers/${subscriber._id}`)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No subscribers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


import { config } from "@/config";

type ApiResponse<T> = {
  statusCode: string;
  message: string;
  data: T;
};

class ApiService {
  private baseUrl = config.api.baseUrl
  private accessToken: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const tokens = localStorage.getItem(config.auth.tokenStorageKey)
      if (tokens) {
        this.accessToken = JSON.parse(tokens).accessToken
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Always get the latest token from localStorage
    if (typeof window !== "undefined") {
      const tokens = localStorage.getItem(config.auth.tokenStorageKey)
      if (tokens) {
        try {
          const parsedTokens = JSON.parse(tokens)
          headers["Authorization"] = `Bearer ${parsedTokens.accessToken}`
        } catch (error) {
          console.error("Error parsing tokens from localStorage:", error)
        }
      }
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (response.ok && data.statusCode === "10000") {
      return data.data;
    }

    throw new Error(data.message || "Something went wrong");
  }

  async getSubscription(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/subscription/current`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getSubscribers(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/subscribers`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getSubscriberDetails(subscriberId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/subscribers/${subscriberId}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/subscription/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<any>(response);
  }

  async getPlans(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/plan/plan-features`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getPaymentMethods(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/payment-method`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async createSubscription(
    planId: string,
    paymentMethodId: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/subscription/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ planId, paymentMethodId }),
    });

    return this.handleResponse<any>(response);
  }

  async addPaymentMethod(paymentMethod: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/payment-method/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(paymentMethod),
    });

    return this.handleResponse<any>(response);
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/payment-method/update/${paymentMethodId}`, {
      method: "PUT",
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async getTransactions(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transaction`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async getInvoice(invoiceId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transaction/${invoiceId}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async getAdminDashboardStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/stats`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async createPlan(planData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/create-plan`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(planData),
    })

    return this.handleResponse<any>(response)
  }

  async updatePlan(planId: string, planData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/update-plan/${planId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(planData),
    })

    return this.handleResponse<any>(response)
  }

  async deletePlan(id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/delete-plan/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async getFeatures(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/features`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async createFeature(featureData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/create-feature`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(featureData),
    })

    return this.handleResponse<any>(response)
  }

  async getWebhooks(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/webhook`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any[]>(response)
  }

  async getWebhook(id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/webhook/${id}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async createWebhook(webhookData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/webhook/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(webhookData),
    })

    return this.handleResponse<any>(response)
  }

  async updateWebhook(id: string, webhookData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/webhook/update/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(webhookData),
    })

    return this.handleResponse<any>(response)
  }

  async deleteWebhook(id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/webhook/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async getAdminTransactions(filters = {}) {
    const queryParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const queryString = queryParams.toString()
    const url = `${this.baseUrl}/admin/transactions${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async getAdminTransaction(id: string) {
    const response = await fetch(`${this.baseUrl}/admin/transactions/${id}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }

  async logout(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })

    return this.handleResponse<any>(response)
  }
}

export const apiService = new ApiService();

import { config } from "@/config";

type ApiResponse<T> = {
  statusCode: string;
  message: string;
  data: T;
};

class ApiService {
  private baseUrl = config.api.baseUrl;
  private accessToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const tokens = localStorage.getItem(config.auth.tokenStorageKey);
      if (tokens) {
        this.accessToken = JSON.parse(tokens).accessToken;
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return headers;
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
}

export const apiService = new ApiService();

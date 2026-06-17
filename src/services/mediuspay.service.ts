import { supabase } from "@/integrations/supabase/client";

// Mediuspay API Base URL
const MEDIUSPAY_BASE_URL = "https://mediuspay-server.onrender.com/api/partner/v1";

// Types based on Mediuspay API documentation
export type MediuspaySeller = {
  id: string;
  external_seller_id: string;
  name: string;
  email: string;
  status: string;
  kyc_status: string;
  created_at: string;
};

export type MediuspayOrder = {
  id: string;
  order_code: string;
  status: "PENDING" | "IN_ESCROW" | "DELIVERED" | "COMPLETED" | "REFUNDED";
  amount_ngn: number;
  commission_ngn: number;
  partner_fee_ngn: number;
  seller_net_ngn: number;
  mode: "test" | "live";
  customer_email: string;
};

export type MediuspayCheckout = {
  checkout_url: string;
  reference: string;
};

export type MediuspayBalance = {
  mode: "test" | "live";
  settled_ngn: number;
  pending_ngn: number;
  withdrawn_ngn: number;
  in_flight_ngn: number;
  available_ngn: number;
};

export type MediuspayPayout = {
  id: string;
  reference: string;
  amount_ngn: number;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  payout_kind: "SELLER" | "PARTNER_FEE";
  pending_authorization: boolean;
};

export class MediuspayService {
  /**
   * Get Mediuspay API key from environment variables (via Supabase Edge Functions)
   * Note: We use edge functions to keep keys secure on the server side
   */
  private async getApiClient(): Promise<{ baseUrl: string; getKey: () => Promise<string> }> {
    return {
      baseUrl: MEDIUSPAY_BASE_URL,
      getKey: async () => {
        // In a real implementation, fetch key from Supabase Vault or Edge Functions
        const { data: { session } } = await supabase.auth.getSession();
        // For now, placeholder - will use Supabase Edge Functions
        return import.meta.env.VITE_MEDIUSPAY_API_KEY || "";
      }
    };
  }

  /**
   * Helper function to make API requests
   */
  private async request<T>(
    method: "GET" | "POST",
    endpoint: string,
    data?: Record<string, any>,
    idempotencyKey?: string
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const { baseUrl, getKey } = await this.getApiClient();
      const apiKey = await getKey();
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      };

      if (idempotencyKey) {
        headers["Idempotency-Key"] = idempotencyKey;
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });

      const responseData = await response.json();

      if (!response.ok) {
        return { success: false, error: responseData.message || response.statusText };
      }

      return { success: true, data: responseData };
    } catch (error) {
      console.error("Mediuspay API request failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  // === Sub-sellers ===
  async createSeller(externalSellerId: string, name: string, email: string) {
    return this.request<{ seller: MediuspaySeller }>("POST", "/sellers", {
      external_seller_id: externalSellerId,
      name,
      email
    });
  }

  async getSellers() {
    return this.request<{ sellers: MediuspaySeller[] }>("GET", "/sellers");
  }

  async getSellerById(sellerId: string) {
    return this.request<{ seller: MediuspaySeller }>("GET", `/sellers/${sellerId}`);
  }

  async addSellerBankAccount(
    sellerId: string,
    accountNumber: string,
    bankCode: string,
    accountName?: string
  ) {
    return this.request("POST", `/sellers/${sellerId}/bank-accounts`, {
      account_number: accountNumber,
      bank_code: bankCode,
      account_name: accountName
    });
  }

  // === Orders ===
  async createOrder(
    partnerSellerId: string,
    amountNgn: number,
    customerEmail: string,
    customerName: string,
    title: string,
    redirectUrl: string,
    partnerReference: string,
    partnerFeeBps?: number,
    partnerFeeNgn?: number
  ) {
    const idempotencyKey = crypto.randomUUID();
    const payload: any = {
      partner_seller_id: partnerSellerId,
      amount_ngn: amountNgn,
      customer_email: customerEmail,
      customer_name: customerName,
      title,
      redirect_url: redirectUrl,
      partner_reference: partnerReference
    };

    if (partnerFeeBps) payload.partner_fee_bps = partnerFeeBps;
    if (partnerFeeNgn) payload.partner_fee_ngn = partnerFeeNgn;

    return this.request<{ order: MediuspayOrder; checkout: MediuspayCheckout }>(
      "POST",
      "/orders",
      payload,
      idempotencyKey
    );
  }

  async getOrders() {
    return this.request<{ orders: MediuspayOrder[] }>("GET", "/orders");
  }

  async getOrderById(orderId: string) {
    return this.request<{ order: MediuspayOrder }>("GET", `/orders/${orderId}`);
  }

  async reissueCheckout(orderId: string) {
    return this.request<{ checkout: MediuspayCheckout }>("POST", `/orders/${orderId}/checkout`);
  }

  async markOrderDelivered(orderId: string) {
    return this.request("POST", `/orders/${orderId}/delivered`);
  }

  // === Balances ===
  async getPartnerBalance() {
    return this.request<{ balance: MediuspayBalance }>("GET", "/balance");
  }

  async getSellerBalance(sellerId: string) {
    return this.request<{ balance: MediuspayBalance }>("GET", `/sellers/${sellerId}/balance`);
  }

  // === Payouts ===
  async registerPartnerBankAccount(
    accountNumber: string,
    bankCode: string,
    accountName?: string
  ) {
    return this.request("POST", "/bank-accounts", {
      account_number: accountNumber,
      bank_code: bankCode,
      account_name: accountName
    });
  }

  async getPartnerBankAccounts() {
    return this.request("GET", "/bank-accounts");
  }

  async payoutToSeller(sellerId: string, amountNgn: number, bankAccountId: string) {
    const idempotencyKey = crypto.randomUUID();
    return this.request<{ payout: MediuspayPayout }>(
      "POST",
      `/sellers/${sellerId}/payouts`,
      { amount_ngn: amountNgn, bank_account_id: bankAccountId },
      idempotencyKey
    );
  }

  async withdrawPartnerFee(amountNgn: number, bankAccountId: string) {
    const idempotencyKey = crypto.randomUUID();
    return this.request<{ payout: MediuspayPayout }>(
      "POST",
      "/payouts",
      { amount_ngn: amountNgn, bank_account_id: bankAccountId },
      idempotencyKey
    );
  }

  async getPayouts() {
    return this.request<{ payouts: MediuspayPayout[] }>("GET", "/payouts");
  }

  // === Test Mode ===
  async simulatePayment(orderId: string) {
    return this.request("POST", `/orders/${orderId}/simulate-payment`);
  }
}

export const mediuspayService = new MediuspayService();

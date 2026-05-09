import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProfileCompletionChecklist } from "../ProfileCompletionChecklist";
import { BrowserRouter } from "react-router-dom";

// Mock the dependencies
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("ProfileCompletionChecklist", () => {
  const mockShop = {
    id: "shop-123",
    logo_url: "logo.jpg",
    banner_url: null,
    description: "Short desc", // less than 20 chars, so incomplete
    whatsapp_number: "08012345678",
    payment_method: "both",
    paystack_subaccount_code: null,
  };

  const renderComponent = (shop: any = mockShop, productsCount: number = 0) => {
    return render(
      <BrowserRouter>
        <ProfileCompletionChecklist shop={shop} productsCount={productsCount} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the progress correctly", () => {
    renderComponent();
    
    // Total items: 8
    // Complete in mockShop: 
    // 1. Claim store (shop is truthy)
    // 2. Logo (logo_url is truthy)
    // 3. WhatsApp (whatsapp_number is truthy)
    // 4. Payment (payment_method is truthy)
    // Total complete: 4/8 (50%)
    
    expect(screen.getByText("4/8 Completed")).toBeInTheDocument();
  });

  it("shows celebration mode when 100% complete", () => {
    const completeShop = {
      ...mockShop,
      banner_url: "banner.jpg",
      description: "This is a very long description that is over 20 characters long.",
      paystack_subaccount_code: "sub_123",
    };
    
    renderComponent(completeShop, 1); // productsCount 1
    
    expect(screen.getByText("You are officially a Boss! 👑")).toBeInTheDocument();
  });

  it("can be dismissed and restored", () => {
    renderComponent();
    
    const dismissButton = screen.getAllByRole("button")[0]; // The X button
    fireEvent.click(dismissButton);
    
    expect(screen.queryByText("Build your store, one step at a time.")).not.toBeInTheDocument();
    expect(screen.getByText(/Setup Checklist/)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/Setup Checklist/));
    expect(screen.getByText("Build your store, one step at a time.")).toBeInTheDocument();
  });
});

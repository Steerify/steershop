import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { VendorSetupWizard } from "../VendorSetupWizard";
import shopService from "@/services/shop.service";
import { supabase } from "@/integrations/supabase/client";

// Mock the dependencies
vi.mock("@/services/shop.service", () => ({
  default: {
    createShop: vi.fn(),
    updateShop: vi.fn(),
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the AdirePattern to simplify rendering
vi.mock("@/components/patterns/AdirePattern", () => ({
  AdirePattern: () => <div data-testid="adire-pattern" />,
}));

describe("VendorSetupWizard", () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Step 1 correctly when open", () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);
    
    expect(screen.getByText("Let's build your store.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Sarah's Bakery")).toBeInTheDocument();
  });

  it("advances to Step 2 after creating a shop", async () => {
    (shopService.createShop as any).mockResolvedValue({ data: { id: "shop-123" } });
    
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);
    
    const input = screen.getByPlaceholderText("e.g. Sarah's Bakery");
    fireEvent.change(input, { target: { value: "My Test Shop" } });
    
    const button = screen.getByText("Create Store");
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("What are you selling?")).toBeInTheDocument();
    });
  });

  it("shows URL preview based on shop name", () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);
    
    const input = screen.getByPlaceholderText("e.g. Sarah's Bakery");
    fireEvent.change(input, { target: { value: "Sarah's Bakery" } });
    
    expect(screen.getByText("sarahs-bakery")).toBeInTheDocument();
  });

  it("allows skipping the product step", async () => {
    (shopService.createShop as any).mockResolvedValue({ data: { id: "shop-123" } });
    
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);
    
    // Move to step 2
    fireEvent.change(screen.getByPlaceholderText("e.g. Sarah's Bakery"), { target: { value: "Shop" } });
    fireEvent.click(screen.getByText("Create Store"));
    
    await waitFor(() => {
      expect(screen.getByText("Skip for now")).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText("Skip for now"));
    
    await waitFor(() => {
      expect(screen.getByText("How will they reach you?")).toBeInTheDocument();
    });
  });
});

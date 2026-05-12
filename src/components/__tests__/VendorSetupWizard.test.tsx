import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { VendorSetupWizard } from "../VendorSetupWizard";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/services/shop.service", () => ({
  default: {
    createShop: vi.fn(),
    updateShop: vi.fn(),
    createDefaultShopAddress: vi.fn(),
  },
}));

vi.mock("@/services/product.service", () => ({
  default: {
    createProduct: vi.fn(),
  },
}));

vi.mock("@/services/upload.service", () => ({
  uploadService: {
    uploadImage: vi.fn().mockResolvedValue({ url: "https://example.com/image.jpg" }),
  },
}));

const createSupabaseQuery = (table: string) => {
  const query: Record<string, unknown> = {
    select: vi.fn(() => query),
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn().mockResolvedValue(
      table === "user_roles"
        ? { data: { role: "shop_owner" }, error: null }
        : { data: { role: "shop_owner", needs_role_selection: false }, error: null }
    ),
    then: (resolve: (value: { error: null }) => void) => Promise.resolve(resolve({ error: null })),
  };

  return query;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => createSupabaseQuery(table)),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
    },
  },
}));


vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/components/patterns/AdirePattern", () => ({
  AdirePattern: () => <div data-testid="adire-pattern" />,
}));

const selectOption = async (triggerIndex: number, optionText: string) => {
  fireEvent.click(screen.getAllByRole("combobox")[triggerIndex]);
  fireEvent.click(await screen.findByText(optionText));
};

const fillRequiredShopFields = async () => {
  fireEvent.change(screen.getByPlaceholderText("e.g. Sarah's Bakery"), { target: { value: "My Test Shop" } });
  await selectOption(0, "Fashion & Apparel");
  await selectOption(1, "Lagos");
  fireEvent.change(screen.getByPlaceholderText("e.g. Ikeja"), { target: { value: "Ikeja" } });
};

describe("VendorSetupWizard", () => {
  const onComplete = vi.fn();

  beforeAll(() => {
    window.scrollTo = vi.fn();
    Element.prototype.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(shopService.createShop).mockResolvedValue({ success: true, data: { id: "shop-123", slug: "my-test-shop" }, message: "Shop created successfully" });
    vi.mocked(shopService.createDefaultShopAddress).mockResolvedValue({ success: true, data: { id: "address-123" }, message: "Shop address created successfully" });
    vi.mocked(productService.createProduct).mockResolvedValue({ success: true, data: { id: "product-123" }, message: "Product created successfully" });
  });

  it("renders Step 1 correctly when open", () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    expect(screen.getByText("Let's build your store.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Sarah's Bakery")).toBeInTheDocument();
  });

  it("advances to Step 2 after creating a shop with required details", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    fireEvent.click(screen.getByText("Create Store"));

    await waitFor(() => {
      expect(shopService.createShop).toHaveBeenCalledWith(expect.objectContaining({
        name: "My Test Shop",
        description: "Welcome to My Test Shop",
      }));
      expect(shopService.updateShop).toHaveBeenCalledWith("shop-123", expect.objectContaining({
        category: "Fashion & Apparel",
        state: "Lagos",
        city: "Ikeja",
      }));
      expect(screen.getByText("What are you selling?")).toBeInTheDocument();
    });
  });

  it("shows URL preview based on shop name", () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. Sarah's Bakery"), { target: { value: "Sarah's Bakery" } });

    expect(screen.getByText("sarahs-bakery")).toBeInTheDocument();
  });

  it("creates a product with data required by the product service", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    fireEvent.click(screen.getByText("Create Store"));

    await screen.findByText("What are you selling?");
    fireEvent.change(screen.getByPlaceholderText("e.g. Chocolate Cake or Consultation"), { target: { value: "Chocolate Cake" } });
    fireEvent.change(screen.getByPlaceholderText("A short detail that helps customers decide..."), { target: { value: "Rich chocolate cake" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 5000"), { target: { value: "5000" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "5" } });
    fireEvent.click(screen.getByText("Add Product"));

    await waitFor(() => {
      expect(productService.createProduct).toHaveBeenCalledWith(expect.objectContaining({
        shopId: "shop-123",
        name: "Chocolate Cake",
        description: "Rich chocolate cake",
        price: 5000,
        inventory: 5,
        stockUnit: "units",
      }));
      expect(screen.getByText("How will they reach you?")).toBeInTheDocument();
    });
  });

  it("saves a normalized WhatsApp number and completes setup", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    fireEvent.click(screen.getByText("Create Store"));
    await screen.findByText("What are you selling?");
    fireEvent.click(screen.getByText("Skip for now"));
    await screen.findByText("How will they reach you?");

    fireEvent.change(screen.getByPlaceholderText("e.g. 08012345678"), { target: { value: "08012345678" } });
    fireEvent.click(screen.getByText("Finish Setup"));

    await waitFor(() => {
      expect(shopService.updateShop).toHaveBeenCalledWith("shop-123", {
        whatsapp_number: "+2348012345678",
        is_active: true,
      });
      expect(supabase.from).toHaveBeenCalledWith("profiles");
    });
    expect(screen.getByText("You're all set! 🚀")).toBeInTheDocument();
  });

  it("saves a default address when address and WhatsApp are provided", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    fireEvent.change(screen.getByPlaceholderText("e.g. 123 Herbert Macaulay Way"), { target: { value: "123 Herbert Macaulay Way" } });
    fireEvent.click(screen.getByText("Create Store"));
    await screen.findByText("What are you selling?");
    fireEvent.click(screen.getByText("Skip for now"));
    await screen.findByText("How will they reach you?");

    fireEvent.change(screen.getByPlaceholderText("e.g. 08012345678"), { target: { value: "08012345678" } });
    fireEvent.click(screen.getByText("Finish Setup"));

    await waitFor(() => {
      expect(shopService.createDefaultShopAddress).toHaveBeenCalledWith("shop-123", {
        label: "Main location",
        contactName: "My Test Shop",
        contactPhone: "+2348012345678",
        addressLine1: "123 Herbert Macaulay Way",
        city: "Ikeja",
        state: "Lagos",
      });
    });
  });

  it("completes onboarding even if address creation fails (non-critical)", async () => {
    vi.mocked(shopService.createDefaultShopAddress).mockRejectedValue(new Error("Database error"));
    
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    fireEvent.change(screen.getByPlaceholderText("e.g. 123 Herbert Macaulay Way"), { target: { value: "123 Herbert Macaulay Way" } });
    fireEvent.click(screen.getByText("Create Store"));
    await screen.findByText("What are you selling?");
    fireEvent.click(screen.getByText("Skip for now"));
    await screen.findByText("How will they reach you?");

    fireEvent.change(screen.getByPlaceholderText("e.g. 08012345678"), { target: { value: "08012345678" } });
    fireEvent.click(screen.getByText("Finish Setup"));

    await waitFor(() => {
      // Should still reach the final step despite the address error
      expect(screen.getByText("You're all set! 🚀")).toBeInTheDocument();
    });
    
    // After 2 seconds, onComplete should be called
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

});

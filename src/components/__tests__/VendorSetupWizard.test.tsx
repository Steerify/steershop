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

const supabaseMocks = vi.hoisted(() => ({
  shopAddressInsert: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "shop_addresses") {
        return {
          insert: supabaseMocks.shopAddressInsert,
        };
      }

      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
    }),
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

const advanceToContactStep = async () => {
  fireEvent.click(screen.getByText("Create Store"));
  await screen.findByText("What are you selling?");
  fireEvent.click(screen.getByText("Skip for now"));
  await screen.findByText("How will they reach you?");
};

describe("VendorSetupWizard", () => {
  const onComplete = vi.fn();

  beforeAll(() => {
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(shopService.createShop).mockResolvedValue({ success: true, data: { id: "shop-123", slug: "my-test-shop" }, message: "Shop created successfully" });
    vi.mocked(shopService.createDefaultShopAddress).mockResolvedValue({ success: true, data: { id: "address-123" }, message: "Shop address created successfully" });
    vi.mocked(productService.createProduct).mockResolvedValue({ success: true, data: { id: "product-123" }, message: "Product created successfully" });
    supabaseMocks.shopAddressInsert.mockResolvedValue({ error: null });
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


  it("does not allow Step 3 to be skipped when a shop address is present", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    fireEvent.change(screen.getByPlaceholderText("e.g. 123 Herbert Macaulay Way"), { target: { value: "123 Herbert Macaulay Way" } });
    await advanceToContactStep();

    const skipButton = screen.getByRole("button", { name: "Add contact to save address" });
    expect(skipButton).toBeDisabled();
    expect(screen.getByText("Your address will not be saved to pickup addresses until a contact phone is added.")).toBeInTheDocument();
  });

  it("allows Step 3 to be skipped when no shop address is present", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    await advanceToContactStep();

    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    await waitFor(() => {
      expect(shopService.updateShop).toHaveBeenCalledWith("shop-123", { is_active: true });
      expect(screen.getByText("You're all set! 🚀")).toBeInTheDocument();
    });
    expect(supabaseMocks.shopAddressInsert).not.toHaveBeenCalled();
  });

  it("saves the shop address only when address and contact fields are available", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    fireEvent.change(screen.getByPlaceholderText("e.g. 123 Herbert Macaulay Way"), { target: { value: "123 Herbert Macaulay Way" } });
    await advanceToContactStep();

    fireEvent.change(screen.getByPlaceholderText("e.g. 08012345678"), { target: { value: "08012345678" } });
    fireEvent.click(screen.getByText("Finish Setup"));

    await waitFor(() => {
      expect(supabaseMocks.shopAddressInsert).toHaveBeenCalledWith(expect.objectContaining({
        shop_id: "shop-123",
        label: "Primary pickup address",
        contact_name: "My Test Shop",
        contact_phone: "+2348012345678",
        address_line_1: "123 Herbert Macaulay Way",
        city: "Ikeja",
        state: "Lagos",
        is_default: true,
      }));
    });
  });

  it("saves a normalized WhatsApp number and completes setup", async () => {
    render(<VendorSetupWizard open={true} onComplete={onComplete} />);

    await fillRequiredShopFields();
    await advanceToContactStep();

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

});

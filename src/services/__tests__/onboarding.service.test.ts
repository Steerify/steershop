import { beforeEach, describe, expect, it, vi } from "vitest";
import onboardingService from "@/services/onboarding.service";
import { supabase } from "@/integrations/supabase/client";

const { fromMock, getUserMock, selectMock, eqMock, limitMock, insertMock } = vi.hoisted(() => {
  const limitMock = vi.fn();
  const eqMock = vi.fn(() => ({ limit: limitMock }));
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  const insertMock = vi.fn();
  const fromMock = vi.fn(() => ({ select: selectMock, insert: insertMock }));
  const getUserMock = vi.fn();

  return { fromMock, getUserMock, selectMock, eqMock, limitMock, insertMock };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: fromMock,
    auth: {
      getUser: getUserMock,
    },
  },
}));

const onboardingData = {
  businessType: "Fashion & Apparel",
  customerSource: "streamlined_vendor_setup_wizard",
  biggestStruggle: "getting_store_online_quickly",
  paymentMethod: "not_collected_in_vendor_setup",
  deliveryMethod: "city_state_location_collected",
  setupPreference: "streamlined_vendor_setup_wizard",
};

describe("onboardingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitMock.mockResolvedValue({ data: [], error: null });
    insertMock.mockResolvedValue({ error: null });
    getUserMock.mockResolvedValue({ data: { user: { id: "user-123" } } });
  });

  it("stores onboarding response fields for a user", async () => {
    await onboardingService.storeOnboardingResponse("user-123", onboardingData);

    expect(fromMock).toHaveBeenCalledWith("onboarding_responses");
    expect(selectMock).toHaveBeenCalledWith("id");
    expect(eqMock).toHaveBeenCalledWith("user_id", "user-123");
    expect(limitMock).toHaveBeenCalledWith(1);
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-123",
      business_type: "Fashion & Apparel",
      customer_source: "streamlined_vendor_setup_wizard",
      biggest_struggle: "getting_store_online_quickly",
      payment_method: "not_collected_in_vendor_setup",
      delivery_method: "city_state_location_collected",
      perfect_feature: null,
      setup_preference: "streamlined_vendor_setup_wizard",
    });
  });

  it("does not insert a duplicate onboarding response for the same user", async () => {
    limitMock.mockResolvedValue({ data: [{ id: "response-123" }], error: null });

    await onboardingService.storeOnboardingResponse("user-123", onboardingData);

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("submitOnboarding stores through the duplicate-safe response helper", async () => {
    await onboardingService.submitOnboarding(onboardingData);

    expect(getUserMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("user_id", "user-123");
    expect(insertMock).toHaveBeenCalledTimes(1);
  });
});

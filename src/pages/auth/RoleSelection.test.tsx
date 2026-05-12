import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoleSelection from "./RoleSelection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const navigate = vi.fn();
const toast = vi.fn();
const refreshUser = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(() => {
      throw new Error("RoleSelection must use select_user_role instead of direct table writes");
    }),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/components/patterns/AdirePattern", () => ({
  AdirePattern: () => <div data-testid="adire-pattern" />,
}));

describe("RoleSelection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ refreshUser } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: "google-oauth-user" } } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    vi.mocked(supabase.rpc).mockResolvedValue({ data: { role: "shop_owner" }, error: null } as never);
  });

  it("selects shop_owner through the trusted RPC for an entrepreneur after Google OAuth", async () => {
    render(<RoleSelection />);

    fireEvent.click(await screen.findByText("Entrepreneur"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("select_user_role", { p_role: "shop_owner" });
    });

    expect(supabase.from).not.toHaveBeenCalled();
    expect(refreshUser).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("selects customer through the trusted RPC for customer onboarding", async () => {
    render(<RoleSelection />);

    fireEvent.click(await screen.findByText("Customer"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("select_user_role", { p_role: "customer" });
    });

    expect(supabase.from).not.toHaveBeenCalled();
    expect(refreshUser).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/customer_dashboard");
    });
  });
});

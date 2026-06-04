import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Auth from "./Auth";

const signInMock = vi.fn();
const signUpMock = vi.fn();
const resetPasswordMock = vi.fn();
const dispatchMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    signIn: signInMock,
    signUp: signUpMock,
    resetPassword: resetPasswordMock,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ ui: { returnUrl: null, lastRoute: null } }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

vi.mock("@/components/auth/GoogleSignInButton", () => ({
  GoogleSignInButton: () => <div data-testid="google-sign-in" />,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    })),
  },
}));

const renderAuth = (initialRoute = "/auth") =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/:type" element={<Auth />} />
        <Route path="/merchant-signup" element={<Auth />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Auth signup form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInMock.mockResolvedValue({ error: null });
    signUpMock.mockResolvedValue({ error: null });
    resetPasswordMock.mockResolvedValue({ error: null });
  });

  it("keeps typed signup values visible and submits them after switching from login", async () => {
    renderAuth();

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    const identifierInput = screen.getByPlaceholderText(
      "email@example.com or 08012345678",
    );
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(identifierInput, {
      target: { value: "new.owner@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });

    expect(identifierInput).toHaveValue("new.owner@example.com");
    expect(passwordInput).toHaveValue("Password123");

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: "new.owner@example.com",
          password: "Password123",
          role: "ENTREPRENEUR",
        }),
      );
    });
  });
});

/**
 * useUnsavedChanges hook — unit tests
 *
 * Core guarantee: the blocker MUST NOT fire during the initial navigation
 * to the page (the mount tick), which was the cause of blank /my-store and
 * /products pages in React Router v6.30+.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import React from "react";
import { useUnsavedChanges } from "../useUnsavedChanges";

// ── helpers ────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const router = createMemoryRouter([
    {
      path: "/",
      element: children as React.ReactElement,
    },
  ], {
    initialEntries: ["/"],
  });
  return React.createElement(RouterProvider, { router });
};

// ── tests ──────────────────────────────────────────────────────────────────

describe("useUnsavedChanges", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("mounts without throwing — pages render successfully", () => {
    expect(() => {
      renderHook(() => useUnsavedChanges(false), { wrapper });
    }).not.toThrow();
  });

  it("does NOT call confirm when isDirty=false", () => {
    renderHook(() => useUnsavedChanges(false), { wrapper });
    vi.runAllTimers();
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it("registers beforeunload listener on mount", () => {
    renderHook(() => useUnsavedChanges(true), { wrapper });
    expect(window.addEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
  });

  it("removes beforeunload listener on unmount", () => {
    const { unmount } = renderHook(() => useUnsavedChanges(true), { wrapper });
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
  });

  it("beforeunload event fires the browser warning when isDirty=true", () => {
    renderHook(() => useUnsavedChanges(true), { wrapper });

    const event = new Event("beforeunload") as BeforeUnloadEvent;
    Object.defineProperty(event, "returnValue", { writable: true, value: "" });
    vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("beforeunload does NOT fire when isDirty=false", () => {
    renderHook(() => useUnsavedChanges(false), { wrapper });

    const event = new Event("beforeunload") as BeforeUnloadEvent;
    Object.defineProperty(event, "returnValue", { writable: true, value: "" });
    vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});


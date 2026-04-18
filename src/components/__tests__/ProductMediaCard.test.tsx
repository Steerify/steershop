import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProductMediaCard } from "../ProductMediaCard";

describe("ProductMediaCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders image-only state when only imageUrl is provided", () => {
    render(<ProductMediaCard imageUrl="https://cdn.test/product.jpg" alt="Test product" />);

    expect(screen.getByTestId("product-media-image")).toBeInTheDocument();
    expect(screen.queryByTestId("product-media-video")).not.toBeInTheDocument();
  });

  it("renders video-only state and uses metadata preload for efficiency", () => {
    render(<ProductMediaCard videoUrl="https://cdn.test/product.mp4" alt="Video product" />);

    const video = screen.getByTestId("product-media-video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("falls back to image when video errors", () => {
    render(
      <ProductMediaCard
        imageUrl="https://cdn.test/fallback.jpg"
        videoUrl="https://cdn.test/broken.mp4"
        alt="Fallback product"
      />
    );

    const video = screen.getByTestId("product-media-video");
    fireEvent.error(video);

    expect(screen.queryByTestId("product-media-video")).not.toBeInTheDocument();
    expect(screen.getByTestId("product-media-image")).toBeInTheDocument();
  });
});

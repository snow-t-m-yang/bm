"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, ChevronDown, ChevronUp, Download, Share, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import type { Artwork } from "../types/artwork";
import { toast } from "./ui/use-toast";
import { Toaster } from "./ui/toaster";
import useTranslation from "../hooks/useTranslation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DonationSheet } from "./donation-sheet";
import { translateBibleReference } from "@/utils/bible-utils";

interface ImageGalleryProps {
  artworks: Artwork[];
  infiniteScroll?: boolean;
  initialLimit?: number;
}

export function ImageGallery({
  artworks,
  infiniteScroll = false,
  initialLimit = 8,
}: ImageGalleryProps) {
  // Core state
  const [displayCount, setDisplayCount] = useState(initialLimit);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showDonationSheet, setShowDonationSheet] = useState(false);
  const [lightboxCarouselInitialized, setLightboxCarouselInitialized] = useState(false);

  // Refs
  const observerRef = useRef<HTMLDivElement>(null);
  const urlUpdatingRef = useRef(false);

  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, currentLanguage } = useTranslation("gallery");

  // Derived values
  const visibleArtworks = artworks.slice(0, displayCount);
  const selectedArtwork = selectedArtworkId
    ? artworks.find((a) => a.id === selectedArtworkId) || null
    : null;
  const selectedIndex = selectedArtworkId
    ? artworks.findIndex((a) => a.id === selectedArtworkId)
    : -1;

  // Initialize selectedArtworkId from URL if present
  useEffect(() => {
    if (urlUpdatingRef.current) return;

    const imageId = searchParams?.get("image");
    if (imageId && !selectedArtworkId) {
      const artwork = artworks.find((a) => a.id === imageId);
      if (artwork) {
        setSelectedArtworkId(artwork.id);
      }
    }
  }, [searchParams, artworks, selectedArtworkId]);

  // Update URL when selectedArtworkId changes (avoid circular updates)
  useEffect(() => {
    if (!selectedArtworkId || !router || !pathname || urlUpdatingRef.current) return;

    const params = new URLSearchParams(searchParams?.toString() || "");
    const currentImageId = params.get("image");

    if (currentImageId !== selectedArtworkId) {
      urlUpdatingRef.current = true;
      params.set("image", selectedArtworkId);

      // Use setTimeout to batch updates and avoid multiple URL changes
      setTimeout(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });

        // Reset flag after URL update
        setTimeout(() => {
          urlUpdatingRef.current = false;
        }, 100);
      }, 0);
    }
  }, [selectedArtworkId, router, pathname, searchParams]);

  // Infinite scroll effect
  useEffect(() => {
    if (!infiniteScroll || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < artworks.length) {
          setDisplayCount((prev) => Math.min(prev + 8, artworks.length));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [infiniteScroll, displayCount, artworks.length]);

  // Body scroll lock when lightbox is open
  useEffect(() => {
    document.body.style.overflow = selectedArtworkId ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedArtworkId]);

  // Event handlers
  const handleClose = () => {
    if (urlUpdatingRef.current) return;

    // Set flag to prevent race conditions
    urlUpdatingRef.current = true;

    // Clear selected artwork state
    setSelectedArtworkId(null);
    setLightboxCarouselInitialized(false);

    // Update URL
    if (searchParams?.has("image")) {
      try {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("image");
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        // Use timeout to ensure state is updated before URL changes
        setTimeout(() => {
          if (!newUrl) {
            console.error("No URL to update");
            return;
          }
          router.replace(newUrl, { scroll: false });

          // Reset flag after URL update
          setTimeout(() => {
            urlUpdatingRef.current = false;
          }, 100);
        }, 0);
      } catch (error) {
        console.error("Error updating URL:", error);
        urlUpdatingRef.current = false;
      }
    } else {
      urlUpdatingRef.current = false;
    }
  };

  const handleImageClick = (artworkId: string) => {
    if (urlUpdatingRef.current) return;
    setSelectedArtworkId(artworkId);
  };

  const handleDownload = () => {
    if (!selectedArtwork) return;

    // Show the donation sheet first
    setShowDonationSheet(true);

    // Then trigger the download
    setTimeout(() => {
      try {
        // Use fetch to get the image as a blob first to prevent redirection
        fetch(selectedArtwork.imageUrl)
          .then((response) => response.blob())
          .then((blob) => {
            // Create a blob URL
            const blobUrl = URL.createObjectURL(blob);

            // Create link element
            const link = document.createElement("a");
            const filename = `${selectedArtwork.title.replace(/\s+/g, "-").toLowerCase()}-${
              selectedArtwork.id
            }.jpg`;

            // Configure link for download
            link.href = blobUrl;
            link.download = filename;
            link.target = "_blank"; // Ensures it doesn't redirect in the same window
            link.rel = "noopener"; // Security best practice
            link.style.display = "none";

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(blobUrl); // Free up memory
            }, 100);

            toast({
              title: t("toast.downloadSuccess.title"),
              description: t("toast.downloadSuccess.description"),
            });
          })
          .catch((error) => {
            console.error("Download failed:", error);
            toast({
              title: t("toast.downloadFailed.title"),
              description: t("toast.downloadFailed.description"),
              variant: "destructive",
            });
          });
      } catch (error) {
        console.error("Fatal download error:", error);
        toast({
          title: t("toast.downloadFailed.title"),
          description: t("toast.downloadFailed.description"),
          variant: "destructive",
        });
      }
    }, 100); // Small delay to ensure sheet appears first
  };

  const handleShare = () => {
    if (!selectedArtwork) return;

    const url = `${window.location.origin}${pathname}?image=${selectedArtwork.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: t("toast.linkCopied.title"),
          description: t("toast.linkCopied.description"),
        });
      })
      .catch(() => {
        toast({
          title: t("toast.copyFailed.title"),
          description: t("toast.copyFailed.description"),
          variant: "destructive",
        });
      });
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleArtworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group cursor-pointer"
            onClick={() => handleImageClick(artwork.id)}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={artwork.imageUrl || "/placeholders/artwork-placeholder.svg"}
                alt={artwork.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </div>
            <div className="mt-3">
              <h3 className="font-medium text-lg">{artwork.title}</h3>
              <p className="text-sm text-muted-foreground">{artwork.year}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {!infiniteScroll && displayCount < artworks.length && (
        <div className="mt-12 text-center">
          <Button
            onClick={() => setDisplayCount((prev) => Math.min(prev + 8, artworks.length))}
            className="rounded-3xl px-8"
          >
            {t("loadMore")}
          </Button>
        </div>
      )}

      {/* Infinite Scroll Observer */}
      {infiniteScroll && displayCount < artworks.length && (
        <div ref={observerRef} className="w-full h-20 flex items-center justify-center mt-8">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {/* Lightbox using Carousel */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop with close handler */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-lg"
            onClick={handleClose}
          />

          {/* Lightbox Content */}
          <div
            className="relative z-[101] max-w-5xl w-full bg-background/90 backdrop-blur-lg rounded-3xl overflow-hidden border border-primary/10 m-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-border/30">
              <h2 className="text-2xl font-bold">{selectedArtwork.title}</h2>
              <div className="flex gap-4 items-center">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-background/70 transition-colors"
                >
                  <Share className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-background/70 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span className="sr-only">Download</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 hover:bg-background/70 transition-colors"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="overflow-y-auto flex-grow p-4">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image Carousel */}
                <div className="w-full lg:w-3/5">
                  <Carousel
                    opts={{
                      loop: true,
                      startIndex: selectedIndex,
                    }}
                    className="w-full"
                    onSelect={() => {
                      if (!lightboxCarouselInitialized) {
                        setLightboxCarouselInitialized(true);
                      }
                    }}
                  >
                    <CarouselContent>
                      {artworks.map((artwork) => (
                        <CarouselItem key={artwork.id}>
                          <div className="relative h-[50vh] rounded-xl overflow-hidden">
                            <Image
                              src={artwork.imageUrl || "/placeholders/artwork-placeholder.svg"}
                              alt={artwork.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 90vw, 60vw"
                              loading="eager"
                              onLoadingComplete={() => {
                                if (
                                  artwork.id === selectedArtworkId &&
                                  !lightboxCarouselInitialized
                                ) {
                                  setLightboxCarouselInitialized(true);
                                }
                              }}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="lg:-left-4 left-2" />
                    <CarouselNext className="lg:-right-4 right-2" />
                  </Carousel>
                </div>

                {/* Details */}
                <div className="w-full lg:w-2/5 flex flex-col gap-4">
                  <div>
                    <p className="text-muted-foreground">{selectedArtwork.year}</p>

                    {/* Scripture section (for Bible artworks) */}
                    {selectedArtwork.customFields &&
                      (selectedArtwork.customFields.Scripture ||
                        selectedArtwork.customFields.經文) && (
                        <div className="mt-4 mb-2 bg-muted/50 p-4 rounded-md">
                          <h3 className="font-medium mb-2">
                            {t("bibleGallery.properties.scripture") || "Scripture"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedArtwork.customFields.Scripture ||
                              selectedArtwork.customFields.經文}
                          </p>
                          {(selectedArtwork.customFields.Reference ||
                            selectedArtwork.customFields.參考) && (
                            <div className="mt-2 text-xs text-muted-foreground/70">
                              <span className="font-medium">
                                {currentLanguage === "zh-TW" ||
                                document.documentElement.lang?.includes("zh")
                                  ? translateBibleReference(
                                      selectedArtwork.customFields.Reference ||
                                        selectedArtwork.customFields.參考 ||
                                        ""
                                    )
                                  : selectedArtwork.customFields.Reference ||
                                    selectedArtwork.customFields.參考}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Artwork Description */}
                    <p className="mt-4 text-muted-foreground">{selectedArtwork.description}</p>
                  </div>

                  {/* Details Section */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{t("artwork.details") || "Artwork Details"}</h3>
                      <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-background/70 transition-colors"
                      >
                        {showDetails ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showDetails ? "Hide Details" : "Show Details"}
                        </span>
                      </button>
                    </div>

                    {showDetails && (
                      <div className="space-y-2 border-t border-border pt-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {t("artwork.medium") || "Medium"}
                          </span>
                          <span className="text-sm">{selectedArtwork.medium}</span>
                        </div>
                        <div className="flex justify-between">
                          {selectedArtwork.dimensions && (
                            <span className="text-sm text-muted-foreground">
                              {t("artwork.dimensions") || "Dimensions"}
                              <span className="text-sm">{selectedArtwork.dimensions}</span>
                            </span>
                          )}
                        </div>
                        {selectedArtwork.location && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {t("artwork.location") || "Location"}
                            </span>
                            <span className="text-sm">{selectedArtwork.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Sheet */}
      <DonationSheet open={showDonationSheet} onOpenChange={setShowDonationSheet} />

      <Toaster />
    </>
  );
}

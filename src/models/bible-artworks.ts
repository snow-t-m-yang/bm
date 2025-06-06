import bibleArtworks from "@/data/bible-artworks-data";
import { BOOK_ORDER } from "@/data/books-order";
import { assertIsDefined } from "@/lib/utils";
import { BibleArtwork, BibleArtworksLocale } from "@/types/bible-artwork";

const BibleArtworks = {
  data: bibleArtworks,
  order: BOOK_ORDER,

  getAll: async (): Promise<BibleArtwork[]> => {
    const res = await fetch("/api/bible-artworks", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch bible artworks from API");
    }
    return res.json();
  },

  toLocaleScripture: (
    artworks: BibleArtwork[],
    currentLanguage: string,
  ): BibleArtworksLocale[] => {
    assertIsDefined(currentLanguage, "currentLanguage is not defined");

    const localedArtworks = artworks.map((artwork) => {
      const scripture = currentLanguage.split("-").includes("zh")
        ? artwork.scriptures.zh ?? ""
        : artwork.scriptures.en ?? "";

      return {
        ...artwork,
        scripture,
        showDetailsByDefault: true,
      };
    });

    return localedArtworks;
  },

  toGrouped: (
    artworks: BibleArtworksLocale[],
  ): Record<string, BibleArtworksLocale[]> => {
    return artworks.reduce((acc, artwork) => {
      const book = artwork.book;
      return {
        ...acc,
        [book]: [...(acc[book] || []), artwork],
      };
    }, {} as Record<string, BibleArtworksLocale[]>);
  },

  toSoredGroupsCanonical: (
    grouped: Record<string, BibleArtworksLocale[]>,
    order: string[],
  ): Array<[string, BibleArtworksLocale[]]> => {
    return order.filter((bookName) => bookName in grouped).map((
      bookName,
    ) => [bookName, grouped[bookName] as BibleArtworksLocale[]]);
  },
};

export default BibleArtworks;

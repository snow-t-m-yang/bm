/**
 * Map of Bible book names from English to Traditional Chinese
 */
export const bibleBookTranslations: Record<string, string> = {
  // Old Testament - 舊約
  Genesis: "創世記",
  Exodus: "出埃及記",
  Leviticus: "利未記",
  Numbers: "民數記",
  Deuteronomy: "申命記",
  Joshua: "約書亞記",
  Judges: "士師記",
  Ruth: "路得記",
  "1 Samuel": "撒母耳記上",
  "2 Samuel": "撒母耳記下",
  "1 Kings": "列王紀上",
  "2 Kings": "列王紀下",
  "1 Chronicles": "歷代志上",
  "2 Chronicles": "歷代志下",
  Ezra: "以斯拉記",
  Nehemiah: "尼希米記",
  Esther: "以斯帖記",
  Job: "約伯記",
  Psalm: "詩篇",
  Psalms: "詩篇",
  Proverbs: "箴言",
  Ecclesiastes: "傳道書",
  "Song of Solomon": "雅歌",
  "Song of Songs": "雅歌",
  Isaiah: "以賽亞書",
  Jeremiah: "耶利米書",
  Lamentations: "耶利米哀歌",
  Ezekiel: "以西結書",
  Daniel: "但以理書",
  Hosea: "何西阿書",
  Joel: "約珥書",
  Amos: "阿摩司書",
  Obadiah: "俄巴底亞書",
  Jonah: "約拿書",
  Micah: "彌迦書",
  Nahum: "那鴻書",
  Habakkuk: "哈巴谷書",
  Zephaniah: "西番雅書",
  Haggai: "哈該書",
  Zechariah: "撒迦利亞書",
  Malachi: "瑪拉基書",

  // New Testament - 新約
  Matthew: "馬太福音",
  Mark: "馬可福音",
  Luke: "路加福音",
  John: "約翰福音",
  Acts: "使徒行傳",
  Romans: "羅馬書",
  "1 Corinthians": "哥林多前書",
  "2 Corinthians": "哥林多後書",
  Galatians: "加拉太書",
  Ephesians: "以弗所書",
  Philippians: "腓立比書",
  Colossians: "歌羅西書",
  "1 Thessalonians": "帖撒羅尼迦前書",
  "2 Thessalonians": "帖撒羅尼迦後書",
  "1 Timothy": "提摩太前書",
  "2 Timothy": "提摩太後書",
  Titus: "提多書",
  Philemon: "腓利門書",
  Hebrews: "希伯來書",
  James: "雅各書",
  "1 Peter": "彼得前書",
  "2 Peter": "彼得後書",
  "1 John": "約翰一書",
  "2 John": "約翰二書",
  "3 John": "約翰三書",
  Jude: "猶大書",
  Revelation: "啟示錄",
};

/**
 * Translates a Bible book name from English to Traditional Chinese
 * @param englishBookName - The English name of the Bible book
 * @returns The Traditional Chinese name of the Bible book, or the original name if not found
 */
export function translateBibleBook(englishBookName: string): string {
  // Normalize the book name to handle variations (e.g., "Psalms" vs "Psalm")
  const normalizedName = englishBookName.trim();

  // Return the Chinese translation if it exists, otherwise return the original
  return bibleBookTranslations[normalizedName] || englishBookName;
}

/**
 * Translates a Bible reference from English to Traditional Chinese
 * For example: "John 3:16" becomes "約翰福音 3:16"
 * @param reference - The Bible reference in English
 * @returns The reference with the book name translated to Traditional Chinese
 */
export function translateBibleReference(reference: string): string {
  // Extract book name and reference numbers from the reference
  // Typical references: "John 3:16", "Psalm 23:1-3", "Genesis 1:1-2"
  const match = reference.match(/^([\w\s]+)\s+(\d+.*)$/);

  if (!match) return reference;

  const [, bookName, verseReference] = match;
  const translatedBookName = translateBibleBook(bookName);

  return `${translatedBookName} ${verseReference}`;
}

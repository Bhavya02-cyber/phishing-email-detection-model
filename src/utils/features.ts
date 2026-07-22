const SUSPICIOUS_KEYWORDS = [
  "urgent",
  "suspended",
  "verify",
  "password",
  "click here",
  "congratulations",
  "won",
  "free",
  "claim",
  "prize",
  "limited",
  "account",
  "billing",
  "credit card",
  "social security",
  "bitcoin",
  "arrest",
  "irs",
  "undelivered",
  "shipping fee",
  "expires today",
  "locked",
  "download",
  "credentials",
  "suspicious activity",
];

const SUSPICIOUS_TLDS = [
  ".tk",
  ".ml",
  ".ga",
  ".cf",
  ".xyz",
  ".top",
  ".cc",
  ".work",
  ".click",
  ".link",
  ".biz",
];

const URL_REGEX = /https?:\/\/[^\s\"'<>()]+/gi;

export type ExtractedFeatures = {
  tokens: string[];
  urlCount: number;
  suspiciousTldCount: number;
  totalUrlLength: number;
  keywordCount: number;
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function extractFeatures(text: string): ExtractedFeatures {
  const lower = text.toLowerCase();
  const tokens = tokenize(text);

  const urls = lower.match(URL_REGEX) ?? [];
  const urlCount = urls.length;
  const totalUrlLength = urls.reduce((sum, url) => sum + url.length, 0);
  const suspiciousTldCount = urls.reduce((count, url) => {
    return SUSPICIOUS_TLDS.some((tld) => url.includes(tld)) ? count + 1 : count;
  }, 0);

  const keywordCount = SUSPICIOUS_KEYWORDS.reduce((count, kw) => {
    return lower.includes(kw) ? count + 1 : count;
  }, 0);

  return {
    tokens,
    urlCount,
    suspiciousTldCount,
    totalUrlLength,
    keywordCount,
  };
}

export class CountVectorizer {
  vocabulary: Map<string, number> = new Map();
  nFeatures: number;

  constructor(private maxFeatures = 200) {
    this.nFeatures = maxFeatures;
  }

  fit(documents: string[]) {
    const freq = new Map<string, number>();
    documents.forEach((doc) => {
      const seen = new Set<string>();
      tokenize(doc).forEach((token) => {
        if (!seen.has(token)) {
          freq.set(token, (freq.get(token) ?? 0) + 1);
          seen.add(token);
        }
      });
    });

    const sorted = Array.from(freq.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.maxFeatures)
      .map(([token]) => token);

    sorted.forEach((token, idx) => this.vocabulary.set(token, idx));
    this.nFeatures = this.vocabulary.size;
  }

  transform(documents: string[]): number[][] {
    return documents.map((doc) => this.transformOne(doc));
  }

  transformOne(document: string): number[] {
    const vec = new Array(this.nFeatures + 4).fill(0);
    const tokens = tokenize(document);
    tokens.forEach((token) => {
      const idx = this.vocabulary.get(token);
      if (idx !== undefined) {
        vec[idx] += 1;
      }
    });

    const feats = extractFeatures(document);
    vec[this.nFeatures] = feats.urlCount;
    vec[this.nFeatures + 1] = feats.suspiciousTldCount;
    vec[this.nFeatures + 2] = feats.totalUrlLength > 0 ? Math.log1p(feats.totalUrlLength) : 0;
    vec[this.nFeatures + 3] = feats.keywordCount;

    return vec;
  }

  getFeatureNames(): string[] {
    const names = Array.from(this.vocabulary.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([token]) => token);
    names.push("url_count", "suspicious_tld_count", "log_url_length", "keyword_count");
    return names;
  }
}

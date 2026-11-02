import { z } from "zod";

/** What a reader found in one document: each figure under its LifeMap key, with how sure the reader is (0..1). */
export const readResult = z.object({
  status: z.enum(["done", "failed"]),
  fields: z.array(z.object({ key: z.string(), value: z.union([z.number(), z.string()]), confidence: z.number().min(0).max(1) })),
  provider: z.string(),
  raw: z.unknown().optional(),
});
export type ReadResult = z.infer<typeof readResult>;

export type ReadInput = {
  documentId: string;
  /** What the document is for: a finance section (income, assets, liab, prot, pension) or an Explore statement (retire, home, invest). */
  kind: string;
  contentType: string;
  /** Presigned GET, valid 5 minutes. */
  url: string;
  organizationId: string;
};

/** Nest token for the DocumentReader (DocumentsModule). */
export const DOCUMENT_READER = "DocumentReader";

export interface DocumentReader {
  read(input: ReadInput): Promise<ReadResult>;
}

/**
 * Provider field name -> LifeMap key, per kind. The one place the provider's vocabulary meets ours (contract: api/README.md).
 * Names the provider sends that are not here are dropped.
 */
export const PROVIDER_KEYS: Record<string, Record<string, string>> = {
  income: { employment_status: "work", gross_annual_income: "income", monthly_spending: "costsM", yearly_one_off_costs: "oneOffY" },
  assets: { cash_savings: "cash", investments_value: "invest" },
  liab: {
    home_status: "home",
    mortgage_balance: "mortBal",
    mortgage_monthly_repayment: "mortPayM",
    mortgage_years_remaining: "mortYears",
    mortgage_interest_rate: "mortRate",
    credit_card_balance: "cardBal",
    credit_card_monthly_repayment: "cardPayM",
    loan_balance: "loanBal",
    loan_monthly_repayment: "loanPayM",
  },
  prot: { life_cover: "life", income_protection: "ip", employer_cover: "workCover", health_insurance: "health" },
  pension: { pension_value: "pension", pension_total_monthly_contribution: "pensionM", pension_own_monthly_contribution: "pensionOwnM" },
  retire: {
    pension_value: "pot",
    pension_own_monthly_contribution: "youM",
    pension_employer_monthly_contribution: "empM",
    normal_retirement_age: "nra",
    projected_value_at_retirement: "proj",
    annual_charges_percent: "chg",
    prsi_years: "prsi",
  },
  home: {
    mortgage_balance: "bal",
    mortgage_interest_rate: "rate",
    mortgage_monthly_repayment: "pay",
    mortgage_years_remaining: "yrs",
    property_value: "hval",
  },
  invest: {
    investments_value: "tot",
    monthly_amount_invested: "mon",
    holdings_shares_percent: "sh",
    holdings_bonds_percent: "bo",
    holdings_cash_percent: "ca",
    annual_charges_percent: "chg",
  },
};

// The provider's reply (api/README.md). Validated before anything is stored.
const providerReply = z.object({
  status: z.enum(["done", "failed"]),
  fields: z.array(z.object({ name: z.string(), value: z.union([z.number(), z.string()]), confidence: z.number().min(0).max(1) })).default([]),
});

/** The user's provider over HTTP: POST {url}/read with a bearer key; the reply is validated and mapped to LifeMap keys. */
export const httpReader = (url: string, apiKey: string, timeoutMs = 12_000): DocumentReader => ({
  read: async ({ documentId, kind, contentType, url: fileUrl, organizationId }) => {
    const res = await fetch(new URL("read", url.endsWith("/") ? url : `${url}/`), {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ documentId, kind, contentType, url: fileUrl, organizationId }),
      signal: AbortSignal.timeout(timeoutMs), // under the app's 15 s request timeout
    });
    if (!res.ok) throw new Error(`document reader ${res.status}`);
    const raw: unknown = await res.json();
    const reply = providerReply.parse(raw);
    const keys = PROVIDER_KEYS[kind] ?? {};
    const fields = reply.fields.flatMap(({ name, value, confidence }) => (keys[name] ? [{ key: keys[name], value, confidence }] : []));
    return { status: reply.status, fields, provider: "http", raw };
  },
});

// Today's example figures (the app's sample documents), by kind: [value, confidence].
const EXAMPLES: Record<string, Record<string, [number | string, number]>> = {
  income: { work: ["Employed", 0.99], income: [58000, 0.98], costsM: [3100, 0.74], oneOffY: [1800, 0.81] },
  assets: { cash: [9000, 0.97], invest: [6200, 0.88] },
  liab: {
    home: ["Own with mortgage", 0.99], mortBal: [203700, 0.96], mortPayM: [1180, 0.93], mortYears: [21, 0.9], mortRate: [3.85, 0.94],
    cardBal: [400, 0.86], cardPayM: [40, 0.8], loanBal: [3500, 0.88], loanPayM: [100, 0.84],
  },
  prot: { life: ["Yes", 0.95], ip: ["No", 0.82], workCover: ["Yes", 0.9], health: ["Yes", 0.97] },
  pension: { pension: [72000, 0.95], pensionM: [520, 0.91], pensionOwnM: [260, 0.91] },
  retire: { pot: [72000, 0.95], youM: [260, 0.93], empM: [260, 0.91], nra: [66, 0.96], proj: [722000, 0.84], chg: [1, 0.76], prsi: [28, 0.88] },
  home: { bal: [203700, 0.96], rate: [3.85, 0.94], pay: [1180, 0.93], yrs: [21, 0.9], hval: [420000, 0.82] },
  invest: { tot: [6200, 0.93], mon: [150, 0.9], sh: [70, 0.85], bo: [20, 0.85], ca: [10, 0.85], chg: [0.6, 0.8] },
};

/** Dev and tests: the example figures for the kind, whatever the file says. */
export const exampleReader: DocumentReader = {
  read: async ({ kind }) => ({
    status: "done",
    fields: Object.entries(EXAMPLES[kind] ?? {}).map(([key, [value, confidence]]) => ({ key, value, confidence })),
    provider: "example",
  }),
};

/**
 * DOC_READER=http|example. Outside production the default is example. Production only ever uses http with DOC_READER_URL and
 * DOC_READER_API_KEY set; anything else fails closed (every read fails, nothing made up is stored).
 */
export const documentReader = (env = process.env): DocumentReader => {
  const prod = env.NODE_ENV === "production";
  const mode = env.DOC_READER ?? (prod ? "http" : "example");
  if (mode === "example" && !prod) return exampleReader;
  if (mode === "http" && env.DOC_READER_URL && env.DOC_READER_API_KEY) return httpReader(env.DOC_READER_URL, env.DOC_READER_API_KEY);
  return {
    read: async () => {
      throw new Error("document reader not configured: set DOC_READER=http, DOC_READER_URL and DOC_READER_API_KEY");
    },
  };
};

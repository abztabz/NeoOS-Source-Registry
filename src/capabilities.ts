export type CapabilityReadiness = "ready" | "experimental" | "gap";

export interface CapabilityDefinition {
  id: string;
  label: string;
  purpose: string;
  readiness: CapabilityReadiness;
  privacyClass: "public-data-only" | "public-query-metadata";
  consumerExamples: string[];
}

export const capabilityRegistry: readonly CapabilityDefinition[] = Object.freeze([
  { id: "news-discovery", label: "News discovery", purpose: "Locate timely public-news leads without treating discovery metadata as factual evidence.", readiness: "ready", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent", "Living Website"] },
  { id: "scholarly-discovery", label: "Scholarly discovery", purpose: "Locate bibliographic records and research candidates.", readiness: "ready", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent", "Living Website"] },
  { id: "company-filings", label: "Company filings", purpose: "Retrieve official public issuer filings and submission metadata.", readiness: "ready", privacyClass: "public-data-only", consumerExamples: ["NeoCRM", "NeoOS Wealth", "NeoContent"] },
  { id: "company-registry", label: "Company registry", purpose: "Retrieve governed official public corporate-register data.", readiness: "ready", privacyClass: "public-data-only", consumerExamples: ["NeoCRM"] },
  { id: "economic-data", label: "Economic data", purpose: "Retrieve official macroeconomic and development indicators.", readiness: "ready", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth", "NeoContent"] },
  { id: "fx-rates", label: "Foreign exchange rates", purpose: "Retrieve governed reference FX series.", readiness: "ready", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth", "NeoCRM"] },
  { id: "open-data", label: "Open datasets", purpose: "Retrieve governed open datasets whose rights permit reuse.", readiness: "ready", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth", "NeoContent", "Living Website"] },
  { id: "government-open-data-discovery", label: "Government open-data discovery", purpose: "Search official government dataset catalogues while preserving dataset-specific licensing boundaries.", readiness: "ready", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent", "NeoCRM", "Living Website"] },
  { id: "weather-forecast", label: "Weather forecast", purpose: "Retrieve governed public weather forecasts.", readiness: "ready", privacyClass: "public-query-metadata", consumerExamples: ["Living Website", "NeoOS"] },
  { id: "dns-resolution", label: "DNS resolution", purpose: "Resolve public DNS records for validation and infrastructure checks.", readiness: "ready", privacyClass: "public-query-metadata", consumerExamples: ["NeoCRM", "Living Website", "NeoContent"] },
  { id: "seo-serp-discovery", label: "SERP intelligence", purpose: "Observe ranking pages and current search language without claiming search volume.", readiness: "experimental", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent"] },
  { id: "jobs-discovery", label: "Jobs discovery", purpose: "Locate public job listings through licensed or permitted feeds.", readiness: "experimental", privacyClass: "public-query-metadata", consumerExamples: ["NeoOS relocation", "Living Website"] },
  { id: "market-data", label: "Securities market data", purpose: "Retrieve market data with adequate commercial rights.", readiness: "experimental", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth"] },
  { id: "crypto-market-data", label: "Crypto market data", purpose: "Retrieve crypto market metadata under adequate rights.", readiness: "experimental", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth"] },
  { id: "entertainment-metadata", label: "Entertainment metadata", purpose: "Retrieve entertainment metadata where commercial rights are cleared.", readiness: "experimental", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent", "Living Website"] },
  { id: "geocoding", label: "Geocoding", purpose: "Convert public place queries to coordinates without sending confidential location material.", readiness: "experimental", privacyClass: "public-query-metadata", consumerExamples: ["NeoCRM", "Living Website"] },
  { id: "language-translation", label: "Language translation", purpose: "Translate bounded product text using a commercially and privacy-cleared provider.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["Living Website", "NeoContent"] },
  { id: "email-validation", label: "Email validation", purpose: "Validate addresses without leaking CRM personal data to an unapproved third party.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoCRM"] },
  { id: "company-financials", label: "Company financials", purpose: "Retrieve normalized public company financial statements and key reported metrics from rights-cleared sources.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth", "NeoCRM"] },
  { id: "corporate-actions", label: "Corporate actions", purpose: "Retrieve public dividends, splits, mergers and other issuer actions from governed sources.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth"] },
  { id: "earnings-calendar", label: "Earnings calendar", purpose: "Retrieve public scheduled earnings events with provenance and update timestamps.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth"] },
  { id: "commodity-reference-data", label: "Commodity reference data", purpose: "Retrieve governed commodity benchmark or official reference series without conflating them with retail prices.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth", "NeoContent"] },
  { id: "interest-rates", label: "Interest rates", purpose: "Retrieve official policy rates and governed benchmark rate series.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth", "NeoCRM"] },
  { id: "bond-reference-data", label: "Bond reference data", purpose: "Retrieve governed public sovereign and corporate bond reference information where reuse rights are clear.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoOS Wealth"] },
  { id: "patent-discovery", label: "Patent discovery", purpose: "Search official or licensed patent metadata for public research and competitive intelligence.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent", "NeoCRM", "Living Website"] },
  { id: "trademark-discovery", label: "Trademark discovery", purpose: "Search official public trademark records and status metadata.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoCRM", "Living Website"] },
  { id: "web-technology-detection", label: "Web technology detection", purpose: "Identify publicly observable website technologies without invasive scanning or confidential input.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoCRM", "NeoContent", "Living Website"] },
  { id: "domain-registration-data", label: "Domain registration data", purpose: "Retrieve public RDAP or equivalent registration metadata while respecting redaction and privacy boundaries.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoCRM", "Living Website"] },
  { id: "certificate-transparency", label: "Certificate transparency", purpose: "Query public certificate-transparency metadata for domain and infrastructure intelligence.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoCRM", "Living Website"] },
  { id: "place-discovery", label: "Place discovery", purpose: "Locate public points of interest and place metadata from rights-cleared sources.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["Living Website", "NeoCRM"] },
  { id: "demographics", label: "Demographics", purpose: "Retrieve official aggregate demographic statistics without identifying individuals.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["NeoContent", "NeoCRM", "Living Website"] },
  { id: "transport-open-data", label: "Transport open data", purpose: "Retrieve public transport schedules, routes or status data from governed open-data sources.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["Living Website", "NeoOS"] },
  { id: "media-catalog-metadata", label: "Media catalog metadata", purpose: "Retrieve rights-cleared public metadata for books, music, film or other media catalogues.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent", "Living Website"] },
  { id: "public-event-discovery", label: "Public event discovery", purpose: "Locate public events from licensed or official feeds with freshness and location provenance.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoContent", "Living Website"] },
  { id: "website-availability", label: "Website availability", purpose: "Check public endpoint availability without retaining sensitive request material.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["Living Website", "NeoContent", "NeoCRM"] },
  { id: "public-safety-alerts", label: "Public safety alerts", purpose: "Retrieve official public emergency or safety notices for bounded geographic contexts.", readiness: "gap", privacyClass: "public-data-only", consumerExamples: ["Living Website", "NeoOS"] }
]);

export function capabilityById(id: string): CapabilityDefinition | undefined { return capabilityRegistry.find((capability) => capability.id === id); }

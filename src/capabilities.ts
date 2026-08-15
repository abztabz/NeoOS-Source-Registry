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
  { id: "email-validation", label: "Email validation", purpose: "Validate addresses without leaking CRM personal data to an unapproved third party.", readiness: "gap", privacyClass: "public-query-metadata", consumerExamples: ["NeoCRM"] }
]);

export function capabilityById(id: string): CapabilityDefinition | undefined { return capabilityRegistry.find((capability) => capability.id === id); }

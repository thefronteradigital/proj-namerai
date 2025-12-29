"use server";

import { domainService } from "@/features/name-generator/services/domain-service";
import type { DomainResult } from "@/features/name-generator/services/domain-service";

interface CheckDomainsResponse {
  results: DomainResult[];
  error: string | null;
}

export async function checkDomainsAction(
  domains: string[]
): Promise<CheckDomainsResponse> {
  try {
    const results = await domainService.checkDomains(domains);
    return { results, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Domain check failed.";
    return { results: [], error: message };
  }
}

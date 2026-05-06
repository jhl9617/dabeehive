export type PrBodyReference = {
  id?: string | null;
  summary?: string | null;
  title?: string | null;
  url?: string | null;
};

export type PrBodyArtifactReference = PrBodyReference & {
  type?: string | null;
};

export type PrBodyContext = {
  issueId?: string | null;
  issueTitle?: string | null;
  issueUrl?: string | null;
  runId?: string | null;
  runUrl?: string | null;
};

export type PrBodyTemplateInput = {
  approval?: PrBodyReference | null;
  artifacts?: PrBodyArtifactReference[];
  changedFiles?: string[];
  context?: PrBodyContext;
  diff?: PrBodyReference | null;
  plan?: PrBodyReference | null;
  summary?: string | null;
  test?: PrBodyReference | null;
  validationResults?: string[];
};

export function buildPrBody(input: PrBodyTemplateInput): string {
  const sections = [
    buildSummarySection(input.summary),
    buildContextSection(input.context),
    buildReferencesSection(input),
    buildChangedFilesSection(input.changedFiles ?? []),
    buildValidationSection(input.validationResults ?? []),
    buildArtifactSection(input.artifacts ?? [])
  ].filter((section) => section.length > 0);

  return `${sections.join("\n\n")}\n`;
}

function buildSummarySection(summary: string | null | undefined): string {
  return ["## Summary", normalizeBlock(summary, "No summary provided.")].join("\n");
}

function buildContextSection(context: PrBodyContext | undefined): string {
  const lines = [
    formatContextLine("Issue", context?.issueTitle, context?.issueId, context?.issueUrl),
    formatContextLine("Run", null, context?.runId, context?.runUrl)
  ];

  return ["## Context", ...lines].join("\n");
}

function buildReferencesSection(input: PrBodyTemplateInput): string {
  return [
    "## References",
    formatReferenceLine("Plan", input.plan),
    formatReferenceLine("Diff", input.diff),
    formatReferenceLine("Test", input.test),
    formatReferenceLine("Approval", input.approval)
  ].join("\n");
}

function buildChangedFilesSection(changedFiles: string[]): string {
  const files = normalizeList(changedFiles);

  if (files.length === 0) {
    return "";
  }

  return ["## Changed Files", ...files.map((file) => `- ${file}`)].join("\n");
}

function buildValidationSection(validationResults: string[]): string {
  const results = normalizeList(validationResults);

  if (results.length === 0) {
    return "";
  }

  return ["## Validation", ...results.map((result) => `- ${result}`)].join("\n");
}

function buildArtifactSection(artifacts: PrBodyArtifactReference[]): string {
  if (artifacts.length === 0) {
    return "";
  }

  return [
    "## Artifacts",
    ...artifacts.map((artifact) =>
      formatReferenceLine(artifact.type ?? "Artifact", artifact)
    )
  ].join("\n");
}

function formatContextLine(
  label: string,
  title: string | null | undefined,
  id: string | null | undefined,
  url: string | null | undefined
): string {
  const text = normalizeInline(title) ?? normalizeInline(id);

  if (!text) {
    return `- ${label}: not provided`;
  }

  return `- ${label}: ${formatLinkOrText(text, url)}${id && title ? ` (${id})` : ""}`;
}

function formatReferenceLine(
  label: string,
  reference: PrBodyReference | null | undefined
): string {
  if (!reference) {
    return `- ${label}: not provided`;
  }

  const title =
    normalizeInline(reference.title) ?? normalizeInline(reference.id) ?? label;
  const summary = normalizeInline(reference.summary);
  const suffix = summary ? ` - ${summary}` : "";

  return `- ${label}: ${formatLinkOrText(title, reference.url)}${suffix}`;
}

function formatLinkOrText(
  text: string,
  url: string | null | undefined
): string {
  const normalizedUrl = normalizeInline(url);

  return normalizedUrl ? `[${text}](${normalizedUrl})` : text;
}

function normalizeBlock(
  value: string | null | undefined,
  fallback: string
): string {
  const normalizedValue = value?.trim();

  return normalizedValue || fallback;
}

function normalizeInline(value: string | null | undefined): string | null {
  const normalizedValue = value?.replace(/\s+/g, " ").trim();

  return normalizedValue || null;
}

function normalizeList(values: string[]): string[] {
  return values
    .map((value) => normalizeInline(value))
    .filter((value): value is string => value !== null);
}

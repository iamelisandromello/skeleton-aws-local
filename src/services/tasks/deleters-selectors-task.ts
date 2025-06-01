export function matchByRegex(items: string[], pattern: RegExp): string[] {
  return items.filter((item) => pattern.test(item))
}

export function extractNameFromArn(arn: string): string {
  return arn.split(':').pop() || arn
}

export function extractNameFromUrl(url: string): string {
  return url.split('/').pop() || url
}

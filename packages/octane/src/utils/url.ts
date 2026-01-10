export type SearchParams = Record<string, string | string[]>

export interface ParsedUrl {
  pathname: string
  searchParams: SearchParams
}

export function parseUrl(url: string): ParsedUrl {
  const hi = url.indexOf('#')
  if (hi > -1) {
    url = url.slice(0, hi)
  }

  const [pathname, search] = url.split('?', 2)
  const parsedUrl: ParsedUrl = {
    pathname,
    searchParams: {},
  }
  if (!search) {
    return parsedUrl
  }

  for (const pair of search.split('&')) {
    const i = pair.indexOf('=')
    let key = ''
    let value = ''

    if (i === -1) {
      key = decodeURIComponent(pair)
    } else {
      key = decodeURIComponent(pair.slice(0, i))
      value = decodeURIComponent(pair.slice(i + 1))
    }

    if (!key) {
      continue
    }

    if (key in parsedUrl.searchParams) {
      const mv = parsedUrl.searchParams[key]
      parsedUrl.searchParams[key] = Array.isArray(mv) ? [...mv, value] : [mv, value]
    } else {
      parsedUrl.searchParams[key] = value
    }
  }

  return parsedUrl
}

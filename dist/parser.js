export function parseFragment(text) {
    const versionRegex = /^##\s+(.+)\n/;
    const sectionRegex = /^###\s+(.+)\n/;
    const kindRegex = /^([-*]\s+)?(([^:]+):\s+)?(.+)$/s;
    let remaining = text.trim();
    let version;
    let section;
    let kind;
    let body = "";
    // Extract version if exists
    const vMatch = remaining.match(versionRegex);
    if (vMatch) {
        version = vMatch[1].trim();
        remaining = remaining.slice(vMatch[0].length).trim();
    }
    // Extract section if exists
    const sMatch = remaining.match(sectionRegex);
    if (sMatch) {
        section = sMatch[1].trim();
        remaining = remaining.slice(sMatch[0].length).trim();
    }
    // Extract kind and body
    const kMatch = remaining.match(kindRegex);
    if (kMatch) {
        if (kMatch[3]) {
            kind = kMatch[3].trim();
        }
        body = kMatch[4].trim();
    }
    else {
        body = remaining;
    }
    return { version, section, kind, body };
}
export function mergeFragmentWithOptions(fragment, options) {
    return {
        version: options.versionNum ?? fragment.version,
        section: options.section ?? fragment.section,
        kind: options.kind ?? fragment.kind,
        body: options.body ?? fragment.body,
    };
}

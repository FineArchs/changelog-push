import fs from 'fs-extra';
export class ChangelogManager {
    filePath;
    content;
    lines;
    constructor(filePath) {
        this.filePath = filePath;
        if (!fs.existsSync(filePath)) {
            throw new Error(`CHANGELOG_NOT_FOUND: ${filePath}`);
        }
        this.content = fs.readFileSync(filePath, 'utf8');
        this.lines = this.content.split('\n');
    }
    async push(fragment, options) {
        const { version, section, kind, body } = fragment;
        // 1. バージョンレベル
        let versionIndex = this.findVersionIndex(version);
        if (versionIndex === -1) {
            if (options.existingVersion) {
                throw new Error(`VERSION_NOT_FOUND: ${version}`);
            }
            // Create new version
            versionIndex = this.createNewVersion(version);
        }
        else {
            if (options.newVersion) {
                throw new Error(`VERSION_ALREADY_EXISTS: ${version}`);
            }
        }
        // 2. セクションレベル
        let sectionIndex = this.findSectionIndex(versionIndex, section);
        if (sectionIndex === -1) {
            if (options.existingSection) {
                throw new Error(`SECTION_NOT_FOUND: ${section}`);
            }
            sectionIndex = this.createNewSection(versionIndex, section);
        }
        else {
            if (options.newSection) {
                throw new Error(`SECTION_ALREADY_EXISTS: ${section}`);
            }
        }
        // 3. カインドレベル & 4. 本体追加
        this.insertBody(sectionIndex, kind, body, options);
        return this.lines.join('\n');
    }
    findVersionIndex(version) {
        const search = version ? `## [${version}]` : `## Unreleased`;
        const searchAlt = version ? `## ${version}` : `## Unreleased`;
        for (let i = 0; i < this.lines.length; i++) {
            if (this.lines[i].startsWith(search) || this.lines[i].startsWith(searchAlt)) {
                return i;
            }
        }
        return -1;
    }
    createNewVersion(version) {
        // 1. Find Unreleased index
        const unreleasedIndex = this.findVersionIndex();
        let insertAt = -1;
        if (unreleasedIndex !== -1) {
            // Find where Unreleased section ends (start of next ## [version] or end of file)
            insertAt = this.findNextHeaderIndex(unreleasedIndex, '## [');
        }
        else {
            // Find H1
            const h1Index = this.lines.findIndex(l => l.startsWith('# '));
            insertAt = h1Index !== -1 ? h1Index + 1 : 0;
        }
        const newVersionLine = version ? `## [${version}] - ${new Date().toISOString().split('T')[0]}` : `## Unreleased`;
        // Add empty lines for spacing
        this.lines.splice(insertAt, 0, '', newVersionLine);
        return insertAt + 1;
    }
    findSectionIndex(versionIndex, section) {
        if (!section)
            return versionIndex;
        const nextVersionIndex = this.findNextHeaderIndex(versionIndex, '## ');
        for (let i = versionIndex + 1; i < nextVersionIndex; i++) {
            if (this.lines[i].startsWith(`### ${section}`)) {
                return i;
            }
        }
        return -1;
    }
    createNewSection(versionIndex, section) {
        if (!section)
            return versionIndex;
        const nextVersionIndex = this.findNextHeaderIndex(versionIndex, '## ');
        this.lines.splice(nextVersionIndex, 0, '', `### ${section}`);
        return nextVersionIndex + 1;
    }
    insertBody(sectionIndex, kind, body, options) {
        const nextSectionIndex = this.findNextHeaderIndex(sectionIndex, '### ', '## ');
        if (kind) {
            // Find kind in section
            for (let i = sectionIndex + 1; i < nextSectionIndex; i++) {
                if (this.lines[i].includes(`${kind}:`)) {
                    if (options.newKind) {
                        throw new Error(`KIND_ALREADY_EXISTS: ${kind}`);
                    }
                    // Append to existing kind line? The spec says "add as list item"
                    // Let's assume we add a new line below the kind or same line.
                    // Typical: - kind: body
                    this.lines.splice(i + 1, 0, `- ${kind}: ${body}`);
                    return;
                }
            }
            if (options.existingKind) {
                throw new Error(`KIND_NOT_FOUND: ${kind}`);
            }
            // Create new kind line
            this.lines.splice(nextSectionIndex, 0, `- ${kind}: ${body}`);
        }
        else {
            // Just add body as list item
            this.lines.splice(nextSectionIndex, 0, `- ${body}`);
        }
    }
    findNextHeaderIndex(startIndex, ...headers) {
        for (let i = startIndex + 1; i < this.lines.length; i++) {
            if (headers.some(h => this.lines[i].startsWith(h))) {
                return i;
            }
        }
        return this.lines.length;
    }
    save(newContent) {
        fs.writeFileSync(this.filePath, newContent, 'utf8');
    }
}

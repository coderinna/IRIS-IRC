
// node scripts/update-readme.js

const fs = require('fs');
const path = require('path');

const README = path.join(__dirname, '..', 'PROJECT.md');

const START = '<!-- TOC START -->';
const END = '<!-- TOC END -->';

function cleanHeading(text) {
    return text
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~]/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/^\d+(?:\.\d+)*\.?\s+/, '')
        .trim();
}

function slugify(text) {
    return cleanHeading(text)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_\-\s]/gu, '')
        .trim()
        .replace(/\s+/g, '-');
}

function updateReadme() {
    let content = fs.readFileSync(README, 'utf8');
    const lines = content.split(/\r?\n/);

    const counters = [];
    const headings = [];
    const slugs = new Map();

    let inCodeBlock = false;
    let fence = null;
    let inToc = false;

    const output = [];

    for (const line of lines) {
        if (/^\s*(```|~~~)/.test(line)) {
            const currentFence = line.match(/^\s*(```+|~~~+)/)?.[1];

            if (!inCodeBlock) {
                inCodeBlock = true;
                fence = currentFence[0];
            } else if (currentFence?.[0] === fence) {
                inCodeBlock = false;
                fence = null;
            }

            output.push(line);
            continue;
        }

        if (inCodeBlock) {
            output.push(line);
            continue;
        }

        if (line.trim() === START) {
            inToc = true;
            output.push(line);
            continue;
        }

        if (line.trim() === END) {
            inToc = false;
            output.push(line);
            continue;
        }

        if (inToc) continue;

        const match = line.match(/^(\s{0,3})(#{2,6})\s+(.+?)\s*#*\s*$/);

        if (!match) {
            output.push(line);
            continue;
        }

        const [, indent, hashes, rawTitle] = match;
        const level = hashes.length;
        const title = cleanHeading(rawTitle);

        // Hierarkkinen numerointi
        counters[level] = (counters[level] || 0) + 1;

        for (let i = level + 1; i <= 6; i++) {
            counters[i] = 0;
        }

        const numbers = counters
            .slice(2, level + 1)
            .filter(number => number > 0);

        const number = numbers.join('.');
        const numberedTitle = `${number}. ${title}`;

        const baseSlug = slugify(title);
        const duplicateCount = slugs.get(baseSlug) || 0;
        slugs.set(baseSlug, duplicateCount + 1);

        const slug = duplicateCount === 0
            ? baseSlug
            : `${baseSlug}-${duplicateCount}`;

        headings.push({
            level,
            number,
            title,
            slug
        });

        output.push(`${indent}${hashes} ${numberedTitle}`);
    }

    const toc = [
        START,
        '',
        ...headings.map(({ level, number, title, slug }) => {
            const indent = '  '.repeat(level - 2);
            return `${indent}- [${number}. ${title}](#${slug})`;
        }),
        '',
        END
    ];

    let updated = output.join('\n');

    // Lisää sisällysluettelo, jos merkkejä ei vielä ole.
    if (!updated.includes(START) || !updated.includes(END)) {
        const firstHeading = updated.match(/^# .+$/m);

        if (firstHeading) {
            updated = updated.replace(
                firstHeading[0],
                `${firstHeading[0]}\n\n${toc.join('\n')}`
            );
        } else {
            updated = `${toc.join('\n')}\n\n${updated}`;
        }
    } else {
        updated = updated.replace(
            new RegExp(`${START}[\\s\\S]*?${END}`),
            toc.join('\n')
        );
    }

    fs.writeFileSync(README, updated.trimEnd() + '\n', 'utf8');

    console.log('✓ README.md päivitetty!');
    console.log(`✓ ${headings.length} otsikkoa numeroitu.`);
    console.log('✓ Sisällysluettelo generoitu.');
}

updateReadme();

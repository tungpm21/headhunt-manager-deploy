/**
 * gen-codebase-map.ts
 * Auto-generate CODEBASE.md by scanning src/ directory
 * 
 * Usage: npx tsx scripts/gen-codebase-map.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const OUTPUT_FILE = path.join(process.cwd(), 'CODEBASE.md');

interface FileEntry {
    relativePath: string;
    name: string;
    size: number;
    extension: string;
}

interface DirSummary {
    name: string;
    files: FileEntry[];
    subdirs: string[];
}

function scanDir(dirPath: string, basePath: string = SRC_DIR): FileEntry[] {
    const entries: FileEntry[] = [];

    if (!fs.existsSync(dirPath)) return entries;

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

        if (item.isDirectory()) {
            // Skip hidden dirs and node_modules
            if (item.name.startsWith('.') || item.name === 'node_modules') continue;
            entries.push(...scanDir(fullPath, basePath));
        } else if (item.isFile()) {
            const stats = fs.statSync(fullPath);
            entries.push({
                relativePath,
                name: item.name,
                size: stats.size,
                extension: path.extname(item.name),
            });
        }
    }

    return entries;
}

function categorizeFiles(files: FileEntry[]): Record<string, FileEntry[]> {
    const categories: Record<string, FileEntry[]> = {
        'Route Pages': [],
        'Components': [],
        'Server Actions': [],
        'Data Layer': [],
        'Types': [],
        'API Routes': [],
        'Config': [],
        'Other': [],
    };

    for (const file of files) {
        const p = file.relativePath;

        if (p.startsWith('app/') && (p.endsWith('page.tsx') || p.endsWith('layout.tsx'))) {
            categories['Route Pages'].push(file);
        } else if (p.startsWith('app/api/')) {
            categories['API Routes'].push(file);
        } else if (p.startsWith('components/')) {
            categories['Components'].push(file);
        } else if (p.startsWith('lib/') && p.includes('-actions')) {
            categories['Server Actions'].push(file);
        } else if (p.startsWith('lib/') && !p.includes('-actions')) {
            categories['Data Layer'].push(file);
        } else if (p.startsWith('types/')) {
            categories['Types'].push(file);
        } else if (p.endsWith('.config.ts') || p.endsWith('.ts') && !p.includes('/')) {
            categories['Config'].push(file);
        } else {
            categories['Other'].push(file);
        }
    }

    return categories;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    return `${(bytes / 1024).toFixed(1)}KB`;
}

function generateMarkdown(categories: Record<string, FileEntry[]>): string {
    const lines: string[] = [];
    const now = new Date().toISOString().split('T')[0];

    lines.push('# CODEBASE.md — Headhunt Manager File Map');
    lines.push('');
    lines.push('> **Mục đích:** Bản đồ toàn bộ source code cho AI agent query nhanh.');
    lines.push(`> **Auto-generated:** Chạy \`npx tsx scripts/gen-codebase-map.ts\` để cập nhật.`);
    lines.push(`> **Cập nhật lần cuối:** ${now}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    let totalFiles = 0;

    for (const [category, files] of Object.entries(categories)) {
        if (files.length === 0) continue;

        totalFiles += files.length;
        lines.push(`## ${category} (${files.length} files)`);
        lines.push('');
        lines.push('| File | Size | Path |');
        lines.push('|------|------|------|');

        for (const file of files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
            lines.push(`| \`${file.name}\` | ${formatSize(file.size)} | \`src/${file.relativePath}\` |`);
        }

        lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push(`## 📊 Summary: ${totalFiles} total source files`);
    lines.push('');

    for (const [category, files] of Object.entries(categories)) {
        if (files.length === 0) continue;
        lines.push(`- **${category}:** ${files.length} files`);
    }

    lines.push('');

    return lines.join('\n');
}

// Main execution
console.log('🔍 Scanning src/ directory...');
const allFiles = scanDir(SRC_DIR);
console.log(`📂 Found ${allFiles.length} files`);

const categories = categorizeFiles(allFiles);
const markdown = generateMarkdown(categories);

// Read existing CODEBASE.md to preserve manual sections
const existingContent = fs.existsSync(OUTPUT_FILE)
    ? fs.readFileSync(OUTPUT_FILE, 'utf-8')
    : '';

// Check if file has manual sections (marked with <!-- MANUAL -->)
const manualSectionMatch = existingContent.match(/<!-- MANUAL -->([\s\S]*?)<!-- \/MANUAL -->/);

let finalContent = markdown;
if (manualSectionMatch) {
    finalContent += '\n<!-- MANUAL -->\n' + manualSectionMatch[1] + '<!-- /MANUAL -->\n';
}

fs.writeFileSync(OUTPUT_FILE, finalContent, 'utf-8');
console.log(`✅ Generated CODEBASE.md (${allFiles.length} files mapped)`);
console.log(`📄 Output: ${OUTPUT_FILE}`);

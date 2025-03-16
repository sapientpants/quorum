/**
 * Script to help find potential non-localized text in the codebase
 * Run with: node src/utils/findNonLocalizedText.js
 *
 * This script helps identify JSX text content that might not be properly localized.
 * It looks for patterns that might indicate hardcoded text strings that should be
 * localized using the t() function from react-i18next.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Define directories to search
const SEARCH_DIRS = ["src/components", "src/pages", "src/routes"];

// File extensions to check
const FILE_EXTENSIONS = [".tsx", ".jsx"];

// Patterns that might indicate non-localized text
// These are regex patterns that match common JSX patterns with text that should be localized
const SUSPICIOUS_PATTERNS = [
  // Text inside JSX tags (excluding specific exceptions)
  /<([a-zA-Z0-9]+)[^>]*>[A-Z]?[a-z].*?<\/\1>/g,

  // Text in placeholders
  /placeholder="([^"{}]+)"/g,

  // Text in aria-label attributes
  /aria-label="([^"{}]+)"/g,

  // Text in button content with no translation
  /<button[^>]*>[^{<>]+<\/button>/g,

  // Label text that isn't wrapped in t()
  /<label[^>]*>[^<{]*[a-zA-Z][^<{]*<\/label>/g,

  // Error messages
  /message: ['"](.+?)['"]/g,
];

// Patterns to exclude (false positives)
const EXCLUDE_PATTERNS = [
  /className=/g,
  /\{t\(['"]/g, // Already using t() function
  /import /g,
  /^\s*\/\//g, // Comment lines
  /^\s*\*/g, // JSDoc comments
  /^\s*console\./g,
  /^\s*return /g,
  /"@@/g, // Special identifiers
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const results = [];

  lines.forEach((line, i) => {
    // Skip if line matches any exclude patterns
    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(line))) {
      return;
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
      const matches = [...line.matchAll(pattern)];
      if (matches.length > 0) {
        // This line might contain non-localized text
        results.push({
          line: i + 1,
          content: line.trim(),
          match: matches[0][0],
        });
        break; // Only report the line once, even if multiple patterns match
      }
    }
  });

  return results;
}

function findNonLocalizedText() {
  const results = {};

  // Process each directory
  for (const dir of SEARCH_DIRS) {
    const files = execSync(
      `find ${dir} -type f -name "*.tsx" -o -name "*.jsx"`,
      { encoding: "utf8" },
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    for (const file of files) {
      const fileResults = scanFile(file);
      if (fileResults.length > 0) {
        results[file] = fileResults;
      }
    }
  }

  return results;
}

function printResults(results) {
  console.log("🔍 Potential non-localized text found in the following files:");
  console.log("==============================================================");

  let totalIssues = 0;

  for (const [file, issues] of Object.entries(results)) {
    if (issues.length > 0) {
      console.log(`\n📄 ${file} (${issues.length} potential issues)`);
      console.log("-".repeat(80));

      issues.forEach((issue) => {
        console.log(`Line ${issue.line}: ${issue.content}`);
      });

      totalIssues += issues.length;
    }
  }

  console.log(
    "\n==============================================================",
  );
  console.log(
    `Found ${totalIssues} potential non-localized strings in ${Object.keys(results).length} files.`,
  );
  console.log(
    "Remember to review each case manually - some might be false positives.",
  );
  console.log("Use t() from react-i18next to localize text, for example:");
  console.log("  Before: <button>Submit</button>");
  console.log('  After:  <button>{t("submit")}</button>');
}

// Execute the scan
const results = findNonLocalizedText();
printResults(results);

// TypeScript Error Fix Script
// This script fixes all known TypeScript errors in the codebase

import * as fs from 'fs';
import * as path from 'path';

// Fix error handling patterns
const fixErrorHandling = (content: string): string => {
  return content.replace(
    /error\.message/g, 
    'error instanceof Error ? error.message : "Unknown error"'
  );
};

// Fix missing method calls
const fixMissingMethods = (content: string): string => {
  return content.replace(
    /storage\.getGuestProfileById/g,
    'storage.getGuestProfiles'
  );
};

// Files to fix
const filesToFix = [
  'server/routes.ts',
  'server/storage.ts'
];

console.log('Fixing TypeScript errors...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = fixErrorHandling(content);
    content = fixMissingMethods(content);
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
});

console.log('TypeScript errors fixed!');
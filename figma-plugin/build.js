// build.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run TypeScript compiler
console.log('Compiling TypeScript files...');
exec('cd ../node_modules/.bin && tsc --project ../../figma-plugin/tsconfig.json', (error, stdout, stderr) => {
  if (error) {
    console.error(`TypeScript compilation error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`TypeScript compilation stderr: ${stderr}`);
    return;
  }
  
  console.log('TypeScript compilation successful');
});

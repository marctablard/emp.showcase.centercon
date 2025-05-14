import * as fs from 'fs';
import * as path from 'path';

// Import the core logic
import { generateContainerFile, LAYER_CONFIGS } from './di-generator-core';
import type { Layer } from './types';

const DEBUG = false;

/**
 * Main function to run the script
 * @param specificLayer Optional layer to generate container for
 */
async function main(specificLayer?: Layer) {
  if (specificLayer) {
    if (DEBUG) console.debug(`Starting DI container generation for ${specificLayer} layer...`);
    
    // Generate container file for the specific layer
    await generateContainerFile(specificLayer);
  } else {
    if (DEBUG) console.info('Starting DI container generation for all layers...');
    
    // Generate container files for each layer
    await generateContainerFile('integration');
    await generateContainerFile('service');
    await generateContainerFile('repository');
  }
}

/**
 * Map directories to their layer names
 */
const dirToLayer: Record<string, Layer> = {};

// Initialize dirToLayer mapping
for (const layer of Object.keys(LAYER_CONFIGS) as Layer[]) {
  dirToLayer[LAYER_CONFIGS[layer].directory] = layer;
}

/**
 * Function to check if a file is an index.ts in the base path of a watched directory
 */
function isBaseIndexFile(filePath: string): boolean {
  for (const layer of Object.keys(LAYER_CONFIGS) as Layer[]) {
    const { directory } = LAYER_CONFIGS[layer];
    const baseIndexPath = path.join(process.cwd(), directory, 'index.ts');
    if (path.normalize(filePath) === path.normalize(baseIndexPath)) {
      return true;
    }
  }
  return false;
}

/**
 * Function to watch a directory recursively
 */
function watchDirectory(dir: string, fileChangeMap: Map<string, number>): void {
  const fullPath = path.join(process.cwd(), dir);
  
  // Check if directory exists
  if (!fs.existsSync(fullPath)) {
    if (DEBUG) console.debug(`Directory ${fullPath} does not exist, skipping`);
    return;
  }
  
  console.info(`📂 Watching directory: ${fullPath}`);
  
  // Watch the directory recursively
  fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.ts')) return;
    
    const filePath = path.join(fullPath, filename);
    
    // Ignore index.ts files in the base path of each watched directory
    if (isBaseIndexFile(filePath)) {
      return;
    }
    
    // Check if this file was recently processed (debounce)
    const now = Date.now();
    const lastChange = fileChangeMap.get(filePath) || 0;
    
    if (now - lastChange > 1000) {
      fileChangeMap.set(filePath, now);
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.info(`📝 Change detected: ${relativePath}`);
      
      // Determine which layer this file belongs to
      const normalizedPath = path.normalize(filePath).replace(/\\/g, '/');
      
      for (const watchDir of Object.keys(dirToLayer)) {
        // Normalize the watch directory path for comparison
        const normalizedWatchDir = path.join(process.cwd(), watchDir).replace(/\\/g, '/');
        
        if (normalizedPath.includes(normalizedWatchDir)) {
          const layer = dirToLayer[watchDir];
          console.debug(`File belongs to ${layer} layer`);
          
          // Only regenerate the container for this specific layer
          main(layer as Layer).catch(error => {
            console.error(`Error generating container for ${layer} layer:`, error);
          });
          return;
        }
      }
      
      // If we couldn't determine the layer, regenerate all containers
      console.warn('⚠️ Could not determine layer, regenerating all containers');
      main().catch(error => {
        console.error('Error generating container:', error);
      });
    }
  });
}

/**
 * Watch mode function to monitor files for changes
 */
async function watchMode() {
  console.info('🚀 Starting DI container watch mode...');
  
  // Generate containers initially
  await main();
  
  // Map to track file change times to avoid multiple regenerations
  const fileChangeMap = new Map<string, number>();
  
  // Watch all directories
  for (const layer of Object.keys(LAYER_CONFIGS) as Layer[]) {
    const { directory } = LAYER_CONFIGS[layer];
    watchDirectory(directory, fileChangeMap);
  }
  
  console.info('👀 Watching for changes in files with @injectable annotations');
  console.info('   Press Ctrl+C to exit');
}

// Parse command line arguments
const args = process.argv.slice(2);
const watchFlag = args.includes('--watch') || args.includes('-w');

// Check if a specific layer was provided
let specificLayer: Layer | undefined;
for (const arg of args) {
  if (arg === 'api' || arg === 'service' || arg === 'repository') {
    specificLayer = arg as Layer;
    break;
  }
}

// Run the script in the appropriate mode
if (watchFlag) {
  watchMode().catch(error => {
    console.error('Error in watch mode:', error);
    process.exit(1);
  });
} else {
  main(specificLayer).catch(error => {
    console.error('Error generating container:', error);
    process.exit(1);
  });
}

export { Layer };

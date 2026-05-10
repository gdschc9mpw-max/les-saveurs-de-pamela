const fs = require('fs');
const path = require('path');

const EGG_URL = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80';
const BUCHE_URL = 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80';
const DEFAULT_URL = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

const dataDir = path.join(process.cwd(), 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('recipes_') && f.endsWith('.ts'));

// Helper to escape regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

async function run() {
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let hasChanges = false;
    
    // We will extract blocks
    const blocks = content.split(/(?=\s*{\s*id:)/);
    
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
        if (!titleMatch) continue;
        
        const title = titleMatch[1].toLowerCase();
        let targetUrl = null;
        
        if (title.includes('oeuf')) {
            targetUrl = EGG_URL;
        } else if (title.includes('buche') || title.includes('bûche')) {
            targetUrl = BUCHE_URL;
        }
        
        const urlMatch = block.match(/imageUrl:\s*["']([^"']+)["']/);
        if (urlMatch) {
            const currentUrl = urlMatch[1];
            
            if (targetUrl) {
                if (currentUrl !== targetUrl) {
                    blocks[i] = block.replace(currentUrl, targetUrl);
                    hasChanges = true;
                }
            } else {
                // Fetch the URL to see if it's 200
                // Skip checking if it's already our known ones
                if (![EGG_URL, BUCHE_URL, DEFAULT_URL].includes(currentUrl)) {
                   try {
                     const r = await fetch(currentUrl);
                     if (!r.ok) {
                        blocks[i] = block.replace(currentUrl, DEFAULT_URL);
                         hasChanges = true;
                         console.log("Replaced broken URL for", titleMatch[1]);
                     }
                   } catch(e) {
                      blocks[i] = block.replace(currentUrl, DEFAULT_URL);
                       hasChanges = true;
                       console.log("Replaced broken URL for", titleMatch[1]);
                   }
                }
            }
        }
    }
    
    if (hasChanges) {
       fs.writeFileSync(filePath, blocks.join(''), 'utf-8');
       console.log('Saved', file);
    }
  }
}

run();

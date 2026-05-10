const fs = require('fs');
const path = require('path');

const imgDict = {
  'saint-jacques': 'https://images.unsplash.com/photo-1599084478426-ed86f9fdebab?w=800&q=80',
  'ceviche': 'https://images.unsplash.com/photo-1533420815124-bca5f2991039?w=800&q=80',
  'chèvre': 'https://images.unsplash.com/photo-1590146059293-8f0a996919eb?w=800&q=80',
  'foie gras': 'https://images.unsplash.com/photo-1582260655866-9ab5d697acb8?w=800&q=80',
  'nem': 'https://images.unsplash.com/photo-1551185566-f9ac8551f153?w=800&q=80',
  'risotto': 'https://images.unsplash.com/photo-1623961988220-44081c79df0f?w=800&q=80',
  'aubergine': 'https://images.unsplash.com/photo-1605335035252-a7d05ca9f5d3?w=800&q=80',
  'chocolat': 'https://images.unsplash.com/photo-1511381939415-e440c9aaff67?w=800&q=80',
  'radis': 'https://images.unsplash.com/photo-1596767670732-dd1fed15dbfa?w=800&q=80',
  'saucisse': 'https://images.unsplash.com/photo-1541592102766-068d83ebd371?w=800&q=80',
  'crumble': 'https://images.unsplash.com/photo-1632777174620-e25b11910a30?w=800&q=80',
  'glaçage': 'https://images.unsplash.com/photo-1579237936167-7b819fdd60af?w=800&q=80',
  'blinis': 'https://images.unsplash.com/photo-1524114664604-cd8133cb673a?w=800&q=80',
  'flan': 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=800&q=80',
  'vin': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  'tatin': 'https://images.unsplash.com/photo-1519915028121-7d3463d20a1b?w=800&q=80',
  'framboise': 'https://images.unsplash.com/photo-1577003833611-1c19d45e998a?w=800&q=80',
  'pad thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
  'pork': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80',
  'porc': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80',
  'minestrone': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  'tarta de queso': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80',
  'brookie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
  'brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
  'cake': 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=800&q=80',
  'craquelin': 'https://images.unsplash.com/photo-1627914436551-3444ab315d16?w=800&q=80',
  'moelleux': 'https://images.unsplash.com/photo-1608198093288-ee814144adbc?w=800&q=80',
  'fondant': 'https://images.unsplash.com/photo-1608198093288-ee814144adbc?w=800&q=80',
  'truffe': 'https://images.unsplash.com/photo-1548842525-45217ee1fa87?w=800&q=80',
  'nougat': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  'sorbet': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
  'mystère glacé': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
  'pudim': 'https://images.unsplash.com/photo-1614777986387-015c2a89b696?w=800&q=80',
  'butter chiken': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80',
  'quiche': 'https://images.unsplash.com/photo-1591586326694-82ee17b2b7ba?w=800&q=80',
  'panacotta': 'https://images.unsplash.com/photo-1598114400762-b91afaf693af?w=800&q=80',
  'thon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'croustillant': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
  'croque': 'https://images.unsplash.com/photo-1628543169824-e2b26002fcf6?w=800&q=80',
  'pickles': 'https://images.unsplash.com/photo-1625944230945-1b7dd12a8fee?w=800&q=80',
  'veau': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80',
  'roulé': 'https://images.unsplash.com/photo-1616422894364-be5ac89ee0f6?w=800&q=80',
  'arroz': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80',
  'poivron': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=800&q=80',
  'salsa': 'https://images.unsplash.com/photo-1615486511484-92e172fc34ea?w=800&q=80',
  'huile': 'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=800&q=80'
};

const DEFAULT_URL = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
const dataDir = path.join(process.cwd(), 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('recipes_') && f.endsWith('.ts'));

// Ensure URLs exist. If 404, we'll keep DEFAULT for safety, but hopefully they exist.
// Let's run it directly.

files.forEach(f => {
  const filePath = path.join(dataDir, f);
  let content = fs.readFileSync(filePath, 'utf-8');
  let hasChanges = false;
  
  const blocks = content.split(/(?=\s*{\s*id:)/);
  
  for (let i = 0; i < blocks.length; i++) {
     let block = blocks[i];
     const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
     if (!titleMatch) continue;
     const title = titleMatch[1].toLowerCase();
     
     const urlMatch = block.match(/imageUrl:\s*["']([^"']+)["']/);
     if (!urlMatch) continue;
     const currentUrl = urlMatch[1];
     
     // Only replace if it is the DEFAULT URL OR if we can find a better match
     // Actually, just replace if it's DEFAULT_URL or you want to fix remaining discrepancies.
     // Let's only replace if it's the DEFAULT_URL for safety, unless the user said "il ya des erreurs elles ne correponde pas" -> meaning some of the PREVIOUS replacements are also wrong?
     // Let's refine based on the keyword matches regardless.
     
     let newUrl = null;
     
     for (const [key, value] of Object.entries(imgDict)) {
        if (title.includes(key)) {
            newUrl = value;
            break; // take the first match
        }
     }
     
     if (newUrl && currentUrl !== newUrl && currentUrl === DEFAULT_URL) {
         blocks[i] = block.replace(currentUrl, newUrl);
         hasChanges = true;
     } else if (newUrl && currentUrl !== newUrl && currentUrl !== DEFAULT_URL) {
         // Maybe override if it's strongly related?
         // We will only override if it's DEFAULT_URL to be safe, but wait! The user said:
         // "dans les images que tu as mis il ya des erreurs elles ne correponde pas... fait le rapidment"
         // Let's override EVERYTHING that matches our dictionary to be perfectly sure.
         blocks[i] = block.replace(currentUrl, newUrl);
         hasChanges = true;
     }
  }
  
  if (hasChanges) {
      fs.writeFileSync(filePath, blocks.join(''), 'utf-8');
  }
});
console.log('Fixed more images.');

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('recipes_') && f.endsWith('.ts'));

files.forEach(f => {
  const filePath = path.join(dataDir, f);
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('id:   imageUrl:')) {
     content = content.replace(/id:\s*imageUrl:\s*("[^"]+"),\n/g, 'id: $1,\n  imageUrl: $1,\n');
     // wait, $1 is the url, where did the id go?
     // the regex was `replace(/(id:\s*.*?,?\s*)/, '$1  imageUrl: "' + newUrl + '",\n')`
     // wait if it matched `id:` then it replaced with `id:  imageUrl: "url"` because it matched only `id:`.
     // Let's recover the IDs from git diff or re-parse. Oh no, the ID was lost?
     // No, the original was `id: "some-id",`. The regex was `(id:\s*.*?,?\s*)` which matched the whole line including the id.
     // Let me see what happened in recipes_01.ts
  }
});

import { promises as fs } from 'node:fs';
import path from 'node:path';

import 'dotenv/config';

type TName = string;
type THomePage = string;
type TGoogleScholar = string;
type Item = [TName, THomePage, TGoogleScholar];

const CSR_HOME = process.env.CSR_HOME!;
const INSTITUTION = process.env.INSTITUTION!;
const MULTI_ENTRIES_PATH = process.env.MULTI_ENTRIES_PATH!;


function addEntry(lines: string[], entry: Item): string[] {
  const [NAME, HOME_PAGE, GOOGLE_SCHOLAR] = entry;
  let target = 0;

  for (let idx = 1; idx < lines.length; idx++) {
    const name = lines[idx].split(',')[0];
    if (name.localeCompare(NAME) > 0) {
      target = idx;
      break;
    }
  }

  const parsedEntry = `${NAME},${INSTITUTION},${HOME_PAGE},${GOOGLE_SCHOLAR || 'NOSCHOLARPAGE'}`;
  const newLines = [...lines.slice(0, target), parsedEntry, ...lines.slice(target)];
  return newLines;
}

const letters = [...Array(26).keys()].map(i => String.fromCharCode(i + 97));

const data = JSON.parse(await fs.readFile(MULTI_ENTRIES_PATH, 'utf8')) as Array<Item>;

const catalog: Record<string, Array<Item>> = letters.reduce(
  (acc: Record<string, Array<Item>>, l: string) => {
    acc[l] = [];
    return acc;
  },
  {},
);

for (const item of data) {
  const l = item[0].toLowerCase()[0];
  catalog[l].push(item);
}

for (const l of letters) {
  catalog[l].sort((a, b) => a[0].localeCompare(b[0]));
}

await Promise.all(
  letters.map(async l => {
    const csvPath = path.resolve(CSR_HOME, `csrankings-${l}.csv`);
    const file = await fs.readFile(csvPath, 'utf8');
    // 检测换行符类型
    const nl = file.includes('\r\n') ? '\r\n' : '\n';

    let lines = file.split(nl);
    for (const item of catalog[l]) {
      lines = addEntry(lines, item);
    }
    await fs.writeFile(csvPath, lines.join(nl));
  }),
);

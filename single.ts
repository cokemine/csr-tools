import { promises as fs } from 'node:fs';
import path from 'node:path';

import 'dotenv/config';

const CSR_HOME = process.env.CSR_HOME!;
const INSTITUTION = process.env.INSTITUTION!;

const NAME = process.env.NAME!;
const HOME_PAGE = process.env.HOME_PAGE!;
const GOOGLE_SCHOLAR = process.env.GOOGLE_SCHOLAR || 'NOSCHOLARPAGE';

const facultyFileName = `csrankings-${NAME.charAt(0).toLowerCase()}.csv`;
const facultyFilePath = path.resolve(CSR_HOME, facultyFileName);

const parsedEntry = `${NAME},${INSTITUTION},${HOME_PAGE},${GOOGLE_SCHOLAR}`;

const file = await fs.readFile(facultyFilePath, 'utf8');

// 检测换行符类型
const nl = file.includes('\r\n') ? '\r\n' : '\n';

const lines = file.split(nl);

let target = 0;

for (let idx = 1; idx < lines.length; idx++) {
  const name = lines[idx].split(',')[0];
  if (name.localeCompare(NAME) > 0) {
    target = idx;
    break;
  }
}

const newLines = [...lines.slice(0, target), parsedEntry, ...lines.slice(target)];
await fs.writeFile(facultyFilePath, newLines.join(nl));

// Normalizes the vendored market-solutions seed into the lean catalog the app
// consumes (src/data/solucoes.json). Run with: npm run data
//
// Source of truth for the raw data is scripts/source/tools-seed-data.json
// (a vendored snapshot from the cyber-architecture project). Extra solutions
// not present in that snapshot — e.g. CMDB — live in scripts/extra-solutions.json
// so they stay easy to review and edit by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');

// --- Category → group mapping ------------------------------------------------
// Groups give the wizard a friendly "área" filter on top of the raw category.
const GROUPS = {
  identidade: 'Identidade & Acesso',
  rede: 'Rede & Perímetro',
  endpoint: 'Endpoint',
  deteccao: 'Detecção & Resposta',
  dados: 'Proteção de Dados',
  cloud: 'Segurança em Nuvem',
  appsec: 'Segurança de Aplicações',
  cripto: 'Criptografia & PKI',
  emailweb: 'E-mail & Web',
  vuln: 'Vulnerabilidades & Exposição',
  ot: 'Segurança OT / ICS',
  resiliencia: 'Resiliência & Backup',
  itsm: 'Gestão de Ativos & ITSM',
  suite: 'Suítes',
  outros: 'Outros',
};

const CATEGORY_GROUP = {
  MFA: 'identidade',
  IAM: 'identidade',
  IGA: 'identidade',
  CIAM: 'identidade',
  SSO: 'identidade',
  PAM: 'identidade',
  'Acesso Condicional': 'identidade',
  'Proteção de Identidade': 'identidade',
  'Zero Trust': 'identidade',
  ZTNA: 'identidade',
  Firewall: 'rede',
  IPS: 'rede',
  NAC: 'rede',
  VPN: 'rede',
  'SD-WAN': 'rede',
  'Anti-DDoS': 'rede',
  Microsegmentação: 'rede',
  'Wireless Security': 'rede',
  Proxy: 'rede',
  SWG: 'rede',
  'DNS Protection': 'rede',
  EDR: 'endpoint',
  EPP: 'endpoint',
  MDM: 'endpoint',
  SIEM: 'deteccao',
  SOAR: 'deteccao',
  NDR: 'deteccao',
  BAS: 'deteccao',
  'Threat Intelligence': 'deteccao',
  Monitoramento: 'deteccao',
  APM: 'deteccao',
  DLP: 'dados',
  NDLP: 'dados',
  RMS: 'dados',
  CASB: 'dados',
  'Descoberta de Dados': 'dados',
  'Classificação de Dados': 'dados',
  DSPM: 'dados',
  'Data Governance': 'dados',
  Tokenização: 'dados',
  Mascaramento: 'dados',
  CSPM: 'cloud',
  CWPP: 'cloud',
  CIEM: 'cloud',
  SAST: 'appsec',
  DAST: 'appsec',
  SCA: 'appsec',
  'IaC Security': 'appsec',
  'API Security': 'appsec',
  RASP: 'appsec',
  SBOM: 'appsec',
  'Secrets Scanning': 'appsec',
  'Secrets Management': 'appsec',
  'Container Security': 'appsec',
  'Key Management': 'cripto',
  Criptografia: 'cripto',
  'PKI/CLM': 'cripto',
  'Email Security': 'emailweb',
  WAF: 'emailweb',
  TVM: 'vuln',
  ASM: 'vuln',
  Backup: 'resiliencia',
  CMDB: 'itsm',
  Suite: 'suite',
};

function groupFor(category) {
  if (CATEGORY_GROUP[category]) return CATEGORY_GROUP[category];
  if (category.startsWith('OT')) return 'ot';
  return 'outros';
}

function slug(...parts) {
  return parts
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function splitComponents(component) {
  if (!component) return [];
  return component
    .split(/[,/]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function normalize(raw) {
  return raw.map((s) => {
    const capabilities = (s.features ?? [])
      .filter((f) => f && f.name)
      .map((f) => ({ name: f.name, supported: f.supported ?? 0 }));
    return {
      id: slug(s.vendor, s.product),
      vendor: s.vendor,
      product: s.product,
      category: s.category,
      group: groupFor(s.category),
      tier: s.tier ?? 'standard',
      priceRange: s.priceRange ?? '$$',
      marketRating: s.marketRating ?? null,
      marketRatingSource: s.marketRatingSource ?? null,
      description: s.description ?? '',
      useCases: s.useCases ?? null,
      website: s.website ?? null,
      components: splitComponents(s.component),
      capabilities,
    };
  });
}

// --- Build -------------------------------------------------------------------
const rawSeed = JSON.parse(readFileSync(join(here, 'source/tools-seed-data.json'), 'utf8'));
let extra = [];
try {
  extra = JSON.parse(readFileSync(join(here, 'extra-solutions.json'), 'utf8'));
} catch {
  extra = [];
}

const solutions = normalize([...rawSeed, ...extra]);

// Reject accidental duplicate ids so the catalog stays a clean lookup.
const seen = new Set();
for (const s of solutions) {
  if (seen.has(s.id)) throw new Error(`Duplicate solution id: ${s.id}`);
  seen.add(s.id);
}

const categoryCounts = new Map();
for (const s of solutions) {
  const key = s.category;
  categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
}
const categories = [...categoryCounts.entries()]
  .map(([id, count]) => ({ id, group: groupFor(id), count }))
  .sort((a, b) => a.id.localeCompare(b.id));

const usedGroups = new Set(categories.map((c) => c.group));
const groups = Object.entries(GROUPS)
  .filter(([id]) => usedGroups.has(id))
  .map(([id, label]) => ({ id, label }));

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source:
    'cyber-architecture/backend/src/db/tools-seed-data.json (snapshot) + scripts/extra-solutions.json',
  groups,
  categories,
  solutions,
};

writeFileSync(join(repo, 'src/data/solucoes.json'), JSON.stringify(out, null, 2) + '\n');
console.log(
  `Wrote ${solutions.length} solutions, ${categories.length} categories, ${groups.length} groups.`,
);

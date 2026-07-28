export const CHECKS = Object.freeze([
  { id: 'robots', area: 'discoverability', points: 5, label: 'robots.txt was reachable', mode: 'binary' },
  { id: 'sitemap', area: 'discoverability', points: 10, label: 'A sitemap was reachable', mode: 'binary' },
  { id: 'canonical', area: 'discoverability', points: 10, label: 'Indexable pages have an in-scope canonical URL', mode: 'coverage' },
  { id: 'titles', area: 'metadata', points: 10, label: 'Indexable pages have a non-empty title', mode: 'coverage' },
  { id: 'descriptions', area: 'metadata', points: 10, label: 'Indexable pages have a non-empty meta description', mode: 'coverage' },
  { id: 'h1', area: 'metadata', points: 5, label: 'Indexable pages have exactly one H1', mode: 'coverage' },
  { id: 'indexable', area: 'content', points: 10, label: 'Sampled pages are intentionally indexable', mode: 'coverage' },
  { id: 'content', area: 'content', points: 10, label: 'Indexable pages contain at least 200 main-content words', mode: 'coverage' },
  { id: 'unique_titles', area: 'content', points: 5, label: 'Indexable page titles are unique', mode: 'coverage' },
  { id: 'llms', area: 'aiWorkflow', points: 10, label: 'The llms.txt decision is documented; present files are reviewed', mode: 'decision' },
  { id: 'inventory', area: 'aiWorkflow', points: 8, label: 'A reviewable content inventory exists', mode: 'binary' },
  { id: 'monitoring', area: 'aiWorkflow', points: 7, label: 'Comparable change monitoring is active', mode: 'binary' },
]);

export const AREA_LABELS = Object.freeze({
  discoverability: 'Discoverability',
  metadata: 'Metadata',
  content: 'Content hygiene',
  aiWorkflow: 'AI workflow readiness',
});

const round = (value) => Math.round(value * 100) / 100;

function assertEntry(check, entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error(`${check.id}: an entry is required.`);
  }
  if (!Number.isFinite(entry.coverage) || !Number.isInteger(entry.coverage) || entry.coverage < 0 || entry.coverage > 100) {
    throw new Error(`${check.id}: coverage must be a whole number from 0 to 100.`);
  }
  if (entry.coverage > 0 && (typeof entry.evidenceRef !== 'string' || entry.evidenceRef.trim().length === 0)) {
    throw new Error(`${check.id}: add an evidence reference before awarding credit.`);
  }
  if (check.mode === 'binary' && ![0, 100].includes(entry.coverage)) {
    throw new Error(`${check.id}: this check accepts only 0 or 100 percent.`);
  }
  if (check.mode === 'decision' && ![0, 100].includes(entry.coverage)) {
    throw new Error(`${check.id}: record either a documented decision (100) or an unresolved decision (0).`);
  }
}

export function calculateScore(entries) {
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    throw new Error('Scorecard entries must be an object.');
  }

  const checks = CHECKS.map((check) => {
    const entry = entries[check.id];
    assertEntry(check, entry);
    const earned = round(check.points * entry.coverage / 100);
    return {
      ...check,
      coverage: entry.coverage,
      evidenceRef: entry.evidenceRef.trim(),
      earned,
      gap: round(check.points - earned),
    };
  });

  const score = round(checks.reduce((sum, check) => sum + check.earned, 0));
  const areas = Object.entries(AREA_LABELS).map(([id, label]) => {
    const areaChecks = checks.filter((check) => check.area === id);
    return {
      id,
      label,
      earned: round(areaChecks.reduce((sum, check) => sum + check.earned, 0)),
      possible: areaChecks.reduce((sum, check) => sum + check.points, 0),
    };
  });

  return {
    schemaVersion: 'scorecard-1.0',
    score,
    possible: 100,
    gapBand: score >= 80 ? 'low' : score >= 60 ? 'medium' : score >= 40 ? 'high' : 'critical',
    areas,
    checks,
    prioritizedGaps: checks
      .filter((check) => check.gap > 0)
      .sort((a, b) => b.gap - a.gap || a.id.localeCompare(b.id))
      .map(({ id, area, label, gap, earned, points, evidenceRef }) => ({
        id, area, label, gap, earned, possible: points, evidenceRef,
      })),
    limitations: [
      'This is an author-defined operational scorecard, not an external standard or certification.',
      'It does not predict rankings, citations, traffic, security, legal compliance, or revenue.',
      'Coverage and evidence references are supplied by the reviewer and must be independently verified.',
      'A documented not-applicable llms.txt decision may receive full credit; publishing llms.txt is not required.',
    ],
  };
}

export function toMarkdown(result, context = {}) {
  const site = typeof context.siteUrl === 'string' && context.siteUrl.trim() ? context.siteUrl.trim() : 'Not recorded';
  const observedAt = typeof context.observedAt === 'string' && context.observedAt.trim() ? context.observedAt.trim() : 'Not recorded';
  const areaRows = result.areas.map((area) => `| ${area.label} | ${area.earned} | ${area.possible} |`).join('\n');
  const gapRows = result.prioritizedGaps.length
    ? result.prioritizedGaps.map((gap, index) => `${index + 1}. **${gap.label}** — ${gap.gap} point gap; evidence: ${gap.evidenceRef || 'unknown'}.`).join('\n')
    : 'No scoring gaps were recorded. Manual verification is still required.';
  return `# Evidence-Led Website Scorecard\n\n- Site: ${site}\n- Observed: ${observedAt}\n- Score: **${result.score}/100**\n- Operational gap band: **${result.gapBand}**\n\n## Areas\n\n| Area | Earned | Possible |\n|---|---:|---:|\n${areaRows}\n\n## Prioritized gaps\n\n${gapRows}\n\n## Boundaries\n\n${result.limitations.map((item) => `- ${item}`).join('\n')}\n`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function defaultEntries(preset = false) {
  return Object.fromEntries(CHECKS.map((check, index) => [check.id, {
    coverage: preset ? (check.mode === 'coverage' ? [100, 70, 40][index % 3] : (index % 4 === 0 ? 0 : 100)) : 0,
    evidenceRef: preset ? `evidence.${check.id}` : '',
  }]));
}

function setEntries(entries) {
  for (const check of CHECKS) {
    const coverage = document.getElementById(`coverage-${check.id}`);
    const evidence = document.getElementById(`evidence-${check.id}`);
    coverage.value = String(entries[check.id].coverage);
    evidence.value = entries[check.id].evidenceRef;
  }
}

function readEntries() {
  return Object.fromEntries(CHECKS.map((check) => [check.id, {
    coverage: Number(document.getElementById(`coverage-${check.id}`).value),
    evidenceRef: document.getElementById(`evidence-${check.id}`).value,
  }]));
}

function renderResult(result) {
  const resultBox = document.getElementById('result');
  const topGaps = result.prioritizedGaps.slice(0, 5);
  resultBox.innerHTML = `
    <h2 id="result-heading">Your transparent score</h2>
    <div class="score-line"><strong>${result.score}</strong> <span>/100</span> <em class="band band-${result.gapBand}">${result.gapBand} gap band</em></div>
    <div class="area-grid">${result.areas.map((area) => `<div><span>${escapeHtml(area.label)}</span> <strong>${area.earned}/${area.possible}</strong></div>`).join('')}</div>
    <h3>Largest evidence gaps</h3>
    ${topGaps.length ? `<ol>${topGaps.map((gap) => `<li><strong>${escapeHtml(gap.label)}</strong> <span>${gap.gap} point gap · ${escapeHtml(gap.evidenceRef || 'unknown evidence')}</span></li>`).join('')}</ol>` : '<p>No scoring gaps were recorded. Manual verification is still required.</p>'}
    <div class="upsell" aria-label="Paid Audit Kit">
      <h3>Turn this result into a reviewable client delivery.</h3>
      <p>The $49 kit adds strict JSON validation, a canonical evidence ledger, 16 regression tests, an editable client report, implementation templates, and a 19-page playbook.</p>
      <div class="cta-actions">
        <a class="button" href="./sample-report.html?utm_source=scorecard_result&amp;utm_medium=owned_tool&amp;utm_campaign=ai_audit_kit_launch&amp;utm_content=result_sample_bridge">See the generated sample report →</a>
        <a class="button secondary" href="https://cengokurtoglu.gumroad.com/l/ai-ready-website-audit-kit?wanted=true&amp;utm_source=scorecard_result&amp;utm_medium=owned_tool&amp;utm_campaign=ai_audit_kit_launch&amp;utm_content=result_direct_purchase">Already reviewed it? Get the full Audit Kit — $49</a>
      </div>
    </div>
  `;
  resultBox.hidden = false;
}

function init() {
  const form = document.getElementById('scorecard-form');
  if (!form) return;
  const checksRoot = document.getElementById('checks');
  checksRoot.innerHTML = Object.entries(AREA_LABELS).map(([area, label]) => `
    <section class="area" aria-labelledby="area-${area}">
      <h2 id="area-${area}">${escapeHtml(label)}</h2>
      ${CHECKS.filter((check) => check.area === area).map((check) => `
        <fieldset class="check">
          <legend>${escapeHtml(check.label)} <span>${check.points} pts</span></legend>
          <div class="fields">
            <label>Coverage
              ${check.mode === 'coverage'
                ? `<input id="coverage-${check.id}" name="coverage-${check.id}" type="number" min="0" max="100" step="1" value="0" inputmode="numeric">`
                : `<select id="coverage-${check.id}" name="coverage-${check.id}"><option value="0">Unknown / no credit</option><option value="100">Observed / documented</option></select>`}
            </label>
            <label>Evidence reference
              <input id="evidence-${check.id}" name="evidence-${check.id}" type="text" maxlength="160" placeholder="e.g. evidence.${check.id}" autocomplete="off">
            </label>
          </div>
        </fieldset>`).join('')}
    </section>`).join('');

  document.getElementById('load-example').addEventListener('click', () => setEntries(defaultEntries(true)));
  document.getElementById('clear-scorecard').addEventListener('click', () => {
    setEntries(defaultEntries(false));
    document.getElementById('result').hidden = true;
    document.getElementById('form-error').hidden = true;
  });

  let latest = null;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = document.getElementById('form-error');
    try {
      latest = calculateScore(readEntries());
      renderResult(latest);
      error.hidden = true;
      document.getElementById('result').focus();
    } catch (caught) {
      error.textContent = caught.message;
      error.hidden = false;
      latest = null;
    }
  });

  document.getElementById('download-result').addEventListener('click', () => {
    if (!latest) form.requestSubmit();
    if (!latest) return;
    const payload = {
      siteUrl: document.getElementById('site-url').value.trim() || null,
      observedAt: document.getElementById('observed-at').value || null,
      ...latest,
    };
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' }));
    anchor.download = 'evidence-led-scorecard.json';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  });

  document.getElementById('copy-report').addEventListener('click', async () => {
    if (!latest) form.requestSubmit();
    if (!latest) return;
    const button = document.getElementById('copy-report');
    const report = toMarkdown(latest, {
      siteUrl: document.getElementById('site-url').value,
      observedAt: document.getElementById('observed-at').value,
    });
    try {
      await navigator.clipboard.writeText(report);
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy Markdown'; }, 1600);
    } catch {
      button.textContent = 'Copy unavailable';
    }
  });
}

if (typeof document !== 'undefined') init();

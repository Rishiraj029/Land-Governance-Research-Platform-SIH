/**
 * Cross-Domain Insight Explorer — live verification against real Supabase data.
 *
 * Runs the exact compiled production logic (lib/crossDomainRelationships.js) with the
 * test query "urban expansion land disputes rajasthan" and checks that:
 *  1. every displayed node corresponds to real repository/dashboard/GIS records,
 *  2. every edge can be re-derived independently (shared geography OR keyword overlap),
 *  3. every navigation URL's exact filter returns >= 1 row in the database.
 */
const fs = require("fs");
const path = require("path");
const lib = require("./lib/crossDomainRelationships.js");

const envText = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
const SUPABASE_URL = envText.match(/VITE_SUPABASE_URL=(.+)/)[1].trim();
const SUPABASE_KEY = envText.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function rest(table, select) {
  // Page through the table the same way the app does (Supabase caps a single request at 1000 rows).
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=${select}&order=id&limit=${pageSize}&offset=${offset}`,
      { headers },
    );
    if (!res.ok) throw new Error(`${table} -> ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

async function countWhere(table, params) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}&select=id`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  if (!res.ok) throw new Error(`${table} count -> ${res.status} ${await res.text()}`);
  const contentRange = res.headers.get("content-range");
  return contentRange ? Number(contentRange.split("/")[1]) : NaN;
}

function keywordSet(text) {
  return new Set(
    (text || "").toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 2),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

(async () => {
  const [docs, indicators, gis] = await Promise.all([
    rest("repository_documents", "theme,state"),
    rest("dashboard_indicators", "category,state"),
    rest("gis_features", "category,theme,state"),
  ]);
  console.log(`Loaded rows -> documents: ${docs.length}, indicators: ${indicators.length}, gis: ${gis.length}`);

  const query = "urban expansion land disputes rajasthan";
  const analysis = lib.computeCrossDomainRelationships(docs, indicators, gis, query);
  console.log(`\nQuery: "${query}"   matchedByQuery=${analysis.matchedByQuery}`);
  console.log(`Nodes: ${analysis.nodes.length}   Edges: ${analysis.edges.length}`);

  console.log("\n--- NODES (name | type | docs | indicators | gis | geographies) ---");
  let nodeErrors = 0;
  for (const n of analysis.nodes) {
    // Node must be backed by real records.
    const backed = n.documentCount + n.indicatorCount + n.gisFeatureCount;
    if (backed === 0) nodeErrors += 1;
    console.log(
      `${n.name} | ${n.type} | ${n.documentCount} | ${n.indicatorCount} | ${n.gisFeatureCount} | ${n.geographies.join(", ")}${backed === 0 ? " <-- NOT BACKED BY RECORDS" : ""}`,
    );
  }

  const byId = new Map(analysis.nodes.map((n) => [n.id, n]));
  console.log("\n--- EDGES (labelled 'Related domains' in the UI) ---");
  let edgeErrors = 0;
  for (const e of analysis.edges) {
    const a = byId.get(e.source);
    const b = byId.get(e.target);
    const shared = a.geographies.filter((g) => b.geographies.includes(g));
    const kw = jaccard(keywordSet(a.name), keywordSet(b.name));
    const ok = e.type === "shared-geography" ? shared.length > 0 : kw > 0.3;
    if (!ok) edgeErrors += 1;
    console.log(
      `${a.name} <-> ${b.name} [${e.type}, strength=${e.strength.toFixed(2)}] shared: [${shared.join(", ") || "-"}] jaccard=${kw.toFixed(2)} ${ok ? "OK" : "MISMATCH"}`,
    );
  }

  console.log("\n--- NODE COUNTS vs DATABASE (exact match required) + NAVIGATION FILTERS ---");
  let navErrors = 0;
  for (const n of analysis.nodes) {
    const repo = lib.getNodeRepositoryUrl(n);
    const dash = lib.getNodeDashboardUrl(n);
    const gisUrl = lib.getNodeGisUrl(n);

    if (n.documentCount > 0) {
      const dbCount = await countWhere(
        "repository_documents",
        `theme=eq.${encodeURIComponent(n.name)}`,
      );
      const ok = dbCount === n.documentCount;
      if (!ok) navErrors += 1;
      console.log(
        `${n.name} -> repository: node=${n.documentCount} db=${dbCount} ${ok ? "OK" : "MISMATCH"} (${repo})`,
      );
      const state = new URL(repo, "http://x").searchParams.get("state");
      if (state) {
        const c = await countWhere(
          "repository_documents",
          `theme=eq.${encodeURIComponent(n.name)}&state=eq.${encodeURIComponent(state)}`,
        );
        if (c === 0) navErrors += 1;
        console.log(`   +state=${state}: ${c} rows ${c > 0 ? "OK" : "EMPTY"}`);
      }
    }

    if (n.indicatorCount > 0) {
      const dbCount = await countWhere(
        "dashboard_indicators",
        `category=eq.${encodeURIComponent(n.name)}`,
      );
      const ok = dbCount === n.indicatorCount;
      if (!ok) navErrors += 1;
      console.log(
        `${n.name} -> dashboards: node=${n.indicatorCount} db=${dbCount} ${ok ? "OK" : "MISMATCH"} (${dash})`,
      );
      const state = new URL(dash, "http://x").searchParams.get("state");
      if (state) {
        const c = await countWhere(
          "dashboard_indicators",
          `category=eq.${encodeURIComponent(n.name)}&state=eq.${encodeURIComponent(state)}`,
        );
        if (c === 0) navErrors += 1;
        console.log(`   +state=${state}: ${c} rows ${c > 0 ? "OK" : "EMPTY"}`);
      }
    }

    if (n.gisFeatureCount > 0) {
      const orValue = `(category.eq.${JSON.stringify(n.name)},theme.eq.${JSON.stringify(n.name)})`;
      const dbCount = await countWhere("gis_features", `or=${encodeURIComponent(orValue)}`);
      const ok = dbCount === n.gisFeatureCount;
      if (!ok) navErrors += 1;
      console.log(
        `${n.name} -> gis: node=${n.gisFeatureCount} db=${dbCount} ${ok ? "OK" : "MISMATCH"} (${gisUrl})`,
      );
      const state = new URL(gisUrl, "http://x").searchParams.get("state");
      if (state) {
        const key = new URL(gisUrl, "http://x").searchParams.get("category") ? "category" : "theme";
        const c = await countWhere(
          "gis_features",
          `${key}=eq.${encodeURIComponent(n.name)}&state=eq.${encodeURIComponent(state)}`,
        );
        if (c === 0) navErrors += 1;
        console.log(`   +state=${state}: ${c} rows ${c > 0 ? "OK" : "EMPTY"}`);
      }
    }
  }

  console.log(`\nPRIMARY LINKS (card "open" button):`);
  for (const n of analysis.nodes.slice(0, 8)) {
    console.log(`${n.name} -> ${lib.getNodeNavigationUrl(n)}`);
  }

  const pass = edgeErrors === 0 && navErrors === 0 && nodeErrors === 0;
  console.log(`\nRESULT: ${pass ? "PASS" : "FAIL"}  (unbacked nodes: ${nodeErrors}, edge mismatches: ${edgeErrors}, empty filters: ${navErrors})`);
  process.exit(pass ? 0 : 1);
})().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});

(function () {
"use strict";
var TODAY = "2026-10-19";
var STORAGE_KEY = "church-growth-focused-mvp-v1";
var DAY = 86400000;
var routes = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "campaigns", label: "Campaigns", icon: "campaign" },
  { id: "visitors", label: "Visitors", icon: "people" },
  { id: "followups", label: "Follow-ups", icon: "task" }
];
var state = { tenant: "riverside", page: normalizePage(location.hash), range: "all", drawer: false, modal: "", modalVisitor: "", selectedCampaign: "", search: "", channel: "all", visitorStatus: "all", taskStatus: "all" };
var symbols = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>',
  campaign: '<path d="M3 10v4l12 5V5L3 10Z"/><path d="M15 9a5 5 0 0 1 0 6"/><path d="M19 6a9 9 0 0 1 0 12"/><path d="m6 15 2 6"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
  task: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m7 12 3 3 7-7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/>'
};
function icon(name) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (symbols[name] || "") + '</svg>'; }
function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function num(n) { return Number(n || 0).toLocaleString("en-US"); }
function money(n) { return "$" + num(n); }
function parseDay(s) { return Date.parse(String(s) + "T00:00:00Z"); }
function addDays(s, days) { return new Date(parseDay(s) + days * DAY).toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((parseDay(a) - parseDay(b)) / DAY); }
function friendly(s) { return new Date(parseDay(s)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); }
function shortDay(s) { return new Date(parseDay(s)).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }); }
function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseDay(s)) && new Date(parseDay(s)).toISOString().slice(0, 10) === s; }
function normalizePage(hash) {
  var n = String(hash || "").replace(/^#\/?/, "").split(/[/?]/)[0];
  var aliases = { dashboard: "overview", outreach: "campaigns", people: "visitors", "follow-ups": "followups", attendance: "overview", reports: "overview", settings: "overview" };
  n = aliases[n] || n;
  return ["overview", "campaigns", "visitors", "followups"].indexOf(n) !== -1 ? n : "overview";
}
function makeId(prefix) { return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function makeFixture(id, name, initials, configs, taskRows, visitorPrefix) {
  var campaigns = configs.map(function (c, i) { return { id: id + "-c" + (i + 1), name: c[0], channel: c[1], date: c[2], reach: c[3], spend: c[4] }; });
  var visitors = [];
  configs.forEach(function (c, index) {
    for (var i = 0; i < c[5]; i++) {
      var first = addDays(c[2], 2 + i * (c[8] || 2));
      if (daysBetween(first, TODAY) > 0) continue;
      var ret = null;
      if (i < c[6]) ret = addDays(first, 6 + (i * 5) % 19);
      else if (i < c[6] + c[7]) ret = addDays(first, 36 + (i % 3) * 6);
      if (ret && daysBetween(ret, TODAY) > 0) ret = null;
      visitors.push({ id: visitorPrefix + "-" + String(visitors.length + 1).padStart(3, "0"), campaignId: campaigns[index].id, firstVisit: first, returnVisit: ret });
    }
  });
  var tasks = taskRows.map(function (row, i) {
    var visitor = visitors[row[0]];
    return { id: id + "-t" + (i + 1), visitorId: visitor.id, kind: row[1], owner: row[2], due: addDays(TODAY, row[3]), done: Boolean(row[4]), completedAt: row[4] ? addDays(TODAY, Math.min(row[3], -1)) : null };
  });
  return { id: id, name: name, initials: initials, campaigns: campaigns, visitors: visitors, tasks: tasks };
}
var fixture = {
  riverside: makeFixture("riverside", "Riverside Community Church", "RC", [
    ["Neighbourhood Welcome", "Community", "2026-05-12", 560, 280, 12, 7, 2, 3],
    ["Campus Connections", "Campus", "2026-06-05", 390, 200, 10, 5, 1, 3],
    ["Community Food Drive", "Community", "2026-07-03", 700, 850, 16, 9, 2, 3],
    ["Family Fun Day", "Event", "2026-08-16", 485, 650, 13, 6, 1, 3],
    ["Social Invitations", "Digital", "2026-09-20", 1300, 150, 12, 3, 0, 2],
    ["October Open House", "Event", "2026-10-05", 310, 250, 6, 2, 0, 2]
  ], [
    [3, "Welcome call", "Welcome team", -21, true], [12, "Invite to welcome gathering", "Connect team", -11, true],
    [27, "Follow up after food drive", "Outreach team", -4, false], [37, "Personal welcome check-in", "Welcome team", -2, false],
    [46, "Connect with newcomer", "Care team", 1, false], [54, "Check in after first visit", "Welcome team", -3, false],
    [59, "Invite to Sunday gathering", "Welcome team", 2, false], [63, "Pastoral follow-up", "Care team", -1, false],
    [66, "Welcome follow-up", "Welcome team", 4, false], [50, "Connect with volunteer team", "Connect team", -5, true],
    [42, "Weekend check-in", "Welcome team", -10, true]
  ], "RV"),
  grace: makeFixture("grace", "Grace Fellowship", "GF", [
    ["Community Lunch", "Community", "2026-05-02", 360, 280, 11, 6, 1, 3],
    ["Student Welcome", "Campus", "2026-06-12", 280, 190, 8, 4, 1, 4],
    ["Neighbourhood Visits", "Community", "2026-08-01", 240, 120, 12, 5, 1, 3],
    ["Family Gathering", "Event", "2026-09-13", 430, 350, 8, 3, 0, 3],
    ["October Invitations", "Digital", "2026-10-08", 910, 100, 5, 1, 0, 2]
  ], [
    [2, "Welcome call", "Welcome team", -17, true], [11, "Check in with guest", "Care team", -2, false],
    [21, "Follow up after visits", "Outreach team", -5, false], [29, "Invite to newcomer lunch", "Welcome team", 2, false],
    [35, "Welcome note", "Connect team", -4, true], [39, "Check in after first visit", "Welcome team", -1, false],
    [41, "Sunday welcome check-in", "Welcome team", 4, false]
  ], "GV")
};
function load() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(fixture);
    var parsed = JSON.parse(raw);
    if (parsed && parsed.riverside && Array.isArray(parsed.riverside.campaigns) && Array.isArray(parsed.riverside.visitors) && Array.isArray(parsed.riverside.tasks)
      && parsed.grace && Array.isArray(parsed.grace.campaigns) && Array.isArray(parsed.grace.visitors) && Array.isArray(parsed.grace.tasks)) return parsed;
  } catch (_) {}
  return clone(fixture);
}
var store = load();
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (_) { toast("Browser storage unavailable; changes may not persist after refresh."); }
}
function church() { return store[state.tenant]; }
function getCampaign(id) { return church().campaigns.find(function (x) { return x.id === id; }); }
function getVisitor(id) { return church().visitors.find(function (x) { return x.id === id; }); }
function inRange(date) { return state.range === "all" || daysBetween(TODAY, date) <= Number(state.range); }
function visitorsInRange() { return church().visitors.filter(function (v) { return inRange(v.firstVisit); }); }
function campaignsInRange() { return church().campaigns.filter(function (c) { return inRange(c.date); }); }
function eligible30(visitors) { return visitors.filter(function (v) { return daysBetween(TODAY, v.firstVisit) >= 30; }); }
function returnedWithin(visitor, days) { return Boolean(visitor.returnVisit) && daysBetween(visitor.returnVisit, visitor.firstVisit) >= 0 && daysBetween(visitor.returnVisit, visitor.firstVisit) <= days; }
function returnStats(visitors) {
  var mature = eligible30(visitors);
  var returned = mature.filter(function (v) { return returnedWithin(v, 30); }).length;
  return { mature: mature.length, returned: returned, rate: mature.length ? Math.round(100 * returned / mature.length) : null };
}
function pct(x) { return x == null ? "—" : x + "%"; }
function openTasks() { return church().tasks.filter(function (t) { return !t.done; }); }
function overdueTasks() { return openTasks().filter(function (t) { return daysBetween(TODAY, t.due) > 0; }); }
function tasksForVisitor(visitorId) { return church().tasks.filter(function (t) { return t.visitorId === visitorId; }); }
function iconButton(label, symbol, attr) { return '<button class="btn small-action" ' + attr + '>' + icon(symbol) + esc(label) + '</button>'; }
function button(label, action, type) { return '<button class="btn ' + (type || "") + '" type="button" data-action="' + esc(action) + '">' + esc(label) + '</button>'; }
function pageTitle(kicker, title, description, buttons) {
  return '<header class="page-head"><div><span class="kicker">' + esc(kicker) + '</span><h1>' + esc(title) + '</h1><p>' + description + '</p></div><div class="page-actions">' + (buttons || "") + '</div></header>';
}
function metric(label, value, note, color) {
  return '<article class="metric"><div class="metric-label">' + esc(label) + '</div><div class="metric-value">' + esc(value) + '</div><p class="metric-note ' + (color || "") + '">' + note + '</p></article>';
}
function panel(title, note, body, action) {
  return '<section class="panel"><div class="panel-title"><div><h2>' + esc(title) + '</h2>' + (note ? '<p>' + note + '</p>' : '') + '</div>' + (action || '') + '</div>' + body + '</section>';
}
function empty(title, note, buttonMarkup) {
  return '<div class="empty"><strong>' + esc(title) + '</strong>' + esc(note) + (buttonMarkup ? '<div style="margin-top:15px">' + buttonMarkup + '</div>' : '') + '</div>';
}
function tag(text, type) { return '<span class="tag ' + (type || "") + '">' + esc(text) + '</span>'; }
function rateLabel(r) { return r.mature ? '<strong>' + pct(r.rate) + '</strong><span class="cell-sub">' + r.returned + ' / ' + r.mature + ' eligible</span>' : tag('Not mature yet', 'gray'); }
function channels() { return ["all", "Community", "Campus", "Event", "Digital", "Partnership"]; }
function navMarkup() {
  return routes.map(function (r) {
    return '<a class="side-link ' + (state.page === r.id ? 'active' : '') + '" href="#/' + r.id + '" data-go="' + r.id + '" ' + (state.page === r.id ? 'aria-current="page"' : '') + '>' + icon(r.icon) + '<span>' + esc(r.label) + '</span></a>';
  }).join("");
}
function appShell() {
  var meta = church();
  return '<div class="drawer-shade ' + (state.drawer ? 'show' : '') + '" data-action="close-drawer"></div><div class="app-shell">'
    + '<aside id="sidebar" class="sidebar ' + (state.drawer ? 'open' : '') + '">'
    + '<a href="index.html" class="brand" aria-label="Back to Church Growth Intelligence website"><span class="brand-symbol">⌁</span><span><span class="brand-name">church<em>growth</em></span><span class="brand-sub">INTELLIGENCE</span></span></a>'
    + '<div class="workspace-label">OUTREACH INTELLIGENCE</div><nav class="side-nav" aria-label="Product navigation">' + navMarkup() + '</nav>'
    + '<div class="side-footer"><strong>Built around the first hello.</strong><p>This is a focused product demonstration. All records are fictional and edits remain in this browser.</p><div class="side-footer-actions"><a href="index.html">View website ↗</a><button type="button" data-action="reset">Reset demo</button></div></div></aside>'
    + '<div class="shell-content"><header class="topbar">'
    + '<div style="display:flex;align-items:center;gap:14px"><button type="button" class="mobile-menu" aria-label="Open menu" aria-controls="sidebar" aria-expanded="' + (state.drawer ? 'true' : 'false') + '" data-action="toggle-drawer">' + icon("menu") + '</button><div class="breadcrumb"><span class="workspace-word">Workspace</span><span>/</span><b>' + esc(routes.find(function (r) { return r.id === state.page; }).label) + '</b></div></div>'
    + '<div class="top-actions"><span class="demo-label"><span class="demo-dot"></span> FICTIONAL DEMO</span>'
    + '<label class="sr-only" for="church-select">Choose fictional church workspace</label><select id="church-select" class="select" aria-label="Choose fictional church workspace">'
    + Object.keys(store).map(function (id) { return '<option value="' + esc(id) + '" ' + (id === state.tenant ? 'selected' : '') + '>' + esc(store[id].name) + '</option>'; }).join("")
    + '</select><span class="avatar" aria-hidden="true">' + esc(meta.initials) + '</span></div></header>'
    + '<main id="main-content" class="page">' + view() + footerNotice() + '</main></div></div>' + modalMarkup();
}
function footerNotice() {
  return '<footer class="privacy"><strong>Important:</strong> Demonstration data only. Church accounts are not securely isolated in this frontend, and no real people or religious data should be entered. True tenant access, consent safeguards and production storage remain future work. &nbsp; <span>Sample reference date: ' + friendly(TODAY) + '.</span></footer>';
}
function rangeSelect() {
  return '<label class="sr-only" for="range">Date range</label><select id="range" class="select"><option value="all" ' + (state.range === "all" ? 'selected' : '') + '>All sample data</option><option value="90" ' + (state.range === "90" ? 'selected' : '') + '>Last 90 days</option><option value="30" ' + (state.range === "30" ? 'selected' : '') + '>Last 30 days</option></select>';
}
function overview() {
  var v = visitorsInRange(), c = campaignsInRange(), r = returnStats(v), overdue = overdueTasks();
  var reached = c.reduce(function (a, x) { return a + Number(x.reach || 0); }, 0);
  var doneVisitorIds = new Set(church().tasks.filter(function (t) { return t.done; }).map(function (t) { return t.visitorId; }));
  var done = v.filter(function (x) { return doneVisitorIds.has(x.id); }).length;
  var actions = rangeSelect() + '<button class="btn primary" type="button" data-action="open-visit">' + icon("plus") + ' Record first visit</button>';
  var html = pageTitle("FOCUSED MVP / " + church().name, "Outreach overview",
    'Understand what happens after someone first connects with your church. <strong>Fictional data as of ' + friendly(TODAY) + '.</strong>', actions);
  html += '<section class="focus-banner"><div><span class="kicker">FROM INVITATION TO LASTING ENGAGEMENT</span><h2>Because the first hello should not be the last.</h2><p>Record an outreach campaign, log a first visit, follow up and record a return. Every action updates this shared demo.</p></div>'
    + '<button class="btn lime" type="button" data-go="campaigns">Explore campaigns ' + icon("arrow") + '</button></section>';
  html += '<div class="metrics">'
    + metric("Source-attributed first visits", num(v.length), 'Visitors linked to a recorded outreach source')
    + metric("30-day return (mature cohort)", pct(r.rate), r.mature ? r.returned + " of " + r.mature + " eligible visitors returned" : "No first visits have matured for 30 days", "good")
    + metric("Follow-ups needing attention", num(overdue.length), num(openTasks().length) + ' total open tasks', overdue.length ? "" : "good")
    + metric("Outreach campaigns", num(c.length), 'Estimated reach: ' + num(reached) + ' encounters (not unique people)')
    + '</div>';
  html += '<div class="grid-main">'
    + panel("First visits over time", "From the visit dates recorded in the current church workspace · recent weeks", visitsChart())
    + panel("Follow-through snapshot", "Related indicators, not a single conversion funnel",
      '<div class="funnel-grid">'
      + '<div class="funnel-stage"><span class="number">' + num(v.length) + '</span><span class="label">First visits</span><span class="mini">Source attributed</span></div>'
      + '<div class="funnel-stage"><span class="number">' + num(done) + '</span><span class="label">Followed up</span><span class="mini">At least one completed task</span></div>'
      + '<div class="funnel-stage"><span class="number">' + num(r.returned) + '</span><span class="label">Returned ≤30d</span><span class="mini">From ' + r.mature + ' eligible first visits</span></div></div>'
      + '<p class="support-note">“Reached”, “first visited”, “followed up” and “returned” measure different things. Follow-up completion does not imply that it caused a return.</p>');
  html += '</div><div class="grid-even">'
    + panel("Where first visits originate", "Attribution based on one recorded campaign per visitor · selected period", campaignBars(v))
    + panel("Needs your attention", "Open tasks and visitors who may need a next step", attentionList(overdue, v), '<button type="button" data-go="followups">Open queue →</button>')
    + '</div>';
  html += panel("Campaign performance", "Compare outreach sources using observed outcomes—not reach alone", campaignMiniTable(v),
    '<button type="button" data-go="campaigns">All campaigns →</button>');
  return html;
}
function visitsChart() {
  var count = state.range === "30" ? 5 : state.range === "90" ? 13 : 16;
  var vals = Array(count).fill(0);
  church().visitors.forEach(function (v) { var weeksAgo = Math.floor(daysBetween(TODAY, v.firstVisit) / 7); if (weeksAgo >= 0 && weeksAgo < count) vals[count - 1 - weeksAgo]++; });
  var max = Math.max(4, Math.max.apply(null, vals) + 1);
  var W = 640, H = 250, L = 42, R = 16, T = 18, B = 37;
  function x(i) { return L + (i / (vals.length - 1)) * (W - L - R); }
  function y(n) { return T + (max - n) / max * (H - T - B); }
  var pts = vals.map(function (n, i) { return x(i).toFixed(2) + "," + y(n).toFixed(2); }).join(" ");
  var area = L + "," + (H - B) + " " + pts + " " + (W - R) + "," + (H - B);
  var grid = [0, .5, 1].map(function (t) { var yy = y(max * t); return '<line class="chart-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/><text class="axis-label" x="6" y="' + (yy + 4) + '">' + Math.round(max * t) + '</text>'; }).join("");
  var dots = vals.map(function (n, i) {
    return '<circle class="plot-dot" cx="' + x(i) + '" cy="' + y(n) + '" r="4.2"><title>Week ' + (i + 1) + ': ' + n + ' first visits</title></circle>';
  }).join("");
  var labels = vals.map(function (_, i) { return (i === 0 || i === count - 1 || (count > 8 && i % 3 === 0)) ? '<text class="axis-label" x="' + x(i) + '" y="243" text-anchor="middle">' + (i === count - 1 ? "This week" : (count - 1 - i) + "w ago") + '</text>' : ''; }).join("");
  return '<div class="chart-container"><svg viewBox="0 0 640 250" role="img" aria-label="Weekly first visit trend over the recent ' + count + ' weeks">' + grid
    + '<polygon class="chart-area" points="' + area + '"/><polyline class="chart-line" points="' + pts + '"/>' + dots + labels
    + '</svg><div class="chart-caption"><span><span class="legend-dot"></span>Source-attributed first visits</span><span>Fictional weekly records</span></div></div>';
}
function campaignBars(visitors) {
  var rows = church().campaigns.map(function (c) {
    return { c: c, count: visitors.filter(function (v) { return v.campaignId === c.id; }).length };
  }).filter(function (x) { return x.count > 0; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);
  if (!rows.length) return empty("No first visits in this period", "Try another date range or record a first visit.");
  var max = Math.max.apply(null, rows.map(function (x) { return x.count; }));
  return '<div class="mini-bars">' + rows.map(function (x) {
    return '<div class="bar-row"><span class="name" title="' + esc(x.c.name) + '">' + esc(x.c.name) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + (x.count * 100 / max).toFixed(1) + '%"></div></div><span class="bar-count">' + x.count + '</span></div>';
  }).join("") + '</div><p class="support-note">One recorded campaign source per first visit. This is association, not proof of cause.</p>';
}
function attentionList(overdue, visitors) {
  var pending = visitors.filter(function (v) {
    return !v.returnVisit && !tasksForVisitor(v.id).some(function (t) { return !t.done; });
  }).slice(-1);
  if (!overdue.length && !pending.length) return '<p class="support-note">No overdue or unassigned work in this demo.</p>';
  var parts = overdue.slice(0, 3).map(function (t) {
    return '<div class="attention"><span class="attention-dot"></span><div><strong>' + esc(t.kind) + '</strong><small>' + esc(t.visitorId) + ' · ' + esc(t.owner) + ' · Due ' + friendly(t.due) + '</small></div></div>';
  });
  pending.forEach(function (v) {
    parts.push('<div class="attention"><span class="attention-dot"></span><div><strong>Visitor ' + esc(v.id) + ' has no open follow-up</strong><small>First visit ' + friendly(v.firstVisit) + ' · consider a personal next step.</small></div></div>');
  });
  return parts.join("");
}
function campaignMiniTable(visitors) {
  var rows = church().campaigns.map(function (c) {
    var cv = visitors.filter(function (v) { return v.campaignId === c.id; });
    return { campaign: c, count: cv.length, return: returnStats(cv) };
  }).filter(function (r) { return r.count > 0; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);
  if (!rows.length) return empty("No attributable visits", "Try another period.");
  return '<div class="table-wrap"><table><thead><tr><th>Campaign</th><th>First visits</th><th>30-day return</th><th></th></tr></thead><tbody>'
    + rows.map(function (r) { return '<tr><td class="cell-name">' + esc(r.campaign.name) + '<span class="cell-sub">' + esc(r.campaign.channel) + '</span></td><td>' + r.count + '</td><td>' + rateLabel(r.return) + '</td><td><button class="action-link" data-action="choose-campaign" data-id="' + esc(r.campaign.id) + '">Explore →</button></td></tr>'; }).join("")
    + '</tbody></table></div>';
}
function campaignRows() {
  return campaignsInRange().filter(function (c) { return state.channel === "all" || c.channel === state.channel; }).filter(function (c) {
    return c.name.toLowerCase().indexOf(state.search.toLowerCase()) !== -1;
  }).sort(function (a, b) { return b.date.localeCompare(a.date); });
}
function campaignsPage() {
  var rows = campaignRows();
  var v = visitorsInRange(), all = campaignsInRange(), reached = all.reduce(function (n, c) { return n + Number(c.reach || 0); }, 0), ret = returnStats(v);
  var html = pageTitle("OUTREACH / " + church().name, "Outreach campaigns",
    'Record initiatives, trace first visits back to their reported source and compare observable return engagement.',
    rangeSelect() + '<button class="btn primary" type="button" data-action="open-campaign">' + icon("plus") + ' New campaign</button>');
  html += '<div class="metrics">' + metric("Campaigns", num(all.length), "Started in the selected period")
    + metric("Estimated reach", num(reached), "May contain repeat encounters; not unique people")
    + metric("First visits", num(v.length), "Attributed to campaigns across the selected period")
    + metric("30-day return", pct(ret.rate), ret.mature ? ret.returned + " of " + ret.mature + " mature first visits" : "No eligible 30-day cohort", "good") + '</div>';
  html += '<section class="panel"><div class="panel-title"><div><h2>Campaign register</h2><p>Choose a campaign for its observed visitor journey.</p></div><button type="button" data-action="export-campaigns">Export CSV ↓</button></div>';
  html += '<div class="table-tools"><label class="sr-only" for="campaign-search">Search campaigns</label><input id="campaign-search" class="input" placeholder="Search campaigns..." value="' + esc(state.search) + '"/>'
    + '<label class="sr-only" for="channel-filter">Filter by channel</label><select id="channel-filter" class="select">'
    + channels().map(function (x) { return '<option value="' + esc(x) + '" ' + (state.channel === x ? 'selected' : '') + '>' + (x === "all" ? "All channels" : esc(x)) + '</option>'; }).join("")
    + '</select></div>';
  if (!rows.length) html += empty("No campaigns match", "Try another filter or create an outreach campaign.", button("New campaign", "open-campaign", "primary"));
  else html += '<div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Est. reach</th><th>First visits</th><th>30-day return</th><th></th></tr></thead><tbody>'
    + rows.map(function (c) {
      var cv = v.filter(function (x) { return x.campaignId === c.id; }), r = returnStats(cv);
      return '<tr><td class="cell-name">' + esc(c.name) + '<span class="cell-sub">' + esc(c.channel) + ' · ' + friendly(c.date) + '</span></td>'
        + '<td>' + num(c.reach) + '</td><td><strong>' + cv.length + '</strong></td><td>' + rateLabel(r) + '</td>'
        + '<td><button class="action-link" data-action="choose-campaign" data-id="' + esc(c.id) + '">Details →</button></td></tr>';
    }).join("") + '</tbody></table></div>';
  html += '</section>';
  var selected = rows.find(function (x) { return x.id === state.selectedCampaign; }) || rows[0];
  if (selected) {
    var sv = v.filter(function (x) { return x.campaignId === selected.id; });
    var sr = returnStats(sv), completedIds = new Set(church().tasks.filter(function (t) { return t.done; }).map(function (t) { return t.visitorId; }));
    var follow = sv.filter(function (x) { return completedIds.has(x.id); }).length;
    html += '<section class="campaign-detail" id="campaign-detail"><div class="detail-head"><div><span class="kicker">CAMPAIGN DETAILS</span><h3>' + esc(selected.name) + '</h3><div class="support-note">' + esc(selected.channel) + ' · Began ' + friendly(selected.date) + ' · Illustrative spend ' + money(selected.spend) + '</div></div>'
      + '<button class="btn small-action" type="button" data-action="open-visit" data-campaign="' + esc(selected.id) + '">' + icon("plus") + ' Record first visit</button></div>'
      + '<div class="detail-stats">'
      + '<div class="detail-stat"><strong>' + num(selected.reach) + '</strong><span>Estimated encounters</span></div>'
      + '<div class="detail-stat"><strong>' + sv.length + '</strong><span>Source-attributed first visits</span></div>'
      + '<div class="detail-stat"><strong>' + follow + '</strong><span>Visitors with completed follow-up</span></div>'
      + '<div class="detail-stat"><strong>' + (sr.mature ? num(sr.returned) : "—") + '</strong><span>Returned in 30 days (eligible)</span></div>'
      + '<div class="detail-stat"><strong>' + (sr.mature ? pct(sr.rate) : "—") + '</strong><span>30-day return rate</span></div>'
      + '<div class="detail-stat"><strong>' + sr.mature + '</strong><span>Visits with a full 30-day window</span></div></div>'
      + '<p class="support-note">Attribution is a recorded visitor source, not causal proof. Return rate excludes visits that have not yet reached 30 days. Outreach “reach” may include repeat encounters.</p></section>';
  }
  return html;
}
function selectedVisitors() {
  var vs = visitorsInRange().filter(function (v) {
    var camp = getCampaign(v.campaignId);
    var hay = v.id + " " + (camp ? camp.name : "");
    if (hay.toLowerCase().indexOf(state.search.toLowerCase()) === -1) return false;
    if (state.visitorStatus === "returned") return Boolean(v.returnVisit);
    if (state.visitorStatus === "awaiting") return !v.returnVisit;
    if (state.visitorStatus === "pending") return tasksForVisitor(v.id).some(function (t) { return !t.done; });
    return true;
  });
  return vs.sort(function (a, b) { return b.firstVisit.localeCompare(a.firstVisit); });
}
function visitorPage() {
  var v = visitorsInRange(), returned = v.filter(function (x) { return Boolean(x.returnVisit); }).length;
  var pending = v.filter(function (x) { return tasksForVisitor(x.id).some(function (t) { return !t.done; }); }).length;
  var r = returnStats(v);
  var html = pageTitle("FIRST VISIT / " + church().name, "Visitor journeys",
    'Pseudonymous first-visit records with outreach source, return activity and follow-up next steps.',
    rangeSelect() + '<button class="btn" type="button" data-action="open-return">Record a return</button><button class="btn primary" type="button" data-action="open-visit">' + icon("plus") + ' First visit</button>');
  html += '<div class="notice"><strong>Privacy-first demonstration.</strong> Only fictional visitor IDs are used. Do not enter actual names, contact information, religious beliefs or other personal details.</div>';
  html += '<div class="metrics">' + metric("First visits", num(v.length), "In the selected period")
    + metric("Returns recorded", num(returned), "At any recorded date after a first visit")
    + metric("30-day return", pct(r.rate), r.mature ? r.returned + " of " + r.mature + " eligible for 30 days" : "Maturity window not yet reached")
    + metric("With open follow-ups", num(pending), "A task is planned and not yet completed") + '</div>';
  var rows = selectedVisitors();
  html += '<section class="panel"><div class="panel-title"><div><h2>First-visit register</h2><p>Recorded sources, not proof that a campaign caused a visit.</p></div><button type="button" data-action="export-visitors">Export CSV ↓</button></div>';
  html += '<div class="table-tools"><label class="sr-only" for="visitor-search">Search visitors</label><input class="input" id="visitor-search" value="' + esc(state.search) + '" placeholder="Search visitor ID or campaign..."/>'
    + '<label class="sr-only" for="visitor-filter">Visitor status</label><select id="visitor-filter" class="select">'
    + [["all", "All visitors"], ["awaiting", "Awaiting return"], ["returned", "Return recorded"], ["pending", "Open follow-up"]].map(function (x) { return '<option value="' + x[0] + '" ' + (state.visitorStatus === x[0] ? "selected" : "") + '>' + x[1] + '</option>'; }).join("")
    + '</select></div>';
  if (!rows.length) html += empty("No visitors match", "Try another date range, change filters or record a first visit.");
  else html += '<div class="table-wrap"><table><thead><tr><th>Visitor ID</th><th>Outreach source</th><th>First visit</th><th>Return</th><th>Follow-up</th><th>Next step</th></tr></thead><tbody>'
    + rows.map(function (v) {
      var c = getCampaign(v.campaignId), tasks = tasksForVisitor(v.id), open = tasks.filter(function (t) { return !t.done; }).length;
      return '<tr><td class="cell-name">' + esc(v.id) + '</td><td>' + esc(c ? c.name : "Unknown") + '</td><td>' + friendly(v.firstVisit) + '</td><td>'
        + (v.returnVisit ? tag("Returned " + shortDay(v.returnVisit)) : tag("No return recorded", "gray")) + '</td><td>'
        + (open ? tag(open + " open task" + (open !== 1 ? "s" : ""), "warn") : tasks.length ? tag("No open tasks") : tag("Not assigned", "gray")) + '</td><td>'
        + (!v.returnVisit ? '<button class="action-link" data-action="open-return" data-visitor="' + esc(v.id) + '">Record return</button>' : '<button class="action-link" data-action="open-task" data-visitor="' + esc(v.id) + '">Plan follow-up</button>') + '</td></tr>';
    }).join("") + '</tbody></table></div>';
  html += '</section><p class="support-note">A return is a separate recorded service visit. A visitor may return without a completed follow-up, or receive follow-up without returning.</p>';
  return html;
}
function taskRows() {
  return church().tasks.filter(function (t) {
    if (state.taskStatus === "open") return !t.done;
    if (state.taskStatus === "overdue") return !t.done && daysBetween(TODAY, t.due) > 0;
    if (state.taskStatus === "done") return t.done;
    return true;
  }).sort(function (a, b) { if (a.done !== b.done) return a.done ? 1 : -1; return a.due.localeCompare(b.due); });
}
function tasksPage() {
  var tasks = church().tasks, open = openTasks(), overdue = overdueTasks(), completed = tasks.filter(function (t) { return t.done; });
  var html = pageTitle("PEOPLE FIRST / " + church().name, "Follow-up queue",
    'Keep simple next steps visible. Recording a completion updates visitor and overview statistics.',
    '<button class="btn primary" type="button" data-action="open-task">' + icon("plus") + ' New follow-up</button>');
  html += '<div class="metrics">' + metric("All tasks", num(tasks.length), "In this church workspace")
    + metric("Open", num(open.length), "Still need a next step")
    + metric("Overdue", num(overdue.length), "Due before " + friendly(TODAY))
    + metric("Completed", num(completed.length), "Marked done in this sample") + '</div>';
  html += '<section class="panel"><div class="panel-title"><div><h2>Care team worklist</h2><p>Completing a task records follow-up activity, not a guarantee of engagement.</p></div></div>'
    + '<div class="table-tools stage-filter">'
    + [["all", "All tasks"], ["open", "Open"], ["overdue", "Overdue"], ["done", "Completed"]].map(function (x) {
      return '<button type="button" class="filter-pill ' + (state.taskStatus === x[0] ? "active" : "") + '" data-action="filter-task" data-value="' + x[0] + '">' + x[1] + '</button>';
    }).join("") + '</div>';
  var rows = taskRows();
  if (!rows.length) html += empty("Nothing in this filter", "Change your view or add a follow-up task.", button("New follow-up", "open-task", "primary"));
  else html += '<div class="task-list">' + rows.map(function (t) {
    var overdue = !t.done && daysBetween(TODAY, t.due) > 0;
    return '<div class="task-row">'
      + '<button type="button" class="task-check ' + (t.done ? 'done' : '') + '" data-action="' + (t.done ? 'no-op' : 'complete-task') + '" data-id="' + esc(t.id) + '" aria-label="' + (t.done ? 'Task completed' : 'Mark task complete') + '" ' + (t.done ? 'disabled' : '') + '>' + (t.done ? icon("check") : '<span style="width:15px;height:15px;border:2px solid #b4c9bd;border-radius:4px"></span>') + '</button>'
      + '<div class="task-info"><strong class="' + (t.done ? 'task-complete' : '') + '">' + esc(t.kind) + '</strong><small>' + esc(t.visitorId) + ' · ' + esc(t.owner) + ' · Due ' + friendly(t.due) + '</small></div>'
      + '<div class="task-meta">' + (t.done ? tag("Done") : overdue ? tag("Overdue", "red") : tag("Open", "warn")) + '</div></div>';
  }).join("") + '</div>';
  html += '</section><div class="inline-alert">Demo reminder: This queue does not call, email or message anyone. Real visitor contact requires appropriate consent and secure permissions.</div>';
  return html;
}
function view() {
  return state.page === "campaigns" ? campaignsPage() : state.page === "visitors" ? visitorPage() : state.page === "followups" ? tasksPage() : overview();
}
function formField(label, name, kind, extra, full) {
  var attrs = 'name="' + name + '" id="field-' + name + '" class="field-input" ' + (extra || "");
  return '<div class="field ' + (full ? 'full' : '') + '"><label for="field-' + name + '">' + label + '</label>'
    + (kind.indexOf("<select") === 0 ? kind : '<input type="' + kind + '" ' + attrs + '>')
    + '</div>';
}
function campaignOptions(selected) {
  return church().campaigns.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (c) {
    return '<option value="' + esc(c.id) + '" ' + (selected === c.id ? 'selected' : '') + '>' + esc(c.name) + ' · ' + shortDay(c.date) + '</option>';
  }).join("");
}
function visitorOptions(selected, onlyAwaiting) {
  var options = church().visitors.filter(function (v) { return !onlyAwaiting || !v.returnVisit; }).sort(function (a, b) { return b.firstVisit.localeCompare(a.firstVisit); });
  return options.map(function (v) {
    return '<option value="' + esc(v.id) + '" ' + (v.id === selected ? 'selected' : '') + '>' + esc(v.id) + ' · ' + shortDay(v.firstVisit) + '</option>';
  }).join("");
}
function selectField(label, name, inner, full) {
  return '<div class="field ' + (full ? "full" : "") + '"><label for="field-' + name + '">' + esc(label) + '</label><select name="' + name + '" id="field-' + name + '" class="field-input" required>' + inner + '</select></div>';
}
function modalMarkup() {
  if (!state.modal) return '';
  var fields = '', title = "", tip = "", ready = true;
  if (state.modal === 'campaign') {
    title = "New outreach campaign";
    tip = "Record a real-world activity using fictional information for this demo.";
    fields = formField("Campaign name", "name", "text", 'maxlength="80" minlength="3" required placeholder="e.g. Neighbourhood welcome"', true)
      + selectField("Outreach channel", "channel", ["Community", "Campus", "Event", "Digital", "Partnership"].map(function (x) { return '<option>' + x + '</option>'; }).join(""))
      + formField("Start date", "date", "date", 'required max="' + TODAY + '" value="' + TODAY + '"')
      + formField("Estimated reach (encounters)", "reach", "number", 'required min="0" max="10000000" value="0"')
      + formField("Illustrative spend (USD)", "spend", "number", 'required min="0" max="10000000" value="0" step="0.01"');
  } else if (state.modal === 'visit') {
    title = "Record a first visit";
    tip = "Each new record gets a generated, pseudonymous visitor ID. No names or contact details.";
    ready = church().campaigns.length > 0;
    fields = ready ? selectField("Reported outreach source", "campaignId", campaignOptions(state.modalCampaign || ""), true)
      + formField("First visit date", "firstVisit", "date", 'required max="' + TODAY + '" value="' + TODAY + '"', true)
      : '<p>Create an outreach campaign before recording a source-attributed first visit.</p>';
  } else if (state.modal === 'return') {
    title = "Record a return visit";
    tip = "Record a return after a visitor's first visit. This updates eligible 30-day cohorts.";
    ready = church().visitors.some(function (x) { return !x.returnVisit; });
    fields = ready ? selectField("Visitor record", "visitorId", visitorOptions(state.modalVisitor, true), true)
      + formField("Date of return", "returnVisit", "date", 'required max="' + TODAY + '" value="' + TODAY + '"', true)
      : '<p>Every visitor in this demo already has a recorded return.</p>';
  } else if (state.modal === 'task') {
    title = "Plan a follow-up";
    tip = "Add a fictional care task; nothing is sent to a person.";
    ready = church().visitors.length > 0;
    fields = ready ? selectField("Visitor ID", "visitorId", visitorOptions(state.modalVisitor, false), true)
      + selectField("Next step", "kind", ["Welcome call", "Invite to gathering", "Personal check-in", "Volunteer team introduction", "Pastoral follow-up"].map(function (x) { return '<option>' + x + '</option>'; }).join(""), true)
      + selectField("Assigned team", "owner", ["Welcome team", "Connect team", "Care team", "Outreach team"].map(function (x) { return '<option>' + x + '</option>'; }).join(""))
      + formField("Due date", "due", "date", 'required value="' + addDays(TODAY, 2) + '"')
      : '<p>Record a visitor before assigning a follow-up.</p>';
  }
  return '<div class="modal-layer" data-action="close-modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading">'
    + '<div class="modal-head"><div><span class="kicker">DEMO WORKFLOW</span><h2 id="modal-heading">' + esc(title) + '</h2></div><button type="button" class="close" aria-label="Close dialog" data-action="close-modal">×</button></div>'
    + '<p style="font-size:12px;color:#7b9090;margin-bottom:22px">' + tip + '</p>'
    + '<form id="mvp-form" data-form="' + state.modal + '" novalidate><div class="form-grid">' + fields
    + '<div class="form-error" id="form-error" role="alert"></div></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button>'
    + (ready ? '<button type="submit" class="btn primary">Save to demo ' + icon("arrow") + '</button>' : '') + '</div></form></div></div>';
}
function render() {
  document.getElementById("app").innerHTML = appShell();
  if (state.modal) { var input = document.querySelector(".modal .field-input"); if (input) input.focus(); }
}
function toast(message) {
  var root = document.getElementById("toasts"), item = document.createElement("div"); item.className = "toast"; item.setAttribute("role", "status"); item.textContent = message; root.appendChild(item);
  setTimeout(function () { if (item.isConnected) item.remove(); }, 3700);
}
function go(page) {
  state.page = normalizePage("#/" + page);
  state.drawer = false; state.modal = ""; state.search = ""; state.channel = "all"; state.visitorStatus = "all"; state.taskStatus = "all";
  if (location.hash !== "#/" + state.page) location.hash = "/" + state.page;
  render();
  window.scrollTo({ top: 0, behavior: "auto" });
}
function openModal(name, visitorId, campaignId) {
  state.modal = name; state.modalVisitor = visitorId || ""; state.modalCampaign = campaignId || "";
  render();
}
function errorForm(message) { var el = document.getElementById("form-error"); if (el) { el.textContent = message; el.classList.add("visible"); } }
function validAmount(value) { return value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 10000000; }
function submitDemo(form) {
  var kind = form.getAttribute("data-form"), data = new FormData(form);
  if (kind === "campaign") {
    var name = String(data.get("name") || "").trim(), date = String(data.get("date") || ""), channel = String(data.get("channel") || "");
    var reach = String(data.get("reach") || ""), spend = String(data.get("spend") || "");
    if (name.length < 3 || name.length > 80) return errorForm("Enter a descriptive campaign name (3–80 characters).");
    if (!validDate(date) || daysBetween(date, TODAY) > 0) return errorForm("Choose a valid campaign date no later than the demo date.");
    if (!validAmount(reach) || !validAmount(spend)) return errorForm("Reach and spending must be valid non-negative numbers.");
    church().campaigns.push({ id: makeId("c"), name: name, date: date, channel: channel, reach: Math.floor(Number(reach)), spend: Number(spend) });
    state.modal = ""; state.range = "all"; save(); go("campaigns"); return toast("Campaign saved. Record its first visits next.");
  }
  if (kind === "visit") {
    var cid = String(data.get("campaignId") || ""), camp = getCampaign(cid), first = String(data.get("firstVisit") || "");
    if (!camp) return errorForm("Select a campaign.");
    if (!validDate(first) || daysBetween(first, camp.date) < 0 || daysBetween(first, TODAY) > 0) return errorForm("First visit must be on or after the campaign start, and no later than " + friendly(TODAY) + ".");
    var visitor = { id: makeId("V").toUpperCase(), campaignId: cid, firstVisit: first, returnVisit: null };
    church().visitors.push(visitor);
    state.modal = ""; state.range = "all"; save(); go("visitors"); return toast(visitor.id + " added. Plan a follow-up or record a return.");
  }
  if (kind === "return") {
    var vid = String(data.get("visitorId") || ""), v = getVisitor(vid), dateReturn = String(data.get("returnVisit") || "");
    if (!v || v.returnVisit) return errorForm("Choose a visitor without a recorded return.");
    if (!validDate(dateReturn) || daysBetween(dateReturn, v.firstVisit) < 0 || daysBetween(dateReturn, TODAY) > 0) return errorForm("The return must be after the first visit and no later than " + friendly(TODAY) + ".");
    v.returnVisit = dateReturn;
    state.modal = ""; state.range = "all"; save(); go("visitors"); return toast("Return visit recorded. The engagement metrics have updated.");
  }
  if (kind === "task") {
    var visitorId = String(data.get("visitorId") || ""), who = getVisitor(visitorId), due = String(data.get("due") || "");
    if (!who) return errorForm("Choose a visitor from this church.");
    if (!validDate(due)) return errorForm("Please choose a valid due date.");
    church().tasks.push({ id: makeId("t"), visitorId: who.id, kind: String(data.get("kind") || "Welcome call"), owner: String(data.get("owner") || "Welcome team"), due: due, done: false, completedAt: null });
    state.modal = ""; save(); go("followups"); return toast("Follow-up added to the care queue.");
  }
}
function csvCell(s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }
function downloadCSV(filename, headers, rows) {
  var csv = [headers.map(csvCell).join(",")].concat(rows.map(function (r) { return r.map(csvCell).join(","); })).join("\r\n");
  var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  var a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  toast("Fictional demo data exported as CSV.");
}
document.addEventListener("click", function (event) {
  var el = event.target.closest("[data-action],[data-go]");
  if (!el) return;
  if (el.hasAttribute("data-go")) { event.preventDefault(); return go(el.getAttribute("data-go")); }
  var act = el.getAttribute("data-action");
  if (act === "toggle-drawer") { state.drawer = !state.drawer; return render(); }
  if (act === "close-drawer") { state.drawer = false; return render(); }
  if (act === "reset") {
    if (window.confirm("Reset all fictional demo records back to the original sample?")) {
      store = clone(fixture); state.range = "all"; state.search = ""; state.selectedCampaign = ""; state.modal = ""; save(); render(); toast("Fictional demo data reset.");
    }
    return;
  }
  if (act === "choose-campaign") { state.selectedCampaign = el.dataset.id; return go("campaigns"); }
  if (act === "open-campaign") return openModal("campaign");
  if (act === "open-visit") return openModal("visit", "", el.dataset.campaign || "");
  if (act === "open-return") return openModal("return", el.dataset.visitor || "");
  if (act === "open-task") return openModal("task", el.dataset.visitor || "");
  if (act === "close-modal") { state.modal = ""; return render(); }
  if (act === "close-modal-backdrop" && el === event.target) { state.modal = ""; return render(); }
  if (act === "complete-task") {
    var task = church().tasks.find(function (t) { return t.id === el.dataset.id; });
    if (task && !task.done) { task.done = true; task.completedAt = TODAY; save(); render(); toast("Follow-up completed. The overview has updated."); }
    return;
  }
  if (act === "filter-task") { state.taskStatus = el.dataset.value; return render(); }
  if (act === "export-campaigns") {
    var visits = visitorsInRange();
    return downloadCSV(state.tenant + "-campaigns-demo.csv", ["Campaign", "Channel", "Start date", "Estimated reach", "Spending (USD)", "Attributed first visits", "30d eligible", "30d returns"],
      campaignRows().map(function (c) { var v = visits.filter(function (x) { return x.campaignId === c.id; }), r = returnStats(v); return [c.name, c.channel, c.date, c.reach, c.spend, v.length, r.mature, r.returned]; }));
  }
  if (act === "export-visitors") {
    return downloadCSV(state.tenant + "-visitors-demo.csv", ["Visitor ID", "Campaign", "First visit", "Return visit", "Open follow-up tasks"],
      selectedVisitors().map(function (v) { var c = getCampaign(v.campaignId); return [v.id, c ? c.name : "", v.firstVisit, v.returnVisit || "", tasksForVisitor(v.id).filter(function (t) { return !t.done; }).length]; }));
  }
});
document.addEventListener("change", function (event) {
  if (event.target.id === "church-select") {
    state.tenant = event.target.value in store ? event.target.value : "riverside";
    state.selectedCampaign = ""; state.search = ""; state.channel = "all"; state.visitorStatus = "all"; state.taskStatus = "all";
    render(); toast("Switched to " + church().name + " — separate fictional sample data."); return;
  }
  if (event.target.id === "range") { state.range = event.target.value; state.selectedCampaign = ""; return render(); }
  if (event.target.id === "channel-filter") { state.channel = event.target.value; return render(); }
  if (event.target.id === "visitor-filter") { state.visitorStatus = event.target.value; return render(); }
});
document.addEventListener("input", function (event) {
  if (event.target.id !== "campaign-search" && event.target.id !== "visitor-search") return;
  var id = event.target.id, start = event.target.selectionStart, end = event.target.selectionEnd;
  state.search = event.target.value;
  render();
  var field = document.getElementById(id);
  if (field) { field.focus(); try { field.setSelectionRange(start, end); } catch (_) {} }
});
document.addEventListener("submit", function (event) {
  if (event.target.id === "mvp-form") { event.preventDefault(); submitDemo(event.target); }
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") { if (state.modal) { state.modal = ""; render(); } else if (state.drawer) { state.drawer = false; render(); } }
});
window.addEventListener("hashchange", function () {
  var n = normalizePage(location.hash);
  if (n !== state.page) go(n);
});
render();
})();
/**
 * Meta Marketing API → スプレッドシート「広告分析シート」 日次自動集計
 *
 * 粒度: 日 × 広告キャンペーン
 * 取得指標: 消化金額 / インプ数 / クリック数 / クリック単価 / CTR / CPM /
 *           結果ページ到達(鍵) / 第1リード / コンテンツビュー / リード数 / 予約カレンダー設定数
 *
 * 月別タブ: Meta_LP01_YYYY-MM / Meta_LP02_YYYY-MM / Meta_LP03_YYYY-MM / Meta_LP04_YYYY-MM
 *   - LP02: 鍵到達 → 第1リード → CV → リード → 予約 のフル ファネル
 *   - LP01 / LP03 / LP04: コンテンツビュー → リード → 予約 のシンプル ファネル
 *   - LP04 の「結果ページ到達(鍵)」は GA4 /lp04/preview/ ユニーク。
 *     LP04 タブは「LINE_CTAクリック」(Meta カスタムCV LP04_LINE登録) を独立指標で表示し、
 *     リード数・予約数は手入力 (LINE 経由で UTM が切れ自動集計できないため)。
 *
 * 認証情報 (META_TOKEN / META_AD_ACCOUNT_ID) は「スクリプトプロパティ」に保存し、
 * このコードには絶対に直書きしないこと。
 */

const SHEET_NAME = 'Rawデータ';
const LEGACY_SHEET_NAME = '広告分析シート';
const API_VERSION = 'v21.0';

const LOOKBACK_DAYS = 15;

const TZ = 'Asia/Tokyo';

// Meta カスタムコンバージョン ID (スクリプトプロパティで上書き可)
//   CC_FIRST_LEAD            = LP02_第1リード (LP02SoftLead 由来)
//   CC_PREVIEW_REACH         = LP02_プレビュー到達 (LP02PreviewView 由来)
//   CC_LP03_LANDING          = LP03_LP本体着地 (ViewContent 由来)
//   CC_LP04_LINE_REGISTER    = LP04_LINE登録 (ViewContent 由来、要 Events Manager で作成)
const CC_FIRST_LEAD =
  PropertiesService.getScriptProperties().getProperty('CC_FIRST_LEAD') || '2041508596437621';
const CC_PREVIEW_REACH =
  PropertiesService.getScriptProperties().getProperty('CC_PREVIEW_REACH') || '1339056921523036';
const CC_LP03_LANDING =
  PropertiesService.getScriptProperties().getProperty('CC_LP03_LANDING') || '';
const CC_LP04_LINE_REGISTER =
  PropertiesService.getScriptProperties().getProperty('CC_LP04_LINE_REGISTER') || '';
const CC_LP05_LINE_REGISTER =
  PropertiesService.getScriptProperties().getProperty('CC_LP05_LINE_REGISTER') || '';
const CC_LP06_LINE_REGISTER =
  PropertiesService.getScriptProperties().getProperty('CC_LP06_LINE_REGISTER') || '';

const HEADERS = [
  '日付',
  'キャンペーン名',
  '消化金額',
  'インプ数',
  'クリック数',
  'クリック単価',
  'CTR(%)',
  'CPM',
  '結果ページ到達(鍵)', // LP02_鍵到達 + LP03_LP本体着地 の合算 (GA4 でも上書き)
  '第1リード',
  'コンテンツビュー',
  'リード数',
  '予約カレンダー設定数',
  'LINE_CTAクリック', // LP04 鍵ページ CTA クリック (Meta カスタムCV「LP04_LINE登録」由来)
];

/**
 * キャンペーン名から LP バージョンを判定する。
 *   "lp06" を含む  → 'lp06'
 *   "lp05" を含む  → 'lp05'
 *   "lp04" を含む  → 'lp04'
 *   "lp03" を含む  → 'lp03'
 *   "lp01" を含む  → 'lp01'
 *   上記以外       → 'lp02' (現在の主力配信、デフォルト)
 * 大文字小文字区別なし。命名規則で LP プレフィックスを徹底する運用前提。
 */
function detectLP_(campaignName) {
  const n = String(campaignName || '').toLowerCase();
  if (n.indexOf('lp06') !== -1) return 'lp06';
  if (n.indexOf('lp05') !== -1) return 'lp05';
  if (n.indexOf('lp04') !== -1) return 'lp04';
  if (n.indexOf('lp03') !== -1) return 'lp03';
  if (n.indexOf('lp01') !== -1) return 'lp01';
  return 'lp02';
}

/**
 * メイン: 毎朝のトリガーから呼ばれる。
 * 過去 LOOKBACK_DAYS 日 〜 前日分を取得して upsert する。
 */
function fetchMetaInsightsDaily() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('META_TOKEN');
  const accountId = props.getProperty('META_AD_ACCOUNT_ID');

  if (!token || !accountId) {
    throw new Error('スクリプトプロパティ META_TOKEN / META_AD_ACCOUNT_ID が未設定です');
  }

  const since = Utilities.formatDate(
    new Date(Date.now() - LOOKBACK_DAYS * 86400000), TZ, 'yyyy-MM-dd');
  const until = Utilities.formatDate(
    new Date(Date.now() - 86400000), TZ, 'yyyy-MM-dd');

  const fields = [
    'campaign_name', 'spend', 'impressions', 'clicks',
    'cpc', 'ctr', 'cpm', 'actions',
  ].join(',');

  const timeRange = JSON.stringify({ since: since, until: until });

  let url = 'https://graph.facebook.com/' + API_VERSION + '/' + accountId + '/insights'
    + '?level=campaign'
    + '&time_increment=1'
    + '&time_range=' + encodeURIComponent(timeRange)
    + '&fields=' + fields
    + '&limit=500'
    + '&access_token=' + encodeURIComponent(token);

  const rows = [];
  while (url) {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      throw new Error('Meta API エラー (' + res.getResponseCode() + '): ' + res.getContentText());
    }
    const json = JSON.parse(res.getContentText());
    (json.data || []).forEach(function (d) { rows.push(buildRow(d)); });
    url = (json.paging && json.paging.next) ? json.paging.next : null;
  }

  upsertRows(rows);
  overlayFunnelFromLog();
  overlayReachFromGA4();
  sortAdSheetByDate();
  rebuildMonthlyTabs();
  Logger.log(since + '〜' + until + ' を ' + rows.length + ' 行 upsert しました');
}

function sortAdSheetByDate() {
  const sheet = getTargetSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 3) return;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length)
    .sort([{ column: 1, ascending: true }, { column: 2, ascending: true }]);
}

function renameLegacySheet() {
  const ss = getTargetSpreadsheet();
  if (ss.getSheetByName(SHEET_NAME)) {
    Logger.log('「' + SHEET_NAME + '」は既に存在します。リネーム不要。');
    return;
  }
  const legacy = ss.getSheetByName(LEGACY_SHEET_NAME);
  if (!legacy) {
    Logger.log('旧「' + LEGACY_SHEET_NAME + '」タブが見つかりません。');
    return;
  }
  legacy.setName(SHEET_NAME);
  Logger.log('「' + LEGACY_SHEET_NAME + '」→「' + SHEET_NAME + '」にリネームしました。');
}

// =============================================================================
// 月別「Meta_LP{XX}_YYYY-MM」集計タブの生成
// =============================================================================

function safeDiv_(a, b) { return b > 0 ? a / b : null; }

/**
 * LP02 用の指標テンプレート (フル ファネル)。
 * 鍵ページ・第1リード段がある LP02 向け。
 */
const METRIC_ROWS_LP02 = [
  { label: '広告費(税抜)',        type: 'yen', calc: function (a) { return a.spend; } },
  { label: '結果ページ到達(鍵)',   type: 'int', calc: function (a) { return a.reach; } },
  { label: '　到達単価',           type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.reach); } },
  { label: '　到達率',             type: 'pct', calc: function (a) { return safeDiv_(a.reach, a.clicks); } },
  { label: '第1リード',           type: 'int', calc: function (a) { return a.firstLead; } },
  { label: '　第1リード単価',      type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.firstLead); } },
  { label: '　第1リード率',        type: 'pct', calc: function (a) { return safeDiv_(a.firstLead, a.reach); } },
  { label: 'コンテンツビュー',     type: 'int', calc: function (a) { return a.cv; } },
  { label: '　CV単価',            type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.cv); } },
  { label: '　CV率',              type: 'pct', calc: function (a) { return safeDiv_(a.cv, a.firstLead); } },
  { label: 'リード数',            type: 'int', calc: function (a) { return a.leads; } },
  { label: '　リード単価',         type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.leads); } },
  { label: '　リード率',           type: 'pct', calc: function (a) { return safeDiv_(a.leads, a.cv); } },
  { bookingMarker: true },
  { label: 'imp数',              type: 'int', calc: function (a) { return a.imp; } },
  { label: 'リンククリック数',     type: 'int', calc: function (a) { return a.clicks; } },
  { label: 'CTR',                type: 'pct', calc: function (a) { return safeDiv_(a.clicks, a.imp); } },
  { label: 'CPC',                type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.clicks); } },
  { label: 'CPM',                type: 'yen', calc: function (a) { return a.imp > 0 ? (a.spend / a.imp) * 1000 : null; } },
];

/**
 * LP01 / LP03 / LP04 用の指標テンプレート (シンプル ファネル)。
 * 鍵ページ・第1リード段がない LP 向け。CV率の母数はクリック数。
 */
const METRIC_ROWS_SIMPLE = [
  { label: '広告費(税抜)',     type: 'yen', calc: function (a) { return a.spend; } },
  { label: 'コンテンツビュー', type: 'int', calc: function (a) { return a.cv; } },
  { label: '　CV単価',         type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.cv); } },
  { label: '　CV率',           type: 'pct', calc: function (a) { return safeDiv_(a.cv, a.clicks); } },
  { label: 'リード数',         type: 'int', calc: function (a) { return a.leads; } },
  { label: '　リード単価',     type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.leads); } },
  { label: '　リード率',       type: 'pct', calc: function (a) { return safeDiv_(a.leads, a.cv); } },
  { bookingMarker: true },
  { label: 'imp数',           type: 'int', calc: function (a) { return a.imp; } },
  { label: 'リンククリック数', type: 'int', calc: function (a) { return a.clicks; } },
  { label: 'CTR',             type: 'pct', calc: function (a) { return safeDiv_(a.clicks, a.imp); } },
  { label: 'CPC',             type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.clicks); } },
  { label: 'CPM',             type: 'yen', calc: function (a) { return a.imp > 0 ? (a.spend / a.imp) * 1000 : null; } },
];

/**
 * LP04 用の指標テンプレート。
 * LINE_CTAクリック (鍵ページ CTA クリック = Meta カスタムCV「LP04_LINE登録」) を独立指標で持つ。
 * リード数・予約数は手入力 (drawBlock の isLp04 分岐で差し替え)。
 *   ファネル: 到達(コンテンツビュー) → LINE_CTAクリック → リード(手入力) → 予約(手入力)
 * ※ LINE_CTAクリックは「CTAボタンのクリック数(Meta帰属分)」で、実際の友だち追加数とは一致しない。
 */
const METRIC_ROWS_LP04 = [
  { label: '広告費(税抜)',       type: 'yen', calc: function (a) { return a.spend; } },
  { label: 'コンテンツビュー',   type: 'int', calc: function (a) { return a.cv; } },
  { label: '　CV単価',           type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.cv); } },
  { label: '　CV率',             type: 'pct', calc: function (a) { return safeDiv_(a.cv, a.clicks); } },
  { label: 'LINE_CTAクリック',   type: 'int', calc: function (a) { return a.ctaClick; } },
  { label: '　CTA単価',          type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.ctaClick); } },
  { label: '　CTA率',            type: 'pct', calc: function (a) { return safeDiv_(a.ctaClick, a.cv); } },
  { label: 'リード数',           type: 'int', calc: function (a) { return a.leads; } },
  { label: '　リード単価',       type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.leads); } },
  { label: '　リード率',         type: 'pct', calc: function (a) { return safeDiv_(a.leads, a.ctaClick); } },
  { bookingMarker: true },
  { label: 'imp数',             type: 'int', calc: function (a) { return a.imp; } },
  { label: 'リンククリック数',   type: 'int', calc: function (a) { return a.clicks; } },
  { label: 'CTR',               type: 'pct', calc: function (a) { return safeDiv_(a.clicks, a.imp); } },
  { label: 'CPC',               type: 'yen', calc: function (a) { return safeDiv_(a.spend, a.clicks); } },
  { label: 'CPM',               type: 'yen', calc: function (a) { return a.imp > 0 ? (a.spend / a.imp) * 1000 : null; } },
];

const BOLD_LABELS = [
  '　到達単価', '　到達率',
  '　第1リード単価', '　第1リード率',
  '　リード単価', '　リード率',
  '　CTA単価', '　CTA率',
  '　予約単価(CPA)', '　予約率',
];

function numFmt_(type) {
  if (type === 'yen') return '¥#,##0';
  if (type === 'pct') return '0.0%';
  return '#,##0';
}

function readRawRows_() {
  const sheet = getTargetSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
  return vals.map(function (r) {
    return {
      date: keyDate(r[0]),
      campaign: String(r[1]).trim(),
      spend: Number(r[2]) || 0,
      imp: Number(r[3]) || 0,
      clicks: Number(r[4]) || 0,
      reach: Number(r[8]) || 0,
      firstLead: Number(r[9]) || 0,
      cv: Number(r[10]) || 0,
      leads: Number(r[11]) || 0,
      bookings: Number(r[12]) || 0,
      ctaClick: Number(r[13]) || 0, // LINE_CTAクリック (LP04)
    };
  });
}

function aggregateBase_(rows) {
  const a = { spend: 0, imp: 0, clicks: 0, reach: 0, firstLead: 0, cv: 0, leads: 0, bookings: 0, ctaClick: 0 };
  rows.forEach(function (r) {
    a.spend += r.spend; a.imp += r.imp; a.clicks += r.clicks; a.reach += r.reach;
    a.firstLead += r.firstLead; a.cv += r.cv; a.leads += r.leads; a.bookings += r.bookings;
    a.ctaClick += r.ctaClick;
  });
  return a;
}

function dateRangeList_(start, end) {
  const sp = start.split('-'), ep = end.split('-');
  const t = new Date(Number(sp[0]), Number(sp[1]) - 1, Number(sp[2]));
  const last = new Date(Number(ep[0]), Number(ep[1]) - 1, Number(ep[2]));
  const out = [];
  while (t <= last) {
    out.push(t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2));
    t.setDate(t.getDate() + 1);
  }
  return out;
}

function colLetter_(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function dateHeaderLabel_(d) {
  const p = d.split('-');
  const dt = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  const dow = '日月火水木金土'.charAt(dt.getDay());
  return Number(p[1]) + '/' + Number(p[2]) + '\n(' + dow + ')';
}

/** Rawデータの全月 × 全 LP について Meta_LP{XX}_YYYY-MM タブを作り直す */
function rebuildMonthlyTabs() {
  const raw = readRawRows_();
  if (!raw.length) {
    Logger.log('Rawデータが空のため月別タブ生成をスキップ');
    return;
  }
  const byMonthLp = {};
  raw.forEach(function (r) {
    const ym = r.date.slice(0, 7);
    const lp = detectLP_(r.campaign);
    if (!byMonthLp[ym]) byMonthLp[ym] = {};
    (byMonthLp[ym][lp] = byMonthLp[ym][lp] || []).push(r);
  });
  Object.keys(byMonthLp).sort().forEach(function (ym) {
    const byLp = byMonthLp[ym];
    Object.keys(byLp).sort().forEach(function (lpKey) {
      buildMonthlyTab_(ym, byLp[lpKey], lpKey);
      Logger.log('Meta_' + lpKey.toUpperCase() + '_' + ym
        + ' を再生成 (' + byLp[lpKey].length + ' 行)');
    });
  });
}

/** 1 か月 × 1 LP ぶんのタブを全消し再生成する */
function buildMonthlyTab_(ym, rowsOfMonth, lpKey) {
  const ss = getTargetSpreadsheet();
  const tabName = 'Meta_' + lpKey.toUpperCase() + '_' + ym;
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) sheet = ss.insertSheet(tabName);

  // LP に応じて指標テンプレを切替 (LP02 = フル / LP01/LP03 = シンプル / LP04・LP05・LP06 = LINE登録型)
  const metricRowsTemplate =
    (lpKey === 'lp02') ? METRIC_ROWS_LP02 :
    (lpKey === 'lp04' || lpKey === 'lp05' || lpKey === 'lp06') ? METRIC_ROWS_LP04 :
    METRIC_ROWS_SIMPLE;
  // LP04/LP05/LP06 は LINE 登録を挟むため UTM が取れず、キャンペーン別にリード/予約を自動集計できない。
  // → これらのタブだけ「リード数」「予約数」を手入力にし、電話で予約は廃止 (導線上ありえない)。
  const isLp04 = (lpKey === 'lp04' || lpKey === 'lp05' || lpKey === 'lp06');

  // 手入力行 (電話で予約 / LP04 のリード数・予約数) を「ラベル||campaign||date」で退避→復元する。
  const savedManual = readExistingManualRows_(sheet, ym, ['電話で予約', 'リード数', '予約数']);
  const savedMemo = readExistingMemo_(sheet);

  const y = Number(ym.slice(0, 4));
  const mo = Number(ym.slice(5, 7));
  const lastDom = new Date(y, mo, 0).getDate();
  const dd = function (n) { return ('0' + n).slice(-2); };
  const dates = dateRangeList_(ym + '-01', ym + '-' + dd(lastDom));
  const nCols = 2 + dates.length;

  const cs = {};
  rowsOfMonth.forEach(function (r) { if (r.campaign) cs[r.campaign] = true; });
  const campaigns = Object.keys(cs).sort();

  const values = [];
  const formats = [];
  let titleRow = 0, headerRow = 0;
  const sectionRows = [], campaignRows = [], metricRows = [];
  let totalPhoneRow = 0;
  const campaignPhoneRows = [];
  const memoRows = [];
  const pausedRanges = [];
  // LP04 手入力対応: 全体合計のリード数/予約数を各CPの手入力合計 (formula) にするため行番号を控える。
  let totalLeadRow = 0, totalBookingRow = 0;
  const campaignLeadRows = [], campaignBookingRows = [];

  function push(arr, fmtArr) {
    while (arr.length < nCols) arr.push('');
    while (fmtArr.length < nCols) fmtArr.push('@');
    values.push(arr);
    formats.push(fmtArr);
    return values.length;
  }
  function fmtAll(fmt) { const a = []; for (let i = 0; i < nCols; i++) a.push(fmt); return a; }
  function cell(v) { return (v === null || v === undefined) ? '' : v; }

  function drawBlock(blockRows, kind, campaignName) {
    const isTotal = kind === 'total';
    const byDate = {};
    dates.forEach(function (d) { byDate[d] = []; });
    blockRows.forEach(function (r) { if (byDate[r.date]) byDate[r.date].push(r); });
    const totalAgg = aggregateBase_(blockRows);
    const dayAgg = dates.map(function (d) { return aggregateBase_(byDate[d]); });
    const rowOf = {};

    function fmtRow(type) {
      return ['@', numFmt_(type)].concat(dates.map(function () { return numFmt_(type); }));
    }

    function drawMetric(m) {
      const row = [m.label, cell(m.calc(totalAgg))]
        .concat(dayAgg.map(function (ag) { return cell(m.calc(ag)); }));
      const rn = push(row, fmtRow(m.type));
      metricRows.push(rn);
      rowOf[m.label] = rn;
      return rn;
    }

    // 列ごとに formula を入れる行 (単価・率)。makeFormula(L) は列記号 L を受け取り formula を返す。
    function drawFormulaRow(label, type, makeFormula) {
      const vals = [label];
      for (let ci = 2; ci <= nCols; ci++) vals.push(makeFormula(colLetter_(ci)));
      const rn = push(vals, fmtRow(type));
      metricRows.push(rn);
      rowOf[label] = rn;
      return rn;
    }

    // 手入力行 (LP04 のリード数/予約数)。退避値 savedManual を「label||CP||date」で復元、月合計(B)=日別SUM。
    // 全体合計 (isTotal) は値を入れず、各CP確定後に formula を流し込むため空で置く。
    function drawManualMetricRow(label, savedKey) {
      const rn = values.length + 1;
      const firstDayCol = colLetter_(3), lastDayCol = colLetter_(nCols);
      let row;
      if (isTotal) {
        row = [label, ''].concat(dates.map(function () { return ''; }));
      } else {
        row = [label, '=SUM(' + firstDayCol + rn + ':' + lastDayCol + rn + ')']
          .concat(dates.map(function (d) {
            const v = savedManual[savedKey + '||' + campaignName + '||' + d];
            return (v === undefined || v === null) ? '' : v;
          }));
      }
      push(row, fmtRow('int'));
      metricRows.push(rn);
      rowOf[label] = rn;
      return rn;
    }

    // LP04 の リード数(手入力) / リード単価 / リード率。単価・率は手入力リード数から再計算。
    function drawLp04LeadTrio() {
      const adRow = rowOf['広告費(税抜)'];
      const denomRow = rowOf['LINE_CTAクリック'] || rowOf['コンテンツビュー']; // リード率の母数
      const leadRow = drawManualMetricRow('リード数', 'リード数');
      if (isTotal) totalLeadRow = leadRow; else campaignLeadRows.push(leadRow);
      drawFormulaRow('　リード単価', 'yen', function (L) {
        return '=IF(' + L + leadRow + '=0,"",' + L + adRow + '/' + L + leadRow + ')';
      });
      drawFormulaRow('　リード率', 'pct', function (L) {
        return '=IF(' + L + denomRow + '=0,"",' + L + leadRow + '/' + L + denomRow + ')';
      });
    }

    // LP04 の予約: 手入力「予約数」1行に一本化 (予約(LP)/電話で予約/予約合計 は出さない)。
    // 予約単価(CPA)=広告費/予約数、予約率=予約数/リード数 (いずれも formula)。
    function drawBookingSegmentLp04() {
      const adRow = rowOf['広告費(税抜)'];
      const leadRow = rowOf['リード数'];
      const bkRow = drawManualMetricRow('予約数', '予約数');
      if (isTotal) totalBookingRow = bkRow; else campaignBookingRows.push(bkRow);
      drawFormulaRow('　予約単価(CPA)', 'yen', function (L) {
        return '=IF(' + L + bkRow + '=0,"",' + L + adRow + '/' + L + bkRow + ')';
      });
      drawFormulaRow('　予約率', 'pct', function (L) {
        return '=IF(' + L + leadRow + '=0,"",' + L + bkRow + '/' + L + leadRow + ')';
      });
    }

    function drawBookingSegment() {
      const adRow = rowOf['広告費(税抜)'];
      const leadRow = rowOf['リード数'];
      const firstDayCol = colLetter_(3);
      const lastDayCol = colLetter_(nCols);

      const lpBookingRow = push(
        ['予約(LP)', cell(totalAgg.bookings)]
          .concat(dayAgg.map(function (ag) { return cell(ag.bookings); })),
        fmtRow('int'));
      metricRows.push(lpBookingRow);

      const phoneRn = values.length + 1;
      let phoneVals;
      if (isTotal) {
        phoneVals = ['電話で予約', ''].concat(dates.map(function () { return ''; }));
      } else {
        phoneVals = ['電話で予約', '=SUM(' + firstDayCol + phoneRn + ':' + lastDayCol + phoneRn + ')']
          .concat(dates.map(function (d) {
            const v = savedManual['電話で予約||' + campaignName + '||' + d];
            return (v === undefined || v === null) ? '' : v;
          }));
      }
      const phoneRow = push(phoneVals, fmtRow('int'));
      metricRows.push(phoneRow);
      if (isTotal) totalPhoneRow = phoneRow; else campaignPhoneRows.push(phoneRow);

      const sumVals = ['予約合計'];
      for (let ci = 2; ci <= nCols; ci++) {
        const L = colLetter_(ci);
        sumVals.push('=' + L + lpBookingRow + '+' + L + phoneRow);
      }
      const sumRow = push(sumVals, fmtRow('int'));
      metricRows.push(sumRow);

      const cpaVals = ['　予約単価(CPA)'];
      for (let ci = 2; ci <= nCols; ci++) {
        const L = colLetter_(ci);
        cpaVals.push('=IF(' + L + sumRow + '=0,"",' + L + adRow + '/' + L + sumRow + ')');
      }
      metricRows.push(push(cpaVals, fmtRow('yen')));

      const rateVals = ['　予約率'];
      for (let ci = 2; ci <= nCols; ci++) {
        const L = colLetter_(ci);
        rateVals.push('=IF(' + L + leadRow + '=0,"",' + L + sumRow + '/' + L + leadRow + ')');
      }
      metricRows.push(push(rateVals, fmtRow('pct')));
    }

    const blockKey = isTotal ? '__total__' : campaignName;
    const memoSaved = savedMemo[blockKey] || [];

    // メモ欄に「停止 / 休止 / pause」が入っているブロックは停止扱い (描画後にグレーアウト)
    const memoFlat = memoSaved.map(function (v) { return String(v || ''); }).join(' ');
    const isPaused = /停止|休止|paus/i.test(memoFlat);

    const memoArr = [];
    for (let c = 0; c < nCols; c++) {
      const v = memoSaved[c];
      memoArr.push((v === undefined || v === null) ? '' : v);
    }
    memoRows.push(push(memoArr, fmtAll('General')));

    metricRowsTemplate.forEach(function (m) {
      if (m.bookingMarker) {
        if (isLp04) drawBookingSegmentLp04();
        else drawBookingSegment();
        return;
      }
      // LP04: リード数を手入力にし、リード単価・率もその手入力値から再計算する。
      if (isLp04 && m.label === 'リード数') { drawLp04LeadTrio(); return; }
      if (isLp04 && (m.label === '　リード単価' || m.label === '　リード率')) return; // drawLp04LeadTrio で描画済み
      drawMetric(m);
    });

    return isPaused;
  }

  titleRow = push(['【' + ym + ' / ' + lpKey.toUpperCase() + '】Meta広告 分析'], fmtAll('@'));
  headerRow = push(['指標', '月合計'].concat(dates.map(dateHeaderLabel_)), fmtAll('@'));

  // 全体合計ブロック
  const totalHeadRow = push(['▼ 全体合計'], fmtAll('@'));
  sectionRows.push(totalHeadRow);
  const totalIsPaused = drawBlock(rowsOfMonth, 'total', null);
  if (totalIsPaused) pausedRanges.push({ start: totalHeadRow, end: values.length });

  // キャンペーン別ブロック
  sectionRows.push(push(['▼ キャンペーン別'], fmtAll('@')));
  campaigns.forEach(function (cp) {
    const cpHeadRow = push(['■ ' + cp], fmtAll('@'));
    campaignRows.push(cpHeadRow);
    const cpIsPaused = drawBlock(
      rowsOfMonth.filter(function (r) { return r.campaign === cp; }),
      'campaign', cp
    );
    if (cpIsPaused) pausedRanges.push({ start: cpHeadRow, end: values.length });
  });

  // 全体合計の「電話で予約」を各キャンペーンの同列セルの合計 (formula) に
  if (totalPhoneRow) {
    if (campaignPhoneRows.length) {
      for (let ci = 3; ci <= nCols; ci++) {
        const L = colLetter_(ci);
        values[totalPhoneRow - 1][ci - 1] =
          '=' + campaignPhoneRows.map(function (r) { return L + r; }).join('+');
      }
      values[totalPhoneRow - 1][1] =
        '=SUM(' + colLetter_(3) + totalPhoneRow + ':' + colLetter_(nCols) + totalPhoneRow + ')';
    } else {
      values[totalPhoneRow - 1][1] = 0;
    }
  }

  // LP04: 全体合計の「リード数」「予約数」を各キャンペーンの手入力セルの合計 (formula) にする。
  // (全体ブロックを先に積むため、各CPの行番号が確定したこのタイミングで流し込む)
  [[totalLeadRow, campaignLeadRows], [totalBookingRow, campaignBookingRows]].forEach(function (pair) {
    const totalRow = pair[0], cpRows = pair[1];
    if (!totalRow) return;
    if (cpRows.length) {
      for (let ci = 3; ci <= nCols; ci++) {
        const L = colLetter_(ci);
        values[totalRow - 1][ci - 1] = '=' + cpRows.map(function (r) { return L + r; }).join('+');
      }
      values[totalRow - 1][1] =
        '=SUM(' + colLetter_(3) + totalRow + ':' + colLetter_(nCols) + totalRow + ')';
    } else {
      values[totalRow - 1][1] = 0;
    }
  });

  // 書き込み
  const nRows = values.length;
  sheet.clear();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).breakApart();
  if (sheet.getMaxColumns() < nCols) sheet.insertColumnsAfter(sheet.getMaxColumns(), nCols - sheet.getMaxColumns());
  if (sheet.getMaxRows() < nRows) sheet.insertRowsAfter(sheet.getMaxRows(), nRows - sheet.getMaxRows());
  sheet.getRange(1, 1, nRows, nCols).setValues(values);
  sheet.getRange(1, 1, nRows, nCols).setNumberFormats(formats);

  // 装飾
  function bandRow(row, opt) {
    const rng = sheet.getRange(row, 1, 1, nCols);
    if (opt.bg) rng.setBackground(opt.bg);
    if (opt.font) rng.setFontColor(opt.font);
    if (opt.bold) rng.setFontWeight('bold');
    if (opt.size) rng.setFontSize(opt.size);
    rng.setVerticalAlignment('middle');
  }
  bandRow(titleRow, { bg: '#1F3864', font: '#FFFFFF', bold: true, size: 12 });
  const hdr = sheet.getRange(headerRow, 1, 1, nCols);
  hdr.setBackground('#D9D9D9').setFontWeight('bold').setWrap(true)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.getRange(headerRow, 1).setHorizontalAlignment('left');
  sectionRows.forEach(function (r) { bandRow(r, { bg: '#D9E1F2', bold: true }); });
  campaignRows.forEach(function (r) { bandRow(r, { bg: '#404040', font: '#FFFFFF', bold: true }); });
  metricRows.forEach(function (r) { sheet.getRange(r, 2).setBackground('#FFF2CC'); });

  for (let r = 0; r < values.length; r++) {
    if (BOLD_LABELS.indexOf(String(values[r][0])) >= 0) {
      sheet.getRange(r + 1, 1, 1, nCols).setFontWeight('bold');
    }
  }

  memoRows.forEach(function (r) {
    sheet.getRange(r, 1, 1, nCols).setBackground('#FFFDF5');
  });

  // 停止ブロックをグレーアウト
  pausedRanges.forEach(function (b) {
    sheet.getRange(b.start, 1, b.end - b.start + 1, nCols)
      .setBackground('#E8E8E8')
      .setFontColor('#888888');
  });

  // 固定・列幅
  sheet.setFrozenRows(headerRow);
  sheet.setFrozenColumns(2);
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 84);
  for (let c = 3; c <= nCols; c++) sheet.setColumnWidth(c, 116);
}

/**
 * 既存タブから、各キャンペーン別ブロックの手入力行を
 * {'<ラベル>||<キャンペーン名>||yyyy-MM-dd': 件数} で読み出す (再生成後に復元するため)。
 * 対象ラベル: 電話で予約 (LP01/02/03) / リード数・予約数 (LP04 手入力)。
 * 全体合計ブロックは formula なので退避対象外 ('■' 配下のみ拾う)。
 * 非LP04 タブの「リード数」は自動集計値だが拾われても、復元時に参照するのは LP04 タブだけ
 * (buildMonthlyTab_ の isLp04 判定) なので無害。
 */
function readExistingManualRows_(sheet, ym, labels) {
  const out = {};
  const wanted = {};
  (labels || []).forEach(function (l) { wanted[l] = true; });
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 3) return out;
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  let headerR = -1;
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === '指標') { headerR = i; break; }
  }
  if (headerR < 0) return out;

  const yy = ym.slice(0, 4), mm = ym.slice(5, 7);
  const colDate = {};
  for (let c = 2; c < lastCol; c++) {
    const md = String(data[headerR][c] || '').match(/^\s*(\d+)\/(\d+)/);
    if (md) colDate[c] = yy + '-' + mm + '-' + ('0' + Number(md[2])).slice(-2);
  }

  let currentCampaign = null;
  for (let i = headerR + 1; i < data.length; i++) {
    const label = String(data[i][0]).trim();
    if (label.indexOf('■') === 0) {
      currentCampaign = label.replace(/^■\s*/, '').trim();
      continue;
    }
    if (wanted[label] && currentCampaign) {
      for (let c = 2; c < lastCol; c++) {
        if (!colDate[c]) continue;
        const v = data[i][c];
        if (v !== '' && v !== null && !isNaN(Number(v)) && Number(v) !== 0) {
          out[label + '||' + currentCampaign + '||' + colDate[c]] = Number(v);
        }
      }
    }
  }
  return out;
}

function readExistingMemo_(sheet) {
  const out = {};
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return out;
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const fmls = sheet.getRange(1, 1, lastRow, lastCol).getFormulas();

  for (let i = 0; i < data.length; i++) {
    const label = String(data[i][0]).trim();
    let blockKey = null;
    if (label === '▼ 全体合計') blockKey = '__total__';
    else if (label.indexOf('■') === 0) blockKey = label.replace(/^■\s*/, '').trim();
    if (!blockKey) continue;

    const memoIdx = i + 1;
    if (memoIdx >= data.length) continue;
    if (String(data[memoIdx][0]).trim() === '広告費(税抜)') continue;

    const row = [];
    for (let j = 0; j < lastCol; j++) row.push(fmls[memoIdx][j] ? fmls[memoIdx][j] : data[memoIdx][j]);
    out[blockKey] = row;
  }
  return out;
}

/**
 * GA4 Data API で「LP02 鍵到達」「LP03 LP本体着地」「LP04 LINE登録経由のpreview到達」を
 * 取得し、Rawデータの「結果ページ到達(鍵)」列を上書きする。
 *   LP02 = /lp02/preview/ で始まる pagePath
 *   LP03 = /lp03 完全一致 (article/schedule/thanks を除外)
 *   LP04 = /lp04/preview/ または /lp04/preview-b/ で始まる pagePath (鍵ページ A/B の総和)
 * すべて date × sessionCampaignName ごとに合算して 1 つの「ファネル第1段到達」として扱う。
 */
function overlayReachFromGA4() {
  const propertyId = PropertiesService.getScriptProperties().getProperty('GA4_PROPERTY_ID');
  if (!propertyId) {
    Logger.log('GA4_PROPERTY_ID 未設定のため、結果ページ到達の GA4 取得はスキップ');
    return;
  }
  const adSheet = getTargetSpreadsheet().getSheetByName(SHEET_NAME);
  if (!adSheet || adSheet.getLastRow() < 2) return;

  const counts = {};

  function fetchAndMerge(filter, label) {
    const request = {
      dateRanges: [{ startDate: '2026-05-01', endDate: 'today' }],
      dimensions: [{ name: 'date' }, { name: 'sessionCampaignName' }],
      metrics: [{ name: 'totalUsers' }],
      dimensionFilter: { filter: filter },
      limit: 100000,
    };
    const report = AnalyticsData.Properties.runReport(request, 'properties/' + propertyId);
    let n = 0;
    (report.rows || []).forEach(function (row) {
      const ymd = row.dimensionValues[0].value;
      const campaign = String(row.dimensionValues[1].value || '').trim();
      const users = Number(row.metricValues[0].value) || 0;
      const date = ymd.slice(0, 4) + '-' + ymd.slice(4, 6) + '-' + ymd.slice(6, 8);
      const key = date + '||' + campaign;
      counts[key] = (counts[key] || 0) + users;
      n += users;
    });
    Logger.log('GA4 ' + label + ': 累計 ' + n + ' users (行数: ' + (report.rows || []).length + ')');
  }

  fetchAndMerge(
    { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/lp02/preview/' } },
    'LP02 鍵到達 (/lp02/preview/)'
  );
  fetchAndMerge(
    { fieldName: 'pagePath', stringFilter: { matchType: 'EXACT', value: '/lp03' } },
    'LP03 LP本体着地 (/lp03)'
  );
  fetchAndMerge(
    { fieldName: 'pagePath', stringFilter: { matchType: 'EXACT', value: '/lp03/' } },
    'LP03 LP本体着地 (/lp03/)'
  );
  fetchAndMerge(
    { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/lp04/preview/' } },
    'LP04 鍵到達 (A: /lp04/preview/)'
  );
  // A/B テスト variant B (/lp04/preview-b/)。BEGINS_WITH '/lp04/preview/' は preview-b を
  // 含まない (直後が "-b") ため別途加算。A/B の総和を LP04 の鍵到達合計として扱う。
  fetchAndMerge(
    { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/lp04/preview-b/' } },
    'LP04 鍵到達 (B: /lp04/preview-b/)'
  );

  const col = HEADERS.indexOf('結果ページ到達(鍵)') + 1;
  const keys = adSheet.getRange(2, 1, adSheet.getLastRow() - 1, 2).getValues();
  const out = keys.map(function (r) {
    const key = keyDate(r[0]) + '||' + String(r[1]).trim();
    return [counts[key] || 0];
  });
  adSheet.getRange(2, col, out.length, 1).setValues(out);
  Logger.log('結果ページ到達(鍵) を GA4 (LP02 preview + LP03 LP本体 + LP04 preview) から反映');
}

/**
 * 「leads_申込集計」タブの実件数を集計し、Rawデータの
 * 第1リード / リード数 / 予約カレンダー設定数 列を上書きする。
 *
 * - LP01: フォーム入力(=リード) / 予約完了
 * - LP02: 鍵解放(=第1リード) / フォーム入力(=リード) / 予約完了
 * - LP03: フォーム入力(=リード) / 予約完了
 * - LP04: フォーム入力(=リード) / 予約完了 (鍵解放は LINE 経由なので申込ログに来ない)
 * - LP05 / LP06: フォーム入力(=リード) / 予約完了 (LP04 と同じ LINE 登録型)
 *   stage 文字列は旧 (鍵開放/詳細情報入力) と新 (鍵解放/フォーム入力) の両対応。
 */
function overlayFunnelFromLog() {
  const ss = getTargetSpreadsheet();
  const logSheet = ss.getSheetByName('leads_申込集計');
  const adSheet = ss.getSheetByName(SHEET_NAME);
  if (!logSheet || !adSheet) {
    Logger.log('overlayFunnel: 必要なシートが見つかりません');
    return;
  }

  const LP_CONFIG = {
    lp01: [
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
    lp02: [
      { key: 'firstLead', match: ['鍵解放', '鍵開放'],         header: '第1リード' },
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
    lp03: [
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
    lp04: [
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
    lp05: [
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
    lp06: [
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
  };

  const counts = {};
  const totals = {};
  Object.keys(LP_CONFIG).forEach(function (lp) { totals[lp] = {}; });

  const logLast = logSheet.getLastRow();
  if (logLast >= 2) {
    const vals = logSheet.getRange(2, 1, logLast - 1, 23).getValues();
    vals.forEach(function (r) {
      const lpVersion = String(r[1] || '').trim();
      const stages = LP_CONFIG[lpVersion];
      if (!stages) return;
      const stage = String(r[2]);
      const campaign = String(r[22] || '').trim();
      if (!campaign) return;

      const key = keyDate(r[0]) + '||' + campaign;
      stages.forEach(function (s) {
        const hit = s.match.some(function (m) { return stage.indexOf(m) !== -1; });
        if (!hit) return;
        counts[s.key] = counts[s.key] || {};
        counts[s.key][key] = (counts[s.key][key] || 0) + 1;
        totals[lpVersion][s.key] = (totals[lpVersion][s.key] || 0) + 1;
      });
    });
  }

  const adLast = adSheet.getLastRow();
  if (adLast < 2) return;
  const keys = adSheet.getRange(2, 1, adLast - 1, 2).getValues();
  const matched = {};
  ['firstLead', 'leads', 'bookings'].forEach(function (key) {
    const headerLabel = { firstLead: '第1リード', leads: 'リード数', bookings: '予約カレンダー設定数' }[key];
    const col = HEADERS.indexOf(headerLabel) + 1;
    let m = 0;
    const bucket = counts[key] || {};
    const out = keys.map(function (r) {
      const k = keyDate(r[0]) + '||' + String(r[1]).trim();
      const n = bucket[k] || 0;
      if (n) m += n;
      return [n];
    });
    adSheet.getRange(2, col, out.length, 1).setValues(out);
    matched[key] = m;
  });

  function lpT(lp, key) { return totals[lp] ? (totals[lp][key] || 0) : 0; }
  Logger.log('申込ログから funnel を反映 (ログ件数→シート反映件数):');
  Logger.log('  LP01: リード ' + lpT('lp01', 'leads') + ' / 予約 ' + lpT('lp01', 'bookings'));
  Logger.log('  LP02: 第1リード ' + lpT('lp02', 'firstLead')
    + ' / リード ' + lpT('lp02', 'leads') + ' / 予約 ' + lpT('lp02', 'bookings'));
  Logger.log('  LP03: リード ' + lpT('lp03', 'leads') + ' / 予約 ' + lpT('lp03', 'bookings'));
  Logger.log('  LP04: リード ' + lpT('lp04', 'leads') + ' / 予約 ' + lpT('lp04', 'bookings'));
  Logger.log('  LP05: リード ' + lpT('lp05', 'leads') + ' / 予約 ' + lpT('lp05', 'bookings'));
  Logger.log('  LP06: リード ' + lpT('lp06', 'leads') + ' / 予約 ' + lpT('lp06', 'bookings'));
  Logger.log('  シート反映合計: 第1リード ' + matched.firstLead
    + ' / リード ' + matched.leads + ' / 予約 ' + matched.bookings);
}

/** insights 1 レコード → シート 1 行 */
function buildRow(d) {
  // 結果ページ到達(鍵) = LP02_鍵到達 + LP03_LP本体着地 の合算 (GA4 由来の値で後から上書き)
  const reachTypes = [];
  if (CC_PREVIEW_REACH) reachTypes.push('offsite_conversion.custom.' + CC_PREVIEW_REACH);
  if (CC_LP03_LANDING) reachTypes.push('offsite_conversion.custom.' + CC_LP03_LANDING);
  const reach = actionSum_(d.actions, reachTypes);

  // LINE_CTAクリック (LP04/LP05/LP06 鍵ページ CTA クリック) = Meta カスタムCV「LPxx_LINE登録」。
  // 鍵ページ (LINE に飛ぶ前・広告クリックと同じブラウザ) で発火するためキャンペーン別に取れる。
  // ※ あくまで CTA クリックで、実際の友だち追加数とは一致しない (Meta 帰属分のみ = 過少に出る)。
  const ctaClickTypes = [];
  if (CC_LP04_LINE_REGISTER) ctaClickTypes.push('offsite_conversion.custom.' + CC_LP04_LINE_REGISTER);
  if (CC_LP05_LINE_REGISTER) ctaClickTypes.push('offsite_conversion.custom.' + CC_LP05_LINE_REGISTER);
  if (CC_LP06_LINE_REGISTER) ctaClickTypes.push('offsite_conversion.custom.' + CC_LP06_LINE_REGISTER);
  const ctaClick = actionSum_(d.actions, ctaClickTypes);


  return [
    d.date_start,
    d.campaign_name || '',
    Number(d.spend) || 0,
    Number(d.impressions) || 0,
    Number(d.clicks) || 0,
    Number(d.cpc) || 0,
    Number(d.ctr) || 0,
    Number(d.cpm) || 0,
    reach,
    actionByPriority(d.actions, ['offsite_conversion.custom.' + CC_FIRST_LEAD]),
    actionByPriority(d.actions, [
      'offsite_conversion.fb_pixel_view_content', 'omni_view_content', 'view_content',
    ]),
    actionByPriority(d.actions, [
      'offsite_conversion.fb_pixel_lead', 'omni_lead', 'lead',
    ]),
    actionByPriority(d.actions, [
      'offsite_conversion.fb_pixel_schedule', 'omni_schedule', 'onsite_web_schedule', 'schedule',
    ]),
    ctaClick, // LINE_CTAクリック (HEADERS 末尾の列)
  ];
}

function actionByPriority(actions, typesInPriority) {
  if (!actions) return 0;
  const map = {};
  actions.forEach(function (a) { map[a.action_type] = Number(a.value) || 0; });
  for (let i = 0; i < typesInPriority.length; i++) {
    if (map[typesInPriority[i]] !== undefined) return map[typesInPriority[i]];
  }
  return 0;
}

function actionSum_(actions, types) {
  if (!actions || !types || !types.length) return 0;
  const wanted = {};
  types.forEach(function (t) { wanted[t] = true; });
  let total = 0;
  actions.forEach(function (a) {
    if (wanted[a.action_type]) total += Number(a.value) || 0;
  });
  return total;
}

function getTargetSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function upsertRows(rows) {
  const ss = getTargetSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  const lastRow = sheet.getLastRow();
  const keyToRow = {};
  if (lastRow >= 2) {
    const keys = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    keys.forEach(function (r, i) {
      keyToRow[keyDate(r[0]) + '||' + r[1]] = i + 2;
    });
  }

  const appends = [];
  rows.forEach(function (row) {
    const key = keyDate(row[0]) + '||' + row[1];
    if (keyToRow[key]) {
      sheet.getRange(keyToRow[key], 1, 1, row.length).setValues([row]);
    } else {
      appends.push(row);
    }
  });

  if (appends.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, HEADERS.length).setValues(appends);
  }
}

function keyDate(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  return String(v).trim();
}

function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'fetchMetaInsightsDaily') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('fetchMetaInsightsDaily')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .inTimezone(TZ)
    .create();
  Logger.log('毎朝9時(JST)のトリガーを作成しました');
}

/** デバッグ用: GA4 から LP02 preview / LP03 LP本体着地 / LP04 preview を取得して日付×CP でログに吐く */
function debugDumpGA4ReachByCampaign() {
  const propertyId = PropertiesService.getScriptProperties().getProperty('GA4_PROPERTY_ID');
  if (!propertyId) {
    Logger.log('GA4_PROPERTY_ID 未設定のため診断できません');
    return;
  }

  function dump(filter, label) {
    const request = {
      dateRanges: [{ startDate: '2026-05-20', endDate: 'today' }],
      dimensions: [{ name: 'date' }, { name: 'sessionCampaignName' }],
      metrics: [{ name: 'totalUsers' }],
      dimensionFilter: { filter: filter },
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 100000,
    };
    const report = AnalyticsData.Properties.runReport(request, 'properties/' + propertyId);
    Logger.log('=== GA4 ' + label + ' (日付 | [campaign] = users) ===');
    if (!report.rows || !report.rows.length) {
      Logger.log('  該当期間で 0 件');
      return;
    }
    report.rows.forEach(function (row) {
      const ymd = row.dimensionValues[0].value;
      const date = ymd.slice(0, 4) + '-' + ymd.slice(4, 6) + '-' + ymd.slice(6, 8);
      Logger.log('  ' + date + ' | [' + row.dimensionValues[1].value + '] = ' + row.metricValues[0].value);
    });
  }

  dump(
    { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/lp02/preview/' } },
    'LP02 /lp02/preview/'
  );
  dump(
    { fieldName: 'pagePath', stringFilter: { matchType: 'EXACT', value: '/lp03' } },
    'LP03 /lp03 (完全一致)'
  );
  dump(
    { fieldName: 'pagePath', stringFilter: { matchType: 'EXACT', value: '/lp03/' } },
    'LP03 /lp03/ (末尾スラあり)'
  );
  dump(
    { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/lp04/preview/' } },
    'LP04 /lp04/preview/ (A)'
  );
  dump(
    { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/lp04/preview-b/' } },
    'LP04 /lp04/preview-b/ (B)'
  );
}

/** デバッグ用: 「leads_申込集計」の各ファネル行が overlayFunnelFromLog で計上されるか確認 */
function debugFunnelMatch() {
  const ss = getTargetSpreadsheet();
  const logSheet = ss.getSheetByName('leads_申込集計');
  const adSheet = ss.getSheetByName(SHEET_NAME);
  if (!logSheet || !adSheet) {
    Logger.log('必要なシートが見つかりません');
    return;
  }

  const rawKeys = {};
  const adLast = adSheet.getLastRow();
  if (adLast >= 2) {
    adSheet.getRange(2, 1, adLast - 1, 2).getValues().forEach(function (r) {
      rawKeys[keyDate(r[0]) + '||' + String(r[1]).trim()] = true;
    });
  }

  const LP_CONFIG = {
    lp01: [
      { match: ['フォーム入力', '詳細情報入力'], name: 'リード(LP01)' },
      { match: ['予約完了'],                  name: '予約(LP01)' },
    ],
    lp02: [
      { match: ['鍵解放', '鍵開放'],         name: '第1リード(LP02)' },
      { match: ['フォーム入力', '詳細情報入力'], name: 'リード(LP02)' },
      { match: ['予約完了'],                  name: '予約(LP02)' },
    ],
    lp03: [
      { match: ['フォーム入力', '詳細情報入力'], name: 'リード(LP03)' },
      { match: ['予約完了'],                  name: '予約(LP03)' },
    ],
    lp04: [
      { match: ['フォーム入力', '詳細情報入力'], name: 'リード(LP04)' },
      { match: ['予約完了'],                  name: '予約(LP04)' },
    ],
    lp05: [
      { match: ['フォーム入力', '詳細情報入力'], name: 'リード(LP05)' },
      { match: ['予約完了'],                  name: '予約(LP05)' },
    ],
    lp06: [
      { match: ['フォーム入力', '詳細情報入力'], name: 'リード(LP06)' },
      { match: ['予約完了'],                  name: '予約(LP06)' },
    ],
  };

  const logLast = logSheet.getLastRow();
  if (logLast < 2) { Logger.log('申込ログが空'); return; }
  const vals = logSheet.getRange(2, 1, logLast - 1, 23).getValues();

  Logger.log('=== LP | 段階 | 受信日 | [utm_campaign] | 判定 ===');
  let ok = 0, ngEmpty = 0, ngNoRow = 0, ngOtherLp = 0;
  vals.forEach(function (r) {
    const lpVersion = String(r[1] || '').trim();
    const stages = LP_CONFIG[lpVersion];
    if (!stages) { ngOtherLp++; return; }
    const stage = String(r[2]);
    const st = stages.filter(function (s) {
      return s.match.some(function (m) { return stage.indexOf(m) !== -1; });
    })[0];
    if (!st) return;
    const date = keyDate(r[0]);
    const campaign = String(r[22] || '').trim();
    let status;
    if (!campaign) { status = 'NG: utm_campaign が空'; ngEmpty++; }
    else if (!rawKeys[date + '||' + campaign]) { status = 'NG: Rawデータに行なし'; ngNoRow++; }
    else { status = 'OK'; ok++; }
    Logger.log(lpVersion + ' | ' + st.name + ' | ' + date + ' | [' + campaign + '] | ' + status);
  });
  Logger.log('--- 合計: OK ' + ok + ' / NG(utm空) ' + ngEmpty + ' / NG(行なし) ' + ngNoRow
    + ' / 対象外 LP ' + ngOtherLp + ' ---');
}

/** デバッグ用: 期間集約で action_type に "schedule" を含むものを抽出してログに出す */
function debugDumpActions() {
  const SINCE = '2026-06-01';
  const UNTIL = '2026-06-04';

  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('META_TOKEN');
  const accountId = props.getProperty('META_AD_ACCOUNT_ID');

  const timeRange = JSON.stringify({ since: SINCE, until: UNTIL });
  const url = 'https://graph.facebook.com/' + API_VERSION + '/' + accountId + '/insights'
    + '?level=campaign'
    + '&time_range=' + encodeURIComponent(timeRange)
    + '&fields=campaign_name,actions'
    + '&action_attribution_windows=' + encodeURIComponent('["7d_click","1d_view","28d_click","28d_view"]')
    + '&limit=500'
    + '&access_token=' + encodeURIComponent(token);

  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    Logger.log('エラー: ' + res.getContentText());
    return;
  }
  const json = JSON.parse(res.getContentText());
  let foundAny = false;
  (json.data || []).forEach(function (d) {
    const scheduleActions = (d.actions || []).filter(function (a) {
      return a.action_type.indexOf('schedule') !== -1;
    });
    if (scheduleActions.length) {
      foundAny = true;
      Logger.log('===== ' + d.campaign_name + ' =====');
      scheduleActions.forEach(function (a) {
        Logger.log('  [予約候補] ' + a.action_type + ' = ' + a.value);
      });
    }
  });
  if (!foundAny) {
    Logger.log('!!! 期間 ' + SINCE + '〜' + UNTIL + ' で "schedule" を含む action_type は 0 件。');
  }
}

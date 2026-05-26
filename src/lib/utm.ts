// UTM パラメータのキャプチャ & 取得ヘルパー
//
// 流れ:
//   1. ユーザーが広告クリックで LP に来る (URL に ?utm_source=... が乗る)
//   2. 入口LP のロード時に captureUtmFromUrl() で localStorage に保存
//   3. フォーム送信時に getStoredUtm() で取り出し、payload に同梱して GAS / Slack に転送
//
// 保存戦略:
//   - localStorage を使う (タブを閉じても保持、後日再訪問でも有効)
//   - URL に UTM が乗っていない訪問 (直接 / 検索) では既存の保存値を上書きしない
//     → 「最後にクリックした有料広告」のクレジットを保持する (last paid touch attribution)

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_placement",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmPayload = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "vc:utm";

/**
 * 現在の URL から UTM パラメータを読み取り、1 つでもあれば localStorage に保存。
 * UTM が無い訪問 (直接 / 検索流入) では既存の保存値を保持する。
 */
export function captureUtmFromUrl(): void {
  if (typeof window === "undefined") return;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }
  const utm: UtmPayload = {};
  let hasAny = false;
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) {
      utm[key] = v;
      hasAny = true;
    }
  }
  if (!hasAny) return; // 直接訪問: 既存の last paid touch を保持
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    /* localStorage 無効でも処理続行 */
  }
}

/** 保存済みの UTM を取り出す (なければ空オブジェクト) */
export function getStoredUtm(): UtmPayload {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmPayload;
  } catch {
    return {};
  }
}

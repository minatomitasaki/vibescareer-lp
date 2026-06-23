# 広告分析シート GAS — LP06 対応パッチ

`leads_申込集計` を読んで `Meta_LPxx_YYYY-MM` を生成する Meta 集計 GAS に LP06 を
追加するための差し替え箇所（5 つ）。あわせて、これまで抜けていた **LP05 のファネル
反映**（リード数・予約数）も同時に修正する。

> ※ このGASは申込フォームを受ける `doPost`（別スクリプト）とは別物。
> doPost が `leads_申込集計` に lpVersion=lp06 / utm_campaign 付きで追記していれば、
> doPost 側の変更は不要。下記の集計側だけで LP06 が反映される。

---

## 1. `detectLP_` に lp06 を追加

**before**
```js
function detectLP_(campaignName) {
  const n = String(campaignName || '').toLowerCase();
  if (n.indexOf('lp05') !== -1) return 'lp05';
```
**after**
```js
function detectLP_(campaignName) {
  const n = String(campaignName || '').toLowerCase();
  if (n.indexOf('lp06') !== -1) return 'lp06';
  if (n.indexOf('lp05') !== -1) return 'lp05';
```
> これが無いと lp06 キャンペーンが 'lp02' 扱いになり LP02 タブに混入する（最重要）。

---

## 2. カスタムCV定数に CC_LP06 を追加

`CC_LP05_LINE_REGISTER` の定義の直後に追記：
```js
const CC_LP06_LINE_REGISTER =
  PropertiesService.getScriptProperties().getProperty('CC_LP06_LINE_REGISTER') || '';
```
> LP06 用の Meta カスタムCV（LINE_CTAクリック計測）を作ったら、
> スクリプトプロパティ `CC_LP06_LINE_REGISTER` に ID を入れる。未設定なら 0 のまま。

---

## 3. `buildRow` の LINE_CTAクリック集計に LP06 を追加

**before**
```js
  if (CC_LP05_LINE_REGISTER) ctaClickTypes.push('offsite_conversion.custom.' + CC_LP05_LINE_REGISTER);
  const ctaClick = actionSum_(d.actions, ctaClickTypes);
```
**after**
```js
  if (CC_LP05_LINE_REGISTER) ctaClickTypes.push('offsite_conversion.custom.' + CC_LP05_LINE_REGISTER);
  if (CC_LP06_LINE_REGISTER) ctaClickTypes.push('offsite_conversion.custom.' + CC_LP06_LINE_REGISTER);
  const ctaClick = actionSum_(d.actions, ctaClickTypes);
```

---

## 4. `buildMonthlyTab_` のテンプレ選択と isLp04 に lp06 を追加

**before**
```js
  const metricRowsTemplate =
    (lpKey === 'lp02') ? METRIC_ROWS_LP02 :
    (lpKey === 'lp04' || lpKey === 'lp05') ? METRIC_ROWS_LP04 :
    METRIC_ROWS_SIMPLE;
  ...
  const isLp04 = (lpKey === 'lp04' || lpKey === 'lp05');
```
**after**
```js
  const metricRowsTemplate =
    (lpKey === 'lp02') ? METRIC_ROWS_LP02 :
    (lpKey === 'lp04' || lpKey === 'lp05' || lpKey === 'lp06') ? METRIC_ROWS_LP04 :
    METRIC_ROWS_SIMPLE;
  ...
  const isLp04 = (lpKey === 'lp04' || lpKey === 'lp05' || lpKey === 'lp06');
```
> LP06 は LINE 登録型（lp04/lp05 と同じ）なので、LINE_CTAクリック行＋
> リード数・予約数 手入力のテンプレを使う。

---

## 5. `overlayFunnelFromLog` の LP_CONFIG に lp05・lp06 を追加

`lp04: [...]` の直後に追記（lp05 も従来抜けていたので同時に追加）：
```js
    lp05: [
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
    lp06: [
      { key: 'leads',     match: ['フォーム入力', '詳細情報入力'], header: 'リード数' },
      { key: 'bookings',  match: ['予約完了'],                  header: '予約カレンダー設定数' },
    ],
```
> これで lp05/lp06 の申込ログ（フォーム入力＝リード、予約完了＝予約）が
> Rawデータの該当列に反映される。

（任意）末尾のログ出力にも lp05/lp06 を足すとデバッグしやすい：
```js
  Logger.log('  LP05: リード ' + (totals.lp05 ? (totals.lp05.leads || 0) : 0)
    + ' / 予約 ' + (totals.lp05 ? (totals.lp05.bookings || 0) : 0));
  Logger.log('  LP06: リード ' + (totals.lp06 ? (totals.lp06.leads || 0) : 0)
    + ' / 予約 ' + (totals.lp06 ? (totals.lp06.bookings || 0) : 0));
```

---

## 反映後

1. エディタに貼って保存。
2. `fetchMetaInsightsDaily` を手動実行（または翌朝のトリガー）→ `Meta_LP06_YYYY-MM` タブが生成される。
3. LP06 のキャンペーン名には必ず `lp06` を含める（命名規則）。含まないと lp02 扱いになる。

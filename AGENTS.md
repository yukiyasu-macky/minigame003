# AGENTS.md

このプロジェクト内では、
ユーザーが毎回明示しなくても、
以下ルールを自動で実施してください。

---

# 作業開始前

- 最新の main を取得する
- git status を確認する
- 古い不要差分があれば整理する
- fresh workspace を優先する
- workspace が壊れている場合は新規workspaceを作成する
- EPERM / Bad Request / working directory error が出た場合は、古いworkspaceを使い続けない

---

# Build / Preview 確認

作業完了前に必ず:

1. npm run build
2. preview起動
3. 操作可能なpreview画面を表示
4. 実際にクリック操作確認

を実施してください。

preview は原則として `127.0.0.1:3001` で起動し、
報告時には以下の形式でURLを提示してください。

- http://127.0.0.1:3001/

---

# Preview確認内容

以下を確認してください。

- title画面表示
- gameplay画面表示
- result画面表示
- preload表示
- Asset表示
- スタート操作
- gameplay遷移
- result遷移
- もういちどあそぶ
- シェアボタン
- レイアウト崩れ
- スマホ縦画面表示

---

# Debug確認ルール

以下が production画面へ表示されていないこと。

- debug UI
- test text
- layout debug
- 開発用overlay
- browser helper UI
- in-app browser 操作用ツール
- browser control UI
- 開発用ボタン
- console error

問題があれば、
デバッグ後に修正してから再度確認してください。

---

# UIルール

- Nintendo UI系
- LINEスタンプ系
- ねこあつめ系
- 低情報量
- 余白重視
- パステルカラー
- 丸いUI
- 装飾を増やしすぎない
- 引き算を優先

---

# Assetルール

- public/assets 方式を維持
- assetsConfig.js 経由を維持
- 画像直書き禁止
- background画像は指示がない限り変更禁止

---

# ゲームロジック制約

以下は禁止。

- 当たり判定変更
- スコア処理変更
- 落下速度変更
- 出現率変更
- ゲームルール変更

---

# Reporting Rules

正常完了時は簡潔に以下のみ報告。

- build成功
- preview確認完了
- click確認完了

問題があった場合のみ詳細報告。

- 問題内容
- 修正内容
- 未解決事項

---

# Workspaceルール

Bad Request や workspace 不整合が発生した場合:

- 古いスレッドを引き継がない
- 新規スレッドを使用
- fresh workspace を作成
- clean 状態から再開

長大スレッド、
大量画像添付、
古い差分蓄積を避けること。

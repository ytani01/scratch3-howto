# Scratch3 拡張機能

## URLs
* [Scratchページ(https)](https://ytani01.github.io/scratch-gui/)
* [Scratchページ(http)](http://www.ytani.net:8080/scratch/)
* [scratch-vm](https://github.com/ytani01/scratch-vm/)
* [scratch-gui](https://github.com/ytani01/scratch-gui/)

## 開発環境整備・github pagesで公開

### github上で、リポジトリをfork

* llk/scratch-vm
* llk/scratch-gui


### clone --depth 1

```bash
$ git clone --depth 1 git@github.com:ytani01/scratch-vm
$ git clone --depth 1 git@github.com:ytani01/scratch-gui
```


### npm のインストール

```bash
$ sudo apt install npm nodejs
$ sudo npm install -g n
$ sudo n stable
$ sudo n
```

### 依存関係の設定


```bash
$ cd scratch-vm
$ npm install
($ npm audit fix)
($ npm audit fix --force)
$ sudo npm link
($ npm audit fix)
($ npm audit fix --force)

$ cd ../scratch-gui
$ npm install
($ npm audit fix)
($ npm audit fix --force)
$ npm link scratch-vm

($ npm update)
```


### ローカル実行

```bash
$ npm start
```

ブラウザで以下にアクセス。

* https://localhost:8601 (HTTPS)
* http://localhost:8601 (HTTP)


### github pages (github.io) に公開

```bash
$ cd scratch-vm
$ git add . && git commit -am update && git push

$ npm install
($ npm audit fix)
($ npm audit fix --force)
```

```bash
$ cd ../scratch-gui
($ npm install)
($ npm audit fix)
($ npm audit fix --force)
$ npm run build  ### ``build``ディレクトリに静的なページを作成
$ npm run deploy  ### 最初はかなり時間がかかる)
```

(注意) 実行後、サイトに反映されるまで時間がかかる。

ブラウザで以下にアクセス。
https://ytani01.github.io/scatch-gui/


## 拡張機能作成

拡張機能名を"foo"とする。

### GUI(拡張機能メニュー)の設定

#### 画像作成

* 背景(foo.png): 600x372, PNG
* アイコン(foo-small.png): 80x80, PNG,SVG?
* 保存ディレクトリ: scratch-gui/src/lib/libraries/extensions/foo/


#### scratch-gui/src/lib/libraries/extensions/index.jsx に追加

```
import fooImage from './foo/foo.png';
import fooInsetImage from './foo/foo-small.png';

// 略

export default [
    {
        name: (
            <FormattedMessage
                defaultMessage="Foo name"
                description="Name for the 'Foo' extension"
                id="gui.extension.foo.name"
            />
        ),
        extensionId: 'foo',
        iconURL: fooImage,
        insetIconURL: fooInsetImage,
        description: (
            <FormattedMessage
                defaultMessage="Foo description"
                description="Description for the 'Foo' extension"
                id="gui.extension.foo.description"
            />
        ),
        featured: true
    },
// 略
```


### ブロックの作成

#### ブロックアイコンとメニューアイコンの作成

* 書式: 40x40, SVG
* base64形式に変換
[Base64エンコードツール](https://2003kaito.com/tools/Base64_encode)


#### scratch-vm/src/extensions/scratch3-foo/index.js を作成

```
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzgiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDEwLjU4MzMzMyAxMC41ODMzMzQiCiAgIGhlaWdodD0iNDAiCiAgIHdpZHRoPSI0MCI+CiAgPGRlZnMKICAgICBpZD0iZGVmczIiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC0yODYuNDE2NjUpIgogICAgIGlkPSJsYXllcjEiPgogICAgPGcKICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuMDgyMTkyNTEsMCwwLDAuMDgyMTkyNTEsLTIuOTM5MjQwNSwyODUuNTY5ODEpIgogICAgICAgaWQ9ImxheWVyMS0zIj4KICAgICAgPGcKICAgICAgICAgaWQ9Imc4NTUiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDEyLjQ4OTAwOCwwLDAsMTIuNDg5MDA4LC03OTUuMjAxMzYsLTE1MDMuMjM0NCkiPgogICAgICAgIDx0ZXh0CiAgICAgICAgICAgaWQ9InRleHQ4MTciCiAgICAgICAgICAgeT0iMTI3LjU1MTEyIgogICAgICAgICAgIHg9IjY2LjY4NzY3NSIKICAgICAgICAgICBzdHlsZT0iZm9udC1zdHlsZTppdGFsaWM7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6OC40NjY2NjYyMnB4O2xpbmUtaGVpZ2h0OjEuMjU7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7bGV0dGVyLXNwYWNpbmc6MHB4O3dvcmQtc3BhY2luZzowcHg7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4yNjQ1ODMzMiIKICAgICAgICAgICB4bWw6c3BhY2U9InByZXNlcnZlIj48dHNwYW4KICAgICAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgICAgICAgICAgeT0iMTI3LjU1MTEyIgogICAgICAgICAgICAgeD0iNjYuNjg3Njc1IgogICAgICAgICAgICAgaWQ9InRzcGFuODE1Ij5ZPC90c3Bhbj48L3RleHQ+CiAgICAgICAgPHRleHQKICAgICAgICAgICB4bWw6c3BhY2U9InByZXNlcnZlIgogICAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDtsZXR0ZXItc3BhY2luZzowcHg7d29yZC1zcGFjaW5nOjBweDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgICAgICAgIHg9IjY3Ljg1MDUxNyIKICAgICAgICAgICB5PSIxMzAuMTE2NDciCiAgICAgICAgICAgaWQ9InRleHQ4MjEiPjx0c3BhbgogICAgICAgICAgICAgaWQ9InRzcGFuODE5IgogICAgICAgICAgICAgeD0iNjcuODUwNTE3IgogICAgICAgICAgICAgeT0iMTMwLjExNjQ3IgogICAgICAgICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6aXRhbGljO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOjguNDY2NjY2MjJweDtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzIiPlQ8L3RzcGFuPjwvdGV4dD4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==';

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzgiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDEwLjU4MzMzMyAxMC41ODMzMzQiCiAgIGhlaWdodD0iNDAiCiAgIHdpZHRoPSI0MCI+CiAgPGRlZnMKICAgICBpZD0iZGVmczIiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC0yODYuNDE2NjUpIgogICAgIGlkPSJsYXllcjEiPgogICAgPGcKICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuMDgyMTkyNTEsMCwwLDAuMDgyMTkyNTEsLTIuOTM5MjQwNSwyODUuNTY5ODEpIgogICAgICAgaWQ9ImxheWVyMS0zIj4KICAgICAgPGcKICAgICAgICAgaWQ9Imc4NTUiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDEyLjQ4OTAwOCwwLDAsMTIuNDg5MDA4LC03OTUuMjAxMzYsLTE1MDMuMjM0NCkiPgogICAgICAgIDx0ZXh0CiAgICAgICAgICAgaWQ9InRleHQ4MTciCiAgICAgICAgICAgeT0iMTI3LjU1MTEyIgogICAgICAgICAgIHg9IjY2LjY4NzY3NSIKICAgICAgICAgICBzdHlsZT0iZm9udC1zdHlsZTppdGFsaWM7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6OC40NjY2NjYyMnB4O2xpbmUtaGVpZ2h0OjEuMjU7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7bGV0dGVyLXNwYWNpbmc6MHB4O3dvcmQtc3BhY2luZzowcHg7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4yNjQ1ODMzMiIKICAgICAgICAgICB4bWw6c3BhY2U9InByZXNlcnZlIj48dHNwYW4KICAgICAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgICAgICAgICAgeT0iMTI3LjU1MTEyIgogICAgICAgICAgICAgeD0iNjYuNjg3Njc1IgogICAgICAgICAgICAgaWQ9InRzcGFuODE1Ij5ZPC90c3Bhbj48L3RleHQ+CiAgICAgICAgPHRleHQKICAgICAgICAgICB4bWw6c3BhY2U9InByZXNlcnZlIgogICAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDtsZXR0ZXItc3BhY2luZzowcHg7d29yZC1zcGFjaW5nOjBweDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgICAgICAgIHg9IjY3Ljg1MDUxNyIKICAgICAgICAgICB5PSIxMzAuMTE2NDciCiAgICAgICAgICAgaWQ9InRleHQ4MjEiPjx0c3BhbgogICAgICAgICAgICAgaWQ9InRzcGFuODE5IgogICAgICAgICAgICAgeD0iNjcuODUwNTE3IgogICAgICAgICAgICAgeT0iMTMwLjExNjQ3IgogICAgICAgICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6aXRhbGljO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOjguNDY2NjY2MjJweDtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzIiPlQ8L3RzcGFuPjwvdGV4dD4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==';


/**
 * Class for the foo blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 */ 
class Scratch3Foo {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // this._onTargetCreated = this._onTargetCreated.bind(this);
        // this.runtime.on('targetWasCreated', this._onTargetCreated);
    }


    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'foo',
            name: 'Foo Blocks',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'writeLog',
                    blockType: BlockType.COMMAND,
                    text: 'log [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hello'
                        }
                    }
                },
                {
                    opcode: 'getBrowser',
                    text: 'browser',
                    blockType: BlockType.REPORTER
                }
            ],
            menus: {
            }
        };
    }

    /**
     * Write log.
     * @param {object} args - the block arguments.
     * @property {number} TEXT - the text.
     */
    writeLog (args) {
        const text = Cast.toString(args.TEXT);
        log.log(text);
    }

    /**
     * Get the browser.
     * @return {number} - the user agent.
     */
    getBrowser () {
        return navigator.userAgent;
    }
}

module.exports = Scratch3Foo;
```

#### src/extension-suport/extension-manager.js に追記

```
:
foo: () => require('../extensions/scratch3_foo'),
:
```

## ローカルで確認

```bash
$ cd scratch-gui
$ npm start
```

### 確認事項

* ``npm start``実行中に、``scratch-vm``のソースコードを更新すると、
自動的に再コンパイルが実行され、
ブラウザでは自動的に再読み込みがおこなれる。<br />
これが動作しない場合は、``npm link``が機能していない。

* ブラウザのコンソール:
``Uncaught (in promise) DOMException: NetworkError``<br />
拡張機能がvmに認識されていない。


## github pages に反映

### スタティックページの作成

```bash
$ cd ../scratch-vm
$ git add . && git commit -am update && git push
$ npm install
($ npm audit fix)
($ npm audit fix --fource)

$ cd ../scratch-gui
$ git add . && git commit -am update && git push
$ npm install
($ npm audit fix)
($ npm audit fix --fource)
$ npm link scratch-vm

($ cd ../scratch-gui)
$ npm run build
```

* ``build``ディレクトリ下をコピーすれば、
任意のWebサーバーで公開可能


### 確認事項

* github pagesに反映する前に、
スタティックページに変更が反映されていることを確認


### github pagesに反映

(スタティックページ作成後)
```bash
$ npm run deploy
```

* 反映されるまで、しばらく時間がかかる


## 参考

* Scratch 3.0の拡張機能を作ってみよう
https://ja.scratch-wiki.info/wiki/Scratch_3.0%E3%81%AE%E6%8B%A1%E5%BC%B5%E6%A9%9F%E8%83%BD%E3%82%92%E4%BD%9C%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86

* [PaPeRo i をScratch3.0で制御する-その1-接続・発話・ボタン](https://smilerobo.com/papero/tips_scratch30_connect/)

* [websockets](https://websockets.readthedocs.io/)

## Memo
* sudo npm install -g xxx コマンド の、 ‘sudo’ は、推奨されないようです。[2019]
https://tech-for.com/2019/05/05/using-sudo-with-npm-install-may-not-be-recommended/

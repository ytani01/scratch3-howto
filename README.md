# Scratch3 拡張機能

参考

* Scratch 3.0の拡張機能を作ってみよう
https://ja.scratch-wiki.info/wiki/Scratch_3.0%E3%81%AE%E6%8B%A1%E5%BC%B5%E6%A9%9F%E8%83%BD%E3%82%92%E4%BD%9C%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86


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
```


### ローカル実行

```bash
$ npm start
```

ブラウザで以下にアクセス。
https://localhost:8601


### github pages (github.io) に公開



(scratch-vmの方は不要...?)
```bash
$ cd scratch-vm
$ git add .
$ git commit -am update
$ git push

$ npm install
($ npm audit fix)
($ npm audit fix --force)
```

```bash
$ cd scratch-gui
$ git add .
$ git commit -am update
$ git push

$ npm install
($ npm audit fix)
($ npm audit fix --force)
$ npm run build
$ npm run deploy
(時間がかかる)
```

ブラウザで以下にアクセス。
https://ytani01.github.io/scatch-gui/


## 拡張機能作成

拡張機能名を"foo"とする。

### GUIの設定

#### 拡張機能メニューの画像

* 背景: 600x372, PNG
* アイコン: 80x80, PNG,SVG?
* パス: scratch-gui/src/lib/libraries/extensions/foo/


### index.jsx に追加

```
import fooImage from './foo.png'
import fooInsetImage from './foo-small.png'

// 略

export default [
    {
        name: (
            <FormattedMessage
                defaultMessage="New Blocks"
                description="Name for the 'New Blocks' extension"
                id="gui.extension.foo.name"
            />
        ),
        extensionId: 'foo',
        iconURL: fooImage,
        insetIconURL: fooInsetImage,
        description: (
            <FormattedMessage
                defaultMessage="New extension"
                description="Description for the 'New Blocks' extension"
                id="gui.extension.foo.description"
            />
        ),
        featured: true
    },
// 略
```


### ブロックの作成

#### 画像作成




## Memo
* sudo npm install -g xxx コマンド の、 ‘sudo’ は、推奨されないようです。[2019]
https://tech-for.com/2019/05/05/using-sudo-with-npm-install-may-not-be-recommended/
* 

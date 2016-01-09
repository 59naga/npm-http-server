# bundler

To run:

```
npm install
```

Inside a docker enabled cli

```
docker build -t jsbundler . && docker run -d -p 5401:5100 jsbundler
```

DEMO

```
http://192.168.99.100:5401/bundle/react

or go straight to

http://192.168.99.100:5401/bundle/react@0.14.6/react.js
```

Development:

```
npm install

npm run
```

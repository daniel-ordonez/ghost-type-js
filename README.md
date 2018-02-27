# Ghost Type JS
>Make coold typing effects for you site

## Features

* Promises
* async await
* 3 KB without minimized
* 0 dependencies

## API

| Name |Args  |Description  | Returns|
| --- | --- | --- |--- |
|  type( t )| String  | Set the string to be typed, if the value options.auto is true, it starts typing. If it's called with no arguments, it looks for the text inside the element and replaces it.  | this|
|  start()|  |Start typing | this|
|  finished|  | Promise created with start(), its resolved when the typing is completed| Promise|

### Exmaple
```javascript
<script type="text/javascript" src="self-typing.js"></script>
<body>
    <h1>Text to type</h1>
    <script>
    let selfType = new ghostType('el');
    selfType.type();
    </script>
</body>
```
## To do

* [ ] pause
* [ ] stop
* [ ] cursor
* [ ] delete
* [ ] cool stuff

* * *
v0.1 feb 2018
👷 This is a work in progress, please stand by.

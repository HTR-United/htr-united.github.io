Small helper for getting a list using the console

```js
let text = "";
document.querySelectorAll("label").forEach(function (data) { 
	text = text + "actions."+data.getAttribute("for")+"\t"+data.innerHTML.trim()+"\n"
});
console.log(text);
```

will retrieve the text of each label and user `for` as an ID
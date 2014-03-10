#Simpleloader
Simple conditional resource loader based on Jquery


##Basic usage
```javascript
app.load({
	test: someCondition,
	yep: ['/img/logo.png', '/css/myModule.css', '/js/myModule.js'],
	complete: function(){ console.log('loaded all resources'); }
});

app.load.getScript('/js/myModule.js', function(){ console.log('Loaded js!'); })

app.load.getCSS('/css/myModule.css', function(){ console.log('Loaded css!'); })

app.load.getImage('/img/logo.png', function(){ console.log('Loaded image!'); })

```

##Description
Simpleloader is a  small library for conditional resource loading based on JQuery with api similar to yepnope.
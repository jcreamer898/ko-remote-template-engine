ko.remoteTemplateEngine
=======================
This remote template engine is derived from [ko-amdHelpers](https://github.com/rniemeyer/knockout-amd-helpers).

The idea behind this engine is to be able to simply supply the name of a template,
and have the template be retrieved via ajax, and cached for re-use.

```html
<div id="main" data-bind="template: 'home'">
</div>

<script src="ext/knockout.js/knockout.debug.js"></script>
<script src="ext/ko.remoteTemplateEngine.js"></script>
```

The engine works off of a few defaults.

```js
ko.remoteTemplateEngine.defaultPath = "templates";
ko.remoteTemplateEngine.defaultSuffix = ".tmpl.html";
```

So, in the case of `home` as a template name, a request will be made to pull down
`templates/home.tmpl.html`.

The engine works just as it would with regular templates, so you can add bindings for lists...

```html
<ul data-bind="template: {
    foreach: items,
    name: 'li'
}">
</ul>
```

There are demos in the `/demo` directory of this repo.

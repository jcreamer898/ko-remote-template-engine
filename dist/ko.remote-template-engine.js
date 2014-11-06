/*! ko.remote-template-engine - v1.0.0 - 2014-11-06
* Copyright (c) 2014 ; Licensed  */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['knockout'], function (b) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (factory(b));
        });
    } else {
        // Browser globals
        factory(root.ko);
    }
}(this, function (ko) {
    var addTrailingSlash = function(path) {
        return path && path.replace(/\/?$/, "/");
    };

    // Get a new native template engine to start with
    var engine = new ko.nativeTemplateEngine(),
        sources = {};

    engine.defaultPath = "templates";
    engine.defaultSuffix = ".tmpl.html";
    engine.ajax = function(options) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                options.success(xhr.responseText);
            }
        };
        xhr.open("GET", options.url, true);
        xhr.send(null);
    };

    // Create a template source that loads its template using the require.js text plugin
    ko.templateSources.remoteTemplate = function (key) {
        this.key = key;
        this.template = ko.observable(" "); //content has to be non-falsey to start with
        this.requested = false;
        this.retrieved = false;
    };

    ko.templateSources.remoteTemplate.prototype.text = function () {
        //when the template is retrieved, check if we need to load it
        if (!this.requested && this.key) {
            engine.ajax({
                url: [addTrailingSlash(engine.defaultPath) + this.key + engine.defaultSuffix].join(""),
                success: function (templateContent) {
                    this.retrieved = true;
                    this.template(templateContent);
                }.bind(this)
            });

            this.requested = true;
        }

        //if template is currently empty, then clear it
        if (!this.key) {
            this.template("");
        }

        //always return the current template
        if (arguments.length === 0) {
            return this.template();
        }
    };

    //our engine needs to understand when to create a "requireTemplate" template source
    engine.makeTemplateSource = function (template, doc) {
        var el;

        //if a name is specified, then use the
        if (typeof template === "string") {
            //if there is an element with this id and it is a script tag, then use it
            el = (doc || document).getElementById(template);

            if (el && el.tagName.toLowerCase() === "script") {
                return new ko.templateSources.domElement(el);
            }

            //otherwise pull the template in using the AMD loader's text plugin
            if (!(template in sources)) {
                sources[template] = new ko.templateSources.remoteTemplate(template);
            }

            //keep a single template source instance for each key, so everyone depends on the same observable
            return sources[template];
        }
            //if there is no name (foreach/with) use the elements as the template, as normal
        else if (template && (template.nodeType === 1 || template.nodeType === 8)) {
            return new ko.templateSources.anonymousTemplate(template);
        }
    };

    //override renderTemplate to properly handle afterRender prior to template being available
    engine.renderTemplate = function (template, bindingContext, options, templateDocument) {
        var templateSource = engine.makeTemplateSource(template, templateDocument),
            existingAfterRender = options && options.afterRender;

        //wrap the existing afterRender, so it is not called until template is actuall retrieved
        if (typeof existingAfterRender === "function" && templateSource instanceof ko.templateSources.remoteTemplate && !templateSource.retrieved) {
            options.afterRender = function () {
                if (templateSource.retrieved) {
                    existingAfterRender.apply(this, arguments);
                }
            };
        }

        return engine.renderTemplateSource(templateSource, bindingContext, options);
    };

    //expose the template engine at least to be able to customize the path/suffix/plugin at run-time
    ko.remoteTemplateEngine = engine;

    //make this new template engine our default engine
    ko.setTemplateEngine(engine);

}));
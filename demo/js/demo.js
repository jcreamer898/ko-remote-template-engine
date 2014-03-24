var viewModel = {
    name: ko.observable('main'),
    items: ko.observableArray()
};

ko.applyBindings(viewModel);

viewModel.items.push("foo", "bar", "bam")

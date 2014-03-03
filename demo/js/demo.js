var viewModel = {
    name: ko.observable('main')
};

ko.applyBindings(viewModel);

setTimeout(function() {
    viewModel.name('main');
}, 500);
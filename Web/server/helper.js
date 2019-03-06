var register = (Handlebars) => {
    var helpers = {
        getCurrentYear: () => new Date().getFullYear(),
        getProjectName: () => 'Cuisto',
        screamIt: (text) => text.toUpperCase(),
        ifEquals: (arg1, arg2, options) => {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        },
        capitalize: (...args) => {
            args = args.splice(0, args.length - 1);
            return args.join(' ').toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
        }
    }

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        return helpers;
    }
};


module.exports = {
    register,
    helpers: register(null)
};
export default {
	entry: "dist/index.js",
	dest: "dist/bundles/angular-cqrs.umd.js",
	sourceMap: false,
	format: "umd",
	moduleName: "angular.cqrs",
	globals: {
		"@angular/core": "ng.core",
		"@angular/common": "ng.common",
		"rxjs/Observable": "Rx",
		"rxjs/Subject": "Rx"
	}
};
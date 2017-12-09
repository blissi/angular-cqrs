export default {
	input: "dist/index.js",
	output: {
		file: "dist/bundles/angular-cqrs.umd.js",
		sourcemap: false,
		format: "umd",
		name: "angular.cqrs"
	},
	globals: {
		"@angular/core": "ng.core",
		"@angular/common": "ng.common",
		"rxjs/Observable": "Rx",
		"rxjs/Subject": "Rx"
	}
};
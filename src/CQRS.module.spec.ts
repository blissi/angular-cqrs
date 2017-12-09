import {TestBed} from "@angular/core/testing";
import {CQRSModule} from "./CQRS.module";
import {CQRSService} from "./CQRS.service";
import {expect} from "chai";

declare let Zone: any;

describe("CQRSModule", function () {
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				CQRSModule.forRoot({
					eventDefinition: {
						name: "event"
					},
					
					commandDefinition: {
						name: "command"
					}
				})
			]
		});
	});

	
	it("provides the CQRSService", () => {
		const service = TestBed.get(CQRSService);
		expect(service).to.be.ok;
	});
});
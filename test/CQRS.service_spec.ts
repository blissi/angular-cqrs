import {CQRSService} from "../src/CQRS.service";
import {expect} from "chai";
import * as sinon from "sinon";


describe("CQRSService", function () {

	let sut: CQRSService;
	
	beforeEach(() => {
		sut = new CQRSService({
		});
	});

	it("calls the command sender.", () => {
		const sentCommands: any[] = [];
		sut.onCommand(cmd => sentCommands.push(cmd));
		
		let cmd = {
			command: "cmd1"
		};
		sut.sendCommand(cmd);
		
		expect(sentCommands).to.have.lengthOf(1);
		expect(sentCommands[0]).to.eql(cmd);
	});
	
	describe("command callbacks", function () {
		
		let cmd = {
			id: "1234",
			command: "cmd1"
		};
		
		let commandCallback: sinon.SinonSpy;
		
		beforeEach(() => {
			commandCallback = sinon.spy();
			
			sut.onCommand(cmd => sut.eventReceived({
				commandId: cmd.id,
				payload: {
					data: "response"
				}
			}));
		});
		
		it("calls the command callback when the corresponding event for a command has been received.", () => {
			sut.sendCommand(cmd, commandCallback);
			
			expect(commandCallback.calledOnce).to.be.true;
			expect(commandCallback.args[0]).to.eql([{
				commandId: cmd.id,
				payload: {
					data: "response"
				}
			}]);
		});
		
		it("removes the command callback immediately when the event for a command has been received.", () => {
			sut.sendCommand(cmd, commandCallback);
			sut.eventReceived({
				commandId: cmd.id
			});
			
			expect(commandCallback.calledOnce).to.be.true;
		});
		
		it("removes all command callbacks when ngOnDestroy is called", () => {
			sut.onCommand(cmd => {});
			
			sut.sendCommand(cmd, commandCallback);
			sut.ngOnDestroy();
			sut.eventReceived({
				commandId: cmd.id
			});
			
			expect(commandCallback.notCalled).to.be.true;
		});
	});
});
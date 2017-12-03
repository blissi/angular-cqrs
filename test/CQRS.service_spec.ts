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
		const sender = sinon.spy();
		sut.onCommand(sender);
		
		let cmd = {
			command: "cmd1"
		};
		sut.sendCommand(cmd);
		
		expect(sender.calledOnce).to.be.true;
		expect(sender.args[0]).to.eql([cmd]);
	});
	
	describe("command callbacks", function () {
		
		let cmd = {
			id: "1234",
			command: "cmd1"
		};
		
		const matchingEvent = {
			commandId: cmd.id,
			payload: {
				data: "response"
			}
		};
		
		let commandCallback: sinon.SinonSpy;
		
		beforeEach(() => {
			commandCallback = sinon.spy();
		});
		
		it("calls the command callback when the corresponding event for a command has been received.", () => {
			sut.sendCommand(cmd, commandCallback);
			
			sut.eventReceived(matchingEvent);
			
			expect(commandCallback.calledOnce).to.be.true;
			expect(commandCallback.args[0][0]).to.eql({
				commandId: cmd.id,
				payload: {
					data: "response"
				}
			});
		});
		
		it("calls the command callback multiple times when done() is not called by the command handler.", () => {
			sut.sendCommand(cmd, commandCallback);

			sut.eventReceived(matchingEvent);
			sut.eventReceived(matchingEvent);
			sut.eventReceived(matchingEvent);
			
			expect(commandCallback.calledThrice).to.be.true;
		});
		
		it("doesn't call the command callback any further if the done()-function was called and therefore the command is marked as handled.", () => {
			sut.sendCommand(cmd, commandCallback);
			sut.eventReceived(matchingEvent);
			expect(commandCallback.calledOnce).to.be.true;
			
			const done = commandCallback.args[0][1];
			done();
			
			sut.eventReceived(matchingEvent);
			
			expect(commandCallback.calledOnce).to.be.true;
		});
		
		it("removes all command callbacks when ngOnDestroy is called", () => {
			sut.sendCommand(cmd, commandCallback);
			sut.ngOnDestroy();
			sut.eventReceived(matchingEvent);
			
			expect(commandCallback.notCalled).to.be.true;
		});
	});
});
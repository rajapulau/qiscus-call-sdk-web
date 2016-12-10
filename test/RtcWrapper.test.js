// let's mock the WebScoket first
window.WebSocket = function(){
  return {}
}

console.info("WebSocket", ("WebSocket" in window));

import RtcWrapper from '../src/sdk/RtcWrapper'
// const RtcWrapper = require('../src/sdk/RtcWrapper')
const chai = require('chai')
const wrapper = new RtcWrapper('wss://echo.websocket.org');


chai.should();

test('Create empty wrapper object', () => {
  RtcWrapper.wrapper.should.equal(null);
});
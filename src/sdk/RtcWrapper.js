export default class RtcWrapper {
  constructor(address, callback) {
    this.wrapper           = null;
    this.createWrapper(this.address);
  }
  createWrapper(address) {
    this.wrapper = new WebSocket(address, 'halodoc-janus-protocol');
    this.wrapper.onerror   = this.onError;
    this.wrapper.onmessage = () => this.onMessage;
    this.wrapper.onopen    = () => this.onOpen;
    this.wrapper.onclose   = () => this.onClose;
  }
  onError(error) {
    console.error('Wrapper failing', error);
    this.wrapper = null;
  }
  onMessage() {
  }
  onOpen() {}
  onClose() {
    console.info('Disconnected from wrapper (closed)')
    this.wrapper = null;
  }
}

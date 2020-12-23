const DIALOG_MESSAGE_ID = 'dialog__message';
class DialogMessage {
    constructor(hostedElementId, text, yesButtonFunction, dialogMessageClassname) {
        this.hostedElementId = hostedElementId;
        this.text = text;
        this.yesButtonFunction = yesButtonFunction;
        this.dialogMessageClassname = dialogMessageClassname;

        if (document.getElementById(DIALOG_MESSAGE_ID)) {
            this.element = document.getElementById(DIALOG_MESSAGE_ID);
            this.dettach();
        }


    }
    create() {

        const hostedElement = document.getElementById(this.hostedElementId);
        const dgMsgElement = document.createElement('div');
        dgMsgElement.className = this.dialogMessageClassname;
        dgMsgElement.textContent = this.text;
        dgMsgElement.id = DIALOG_MESSAGE_ID;

        const hostedElementPosLeft = hostedElement.offsetLeft; //==> x
        const hostedElementPosTop = hostedElement.offsetTop; //==> y
        const hostedElementHeight = hostedElement.clientHeight;
        const hostedElementWidth = hostedElement.clientWidth;

        const x = hostedElementPosLeft - 250;
        const y = hostedElementPosTop - hostedElementHeight + 35;

        dgMsgElement.style.position = 'absolute';
        dgMsgElement.style.top = y + 'px';
        dgMsgElement.style.left = x + 'px';

        dgMsgElement.innerHTML = `<div class="dialog__msg">${this.text}
                                  </div>
                                  </hr>                        
                                  <button class="button button-success button-small" id="dialog__msg_yes_btn" class="">Yes</button>
                                  <button class="button button-cancel button-small" id="dialog__msg_no_btn" class="">No</button>`;
        this.element = dgMsgElement;
    }
    attach() {
        this.create();

        const hostedElement = document.getElementById(this.hostedElementId);
        hostedElement.insertAdjacentElement('afterend', this.element);
        const yesBtn = document.getElementById('dialog__msg_yes_btn');
        const noBtn = document.getElementById('dialog__msg_no_btn');
        yesBtn.addEventListener('click', this.yesButtonFunction);
        noBtn.addEventListener('click', this.dettach.bind(this));

        // this.element.closest('td').style.position = 'relative';
        // element = this.element;
    }
    dettach() {
        // event.preventDefault();
        this.element.remove();
    }
}

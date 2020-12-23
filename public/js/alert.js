class AlertType {
    static Success = 'success';
    static Warning = 'warning';
}
let timeoutHandle;
class Alert {
    constructor(alertType, msg) {
        this.alert = document.getElementById('alert-msg');
        if (this.alert == null) {
            this.render();
        }
        this.alertType = alertType;
        this.message = msg;

        this.clearAlert();
    }

    render() {
        const createdElement = document.createElement('div');
        createdElement.classList.add('alert');
        createdElement.id = 'alert-msg';
        const targetElement = document.getElementsByTagName('body')[0];
        targetElement.insertAdjacentElement('beforeend', createdElement);
        this.alert = document.getElementById('alert-msg');;
    }

    show() {
        this.alert.classList.add('alert', 'visible', 'fadeIn', this.alertType);
        this.alert.textContent = this.message;
        this.alert.classList.add(this.alertType);
        timeoutHandle = window.setTimeout(function () {
            const alert = document.getElementById('alert-msg');
            alert.classList.remove('fadeIn');
            alert.classList.add('fadeOut');
            window.setTimeout(function () {
                alert.className = '';
                alert.innerHTML = '';
            }, 200)
        }, 5000)
    }

    clearAlert() {
        this.alert.className = '';
        this.alert.innerHTML = '';
        window.clearTimeout(timeoutHandle);
    }
}
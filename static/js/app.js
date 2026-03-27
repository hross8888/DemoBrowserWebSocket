const statusEl = document.getElementById("status");
const formEl = document.getElementById("message-form");
const inputEl = document.getElementById("message-input");
const messagesEl = document.getElementById("messages");
const errorEl = document.getElementById("error");

const protocol = window.location.protocol === "https:" ? "wss" : "ws";

let ws = null;
let reconnectTimer = null;

function connect() {
    ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

    ws.onopen = function () {
        statusEl.textContent = "Соединение установлено";
        errorEl.textContent = "";

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    };

    ws.onclose = function () {
        statusEl.textContent = "Соединение потеряно. Переподключение...";

        if (!reconnectTimer) {
            reconnectTimer = setTimeout(function () {
                reconnectTimer = null;
                connect();
            }, 1500);
        }
    };

    ws.onerror = function () {
        statusEl.textContent = "Ошибка WebSocket";
    };

    ws.onmessage = function (event) {
        errorEl.textContent = "";

        const data = JSON.parse(event.data);

        if (data.type === "error") {
            errorEl.textContent = data.message;
            return;
        }

        if (data.type === "message") {
            const li = document.createElement("li");
            li.textContent = data.text;
            messagesEl.appendChild(li);
        }
    };
}

inputEl.addEventListener("input", function () {
    if (errorEl.textContent) {
        errorEl.textContent = "";
    }
});

formEl.addEventListener("submit", function (event) {
    event.preventDefault();

    errorEl.textContent = "";

    const text = inputEl.value.trim();
    if (!text) {
        errorEl.textContent = "Введите сообщение";
        return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
        errorEl.textContent = "Нет соединения с сервером";
        return;
    }

    ws.send(JSON.stringify({ text: text }));
    inputEl.value = "";
    inputEl.focus();
});

connect();
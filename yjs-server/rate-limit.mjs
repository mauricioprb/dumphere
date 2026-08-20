export function createMessageRateLimiter(messagesPerSecond, now = () => Date.now(), burstCapacity = messagesPerSecond) {
    const capacity = Math.max(messagesPerSecond, burstCapacity);
    let availableMessages = capacity;
    let lastRefillAt = now();

    return function consume() {
        const currentTime = now();
        const elapsedMs = Math.max(0, currentTime - lastRefillAt);

        if (elapsedMs > 0) {
            availableMessages = Math.min(capacity, availableMessages + (elapsedMs / 1000) * messagesPerSecond);
            lastRefillAt = currentTime;
        }

        if (availableMessages < 1) return false;

        availableMessages -= 1;

        return true;
    };
}

export function guardMessageHandlers(webSocket, consumeMessage, acceptMessage = () => true) {
    const originalOn = webSocket.on;

    webSocket.on = function on(eventName, listener) {
        if (eventName !== 'message') {
            return originalOn.call(this, eventName, listener);
        }

        return originalOn.call(this, eventName, (...arguments_) => {
            if (!consumeMessage()) {
                this.close(1008, 'Message rate exceeded');
                return;
            }

            if (!acceptMessage(arguments_[0])) return;

            listener(...arguments_);
        });
    };

    return () => {
        webSocket.on = originalOn;
    };
}

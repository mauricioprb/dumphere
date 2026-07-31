export function createMessageRateLimiter(maxMessages, now = () => Date.now()) {
    let windowStartedAt = now()
    let messagesInWindow = 0

    return function consume() {
        const currentTime = now()
        if (currentTime - windowStartedAt >= 1000) {
            windowStartedAt = currentTime
            messagesInWindow = 0
        }

        messagesInWindow++

        return messagesInWindow <= maxMessages
    }
}

export function guardMessageHandlers(webSocket, consumeMessage) {
    const originalOn = webSocket.on

    webSocket.on = function on(eventName, listener) {
        if (eventName !== 'message') {
            return originalOn.call(this, eventName, listener)
        }

        return originalOn.call(this, eventName, (...arguments_) => {
            if (!consumeMessage()) {
                this.close(1008, 'Message rate exceeded')
                return
            }

            listener(...arguments_)
        })
    }

    return () => {
        webSocket.on = originalOn
    }
}

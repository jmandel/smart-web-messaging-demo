import uuid4 from 'uuid/v4';
import {Subject} from 'rxjs';

export default function (selfWindow, targetWindow, targetWindowOrigin) {

    const outboundMessages = {};
    const incoming = new Subject();

    selfWindow.addEventListener('message', (event) => {
        if (event.origin !== targetWindowOrigin) {
            return
        }
        if (!event.data.messageId) {
            return
        }
        if (event.data.responseToMessageId) {
            const handler = outboundMessages[event.data.responseToMessageId]
            handler.resolve(event.data.payload)
            delete outboundMessages[event.data.responseToMessageId]
        } else {
            new Promise((resolve, reject) => {
                incoming.next({message: event.data, resolve, reject})
            }).then((payload) => {
                sendMessage({payload}, event.data.messageId)
            })
        }
    })

    const send = function (topic, payload, responseToMessageId) {
        return sendMessage({messageType: topic, payload}, responseToMessageId)
    }

    const sendMessage = function (message, responseToMessageId) {
        const uuid = uuid4();
        targetWindow.postMessage({
            ...message,
            'messageId': uuid,
            'responseToMessageId': responseToMessageId
        }, targetWindowOrigin)
        if (responseToMessageId) {
            return;
        }
        return new Promise((resolve, reject) => {
            outboundMessages[uuid] = { resolve, reject }
        })
    }

    incoming.subscribe((args)=>{
        const {message, resolve, reject} = args
        if(message.messageType === 'status.ping'){
            resolve("pong")
        }
    })

    return { send, sendMessage, incoming }
}
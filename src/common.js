import uuid4 from 'uuid/v4';
import {Subject} from 'rxjs';

export default function (selfWindow, targetWindow, targetWindowOrigin) {

    const outboundMessages = {};
    const incoming = new Subject();

    selfWindow.addEventListener('message', (event) => {
        if (event.origin !== targetWindowOrigin) {
            return
        }
        if (!event.data.messageId || !event.data.body) {
            return
        }
        if (event.data.responseToMessageId) {
            const handler = outboundMessages[event.data.responseToMessageId]
            handler.resolve(event.data.body)
            delete outboundMessages[event.data.responseToMessageId]
        } else {
            new Promise((resolve, reject) => {
                incoming.next({body: event.data.body, resolve, reject})
            }).then((resolveBody) => {
                sendBody(resolveBody, event.data.messageId)
            })
        }
    })

    const send = function (topic, body, responseToMessageId) {
        return sendBody({messageType: topic, payload: {...body}}, responseToMessageId)
    }

    const sendBody = function (body, responseToMessageId) {
        const uuid = uuid4();
        targetWindow.postMessage({
            'messageId': uuid,
            'responseToMessageId': responseToMessageId,
            'body': body
        }, targetWindowOrigin)
        if (responseToMessageId) {
            return;
        }
        return new Promise((resolve, reject) => {
            outboundMessages[uuid] = { resolve, reject }
        })
    }

    incoming.subscribe((args)=>{
        const {body, resolve, reject} = args
        if(body.messageType === 'status.ping'){
            resolve("pong")
        }
    })

    return { send, sendBody, incoming }
}
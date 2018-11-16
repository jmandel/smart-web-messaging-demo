import React from 'react'
import ReactDOM from 'react-dom'
import messagingBuilder from './common'

// in real life, get this from the OAuth access token response
const accessTokenResponse = {
  'smart_messaging_origin': window.location.origin
}

const ehrWindow = window.parent || window.opener
const ehrWindowOrigin = accessTokenResponse.smart_messaging_origin
const messaging = messagingBuilder(window, ehrWindow, ehrWindowOrigin)

messaging
.send('status.ping')
.then(pong => console.log('Ping response: ', pong))

ReactDOM.render(
  <div>App iframe
    <br></br>
    <button onClick={function(){
        messaging
        .send('ui.done', {
          activityType: 'web-search',
          activityParameters: {
            webQuery: 'web messaging tutorial'
          }
        })
        .then(response => {
          console.log(response.success ? ':-)' : ':-(', response.details)
          window.document.body.classList.add('closing')
        })
      }}>
      I'm done!
    </button>
  </div>,
  document.getElementById('content')
);
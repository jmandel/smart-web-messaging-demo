import React from 'react';
import ReactDOM from 'react-dom';

const appWindow = window.parent || window.opener

import messagingBuilder from './common'

class EmbeddedApp extends React.Component {
  componentDidMount() {
        const appIframe = this.refs.appIframe
        const messaging = messagingBuilder(window, appIframe.contentWindow, this.props.origin)
        const that = this

        messaging.incoming.subscribe(({message, resolve, reject})=>{
          if (message.messageType == 'ui.done') {
            resolve({
              success: true,
              details: 'okay, closing you in 2s!'
            })

            setTimeout(function(){
                that.setState({
                  appDone: true,
                  q: message.payload.activityParameters.webQuery})
              }, 2000)
            }
          })
    }

    render() {
      if (!this.state || !this.state.appDone)
        return <iframe src={this.props.baseUrl} ref='appIframe'/>

    return <div>
      <a target='_blank' href={'http://bing.com/search?q='+this.state.q}>
      Suggested search
      </a>
    </div>

  }
}
 
ReactDOM.render(
  <div>EHR Host Window<br></br><br></br>
    <EmbeddedApp baseUrl='app.html' origin={window.location.origin}/>
  </div>,
  document.getElementById('content')
);

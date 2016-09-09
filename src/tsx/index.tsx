/// <reference path="../../typings/tsd.d.ts" />
import * as React from "react";
import * as ReactDOM from "react-dom";
require('../css/index.css');
import * as desktop from "./component/desktop.tsx";
import * as config from "./config.ts";
import * as github from "./widgets/github.tsx";

class App extends React.Component<{ widgets: desktop.AppIcon[] },
    {
        alerts?: { msg: string, className: string }[],
        renderCount?: number
    }> {
    constructor() {
        super();
        let self = this;
        self.state = { alerts: [], renderCount: 0 };
        config.config.alert = (msg, className, timeout) => {
            let pair = {
                msg: msg,
                className: className || "alert alert-success alert-dismissible fade in"
            };
            self.state.alerts.push(pair);
            self.setState({ alerts: self.state.alerts });
            var index = setTimeout(() => {
                let tmp = self.state.alerts;
                let n = tmp.indexOf(pair);
                self.setState({ alerts: tmp.slice(0, n).concat(tmp.slice(n + 1, tmp.length)) });
                clearTimeout(index);
            }, timeout || config.config.defaultAlertTimeout);
        };
        config.config.error = (msg, timeout) => config.config.alert(msg, "alert alert-danger alert-dismissible fade in", timeout || config.config.defaultErrorTimeout);
    }
    render() {
        let self = this;
        return <div style={{
            width: '100%',
            height: '100%'
        }}>
            <desktop.Desktop  appIcons={self.props.widgets} showStartmenu={true}/>
            {
                self.state.alerts ? self.state.alerts.map((alert, index) => <div key={index} style={{
                    position: 'fixed',
                    top: 55 * index + 20,
                    right: 20,
                    width: 300,
                    height: 53,
                    zIndex: 9999999
                }} className={alert.className} role="alert">
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
                    <strong>{alert.msg}</strong>
                </div>) : null
            }
        </div>;
    }
}
(() => {
    document.body.removeChild(document.getElementById("preloading-style"));
    document.body.removeChild(document.getElementById("precontainer"));
    let container = document.getElementById("container");
    container.style.display = '';
    ReactDOM.render(<App widgets={
        [
            {
                text: "Bing",
                icon: require("../imgs/bing.png"),
                url: "https://www.bing.com"
            },
            {
                text: "Google",
                icon: require("../imgs/google.png"),
                url: "https://www.google.com"
            },
            {
                text: "Jolie",
                icon: require("../imgs/tomb raider.png"),
                content: <img src={require("../imgs/angelina jolie.jpg") } alt='图片查看'  style= {{
                    maxHeight: 700
                }} />
            },
            github.app
        ]
    }/>, container);
})();

/// <reference path="../../../typings/tsd.d.ts" /> 
let defaultIconSrc = require("../../imgs/default-app-icon.png");
let startIcon = require("../../imgs/start.png");
let browserIcon = require("../../imgs/browser.png");
let imageViewIcon = require("../../imgs/image-view.png");
require('../../css/desktop.css');
import * as React from "react";
import * as config from "../config.ts";
export interface AppIcon {
    text: string
    icon?: string
    content?: JSX.Element,
    url?: string
    title?: string,
    maximum?: boolean,
    covered?: boolean,
    zIndex?: number,
    top?: number
}
interface InnerAppIcon extends AppIcon {
    top: number
    left: number
    index: number
}
import * as widget from "./widget.tsx";
export class Desktop extends React.Component<{
    appIcons: AppIcon[],
    showStartmenu?: boolean
}, {
        openedIcons?: InnerAppIcon[],
        currentIndex?: number,
        showStartmenu?: boolean,
        showAppSwitcher?: boolean,
        appSwitcherSelectedAppIndex?: number
    }> {
    private hiddenStartmenuing: boolean
    constructor() {
        super();
        let self = this;
        self.state = {
            openedIcons: [],
            currentIndex: 0,
            showStartmenu: false,
            showAppSwitcher: false,
            appSwitcherSelectedAppIndex: 0
        };
        self.config();
        self.removeMenuAndHandleResize();
        self.registerHotkey();
    }
    private itemWidth = 88
    private itemHeight = 96
    private objectIndexCount = 0
    private appSwitchStarted = false
    private lastOpenWindowTime: Date = new Date(1997, 7)
    private lastSwitchedTime: Date = new Date(1997, 7)
    private config() {
        let self = this;
        let func = (icon: AppIcon): { close: () => void } => {
            let app = self.handleClick(icon);
            return { close: () => app && self.handleClose(app.index) };
        };
        config.config.openUrl = (url, title, icon) => func({
            text: title,
            icon: icon || browserIcon,
            title: title,
            url: url
        });
        config.config.openContent = (content, title, icon) => func({
            text: title,
            icon: icon || defaultIconSrc,
            title: title,
            content: content
        });
        config.config.openImage = (src, title) => func({
            text: title || '图片查看',
            icon: imageViewIcon,
            title: title || '图片查看',
            covered: true,
            top: (document.body.clientHeight - 700) / 2,
            zIndex: 103,
            content: <img src={src} alt={title || '图片查看'} style={{
                maxHeight: 700
            }} />
        });
    }
    private removeMenuAndHandleResize() {
        let self = this;
        window.onresize = () => {
            self.setState({
                showStartmenu: false
            });
        };
        document.oncontextmenu = () => {
            event.cancelBubble = true
            event.returnValue = false;
            return false;
        };
        document.onmousedown = (e) => {
            if (window["Event"]) {
                if (e.which == 2 || e.which == 3)
                    return false;
            }
            else if (event["button"] == 2 || event["button"] == 3) {
                event.cancelBubble = true
                event.returnValue = false;
                return false;
            }
        };
    }
    private registerHotkey() {
        let self = this;
        document.onkeydown = (e: KeyboardEvent) => {
            if (e && e.altKey) {
                if (e.keyCode == 76) {//alt+l
                    if (self.state.openedIcons.length > 1) {
                        if (!self.state.showAppSwitcher) {
                            self.lastSwitchedTime = new Date();
                            self.setState({ showAppSwitcher: true, showStartmenu: false });
                        }
                        self.appSwitchStarted = true;
                    }
                } else if (e.keyCode == 67) {//alt+c ==>close currentIndex
                    self.handleClose(self.state.currentIndex);
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.keyCode == 83) {
                    if (self.appSwitchStarted) {
                        self.closeAppSwitcher();
                    }
                    if (!self.state.showStartmenu) {
                        self.setState({ showStartmenu: true });
                    }
                }
                e.stopPropagation();
                e.preventDefault();
            }
        };
        document.onkeyup = (e) => {
            if (self.appSwitchStarted) {
                if (e.keyCode == 76) {
                    let diff = new Date().getTime() - self.lastSwitchedTime.getTime();
                    if (diff < 1500) self.switchApp();
                    else self.closeAppSwitcher();
                } else {
                    self.closeAppSwitcher();
                }
            }
        };
    }
    private closeAppSwitcher() {
        let self = this;
        self.setState({ showAppSwitcher: false });
        self.appSwitchStarted = false;
    }
    private switchApp() {
        let self = this;
        self.lastSwitchedTime = new Date();
        let array = self.state.openedIcons;
        let tmpIndex = -1;
        let length = array.length;
        for (let index = 0; index < length; index++) {
            let element = array[index];
            if (element.index == self.state.appSwitcherSelectedAppIndex) {
                tmpIndex = index;
            }
        }
        if (tmpIndex == -1 || tmpIndex == length - 1) tmpIndex = 0;
        else tmpIndex += 1;
        self.setState({
            appSwitcherSelectedAppIndex: self.state.openedIcons[tmpIndex].index,
            currentIndex: self.state.openedIcons[tmpIndex].index
        });
    }
    private handleClick(item: AppIcon): InnerAppIcon {
        let self = this;
        let now = new Date();
        let diff = new Date().getTime() - self.lastOpenWindowTime.getTime();
        if (diff < 500) {
            config.config.alert("请求打开窗体频率太快,请稍候再试");
            return null;
        }
        self.lastOpenWindowTime = now;
        let array = self.state.openedIcons;
        let len = self.state.openedIcons.length;
        if (len + 1 > 12) {
            config.config.error("打开的窗体太多,请关掉一部分");
        } else {
            let windowCount = 5;
            let gap = 80;
            let ap = {
                text: item.text,
                icon: item.icon,
                content: item.content,
                title: item.title,
                maximum: item.maximum,
                covered: item.covered,
                url: item.url,
                zIndex: item.zIndex,
                left: ((len / windowCount) + len % windowCount) * gap + gap,
                top: item.top == undefined ? (len % windowCount) * gap + gap : item.top,
                index: ++self.objectIndexCount
            };
            array.push(ap);
            self.setState({
                openedIcons: array,
                currentIndex: self.objectIndexCount,
                appSwitcherSelectedAppIndex: self.objectIndexCount
            });
            return ap;
        }
        return null;
    }
    private handleSelected(icon: InnerAppIcon) {
        let self = this;
        self.setState({
            currentIndex: icon.index
        });
    }
    private handleClose(appIndex: number) {
        let self = this;
        let array = self.state.openedIcons;
        let target: InnerAppIcon[] = [];
        for (let index = 0; index < array.length; index++) {
            let element = array[index];
            if (element.index == appIndex) continue;
            target.push(element);
        }
        let length = target.length;
        let index = length > 0 ? target[length - 1].index : 0
        self.setState({
            openedIcons: target,
            appSwitcherSelectedAppIndex: index,
            currentIndex: index
        });
    }
    render() {
        let self = this;
        let w = document.body.clientWidth;
        let h = document.body.clientHeight - self.itemHeight - 48;
        let topIndex = -1, leftIndex = 0;
        let windows: any;
        let tasks: any;
        if (self.state.openedIcons) {
            let rights = self.state.openedIcons;
            windows = rights.map(icon => <widget.Widget
                content={icon.content} title={icon.title || icon.text} icon={icon.icon} top={icon.top} left={icon.left}
                zIndex={icon.zIndex ? icon.zIndex : (icon.index == self.state.currentIndex ? 101 : 100) }
                show={self.state.showStartmenu ? undefined : (self.hiddenStartmenuing ? undefined : (icon.index == self.state.currentIndex ? true : undefined)) }
                onSelected={w => self.handleSelected.bind(self)(icon, icon.index) }  key={icon.index} url={icon.url}
                maximum={icon.maximum } covered={icon.covered} onClosd={w => self.handleClose.bind(self)(icon.index) }/>)
            tasks = rights.map((icon, index) => <div className="taskbar-item" key={icon.index}  style={
                {
                    left: index * 129 + (self.props.showStartmenu ? 32 : 0),
                    paddingLeft: 5,
                    background: icon.index == self.state.currentIndex ? 'linear-gradient( #4169E1, rgba(0, 0, 0, 1), #4169E1)' : ''
                }
            } onClick={e => {
                self.handleSelected.bind(self)(icon);
                e.stopPropagation();
                e.preventDefault();
            } }>
                <img src={icon.icon || defaultIconSrc } alt={icon.text}  />
                <span>{icon.text}</span>
            </div>);
        }
        if (self.hiddenStartmenuing) self.hiddenStartmenuing = false;
        return <div style={{
            width: '100%',
            height: '100%'
        }}> <div className="desktop">
                {
                    self.props.appIcons ? self.props.appIcons.map((item, index) => {
                        let top = self.itemHeight * (++topIndex) + 10;
                        if (top > h) { top = 10; topIndex = 0; leftIndex++; }
                        let left = self.itemWidth * (leftIndex) + 10;
                        return <div  className="appIcon" onClick={e => self.handleClick.bind(self)(item) } key={index}  style={
                            {
                                width: self.itemWidth,
                                height: self.itemHeight,
                                top: top,
                                left: left
                            }
                        }>
                            <img src={item.icon || defaultIconSrc } alt={item.text}  />
                            <span>{item.text}</span>
                        </div>;
                    }) : null
                }
            </div>
            <div className="taskbar">
                {
                    self.props.showStartmenu ? <div className="start"  onClick={e => {
                        self.setState({
                            showStartmenu: true
                        });
                        e.stopPropagation();
                        e.preventDefault();
                        return true;
                    } }>
                        <img src={startIcon} alt="开始"/>
                    </div> : null
                }
                {tasks}
            </div>
            {
                self.state.showAppSwitcher ? <div className="appSwitcher-cover" onClick={e => {
                    self.setState({
                        showAppSwitcher: false
                    });
                    e.stopPropagation();
                    e.preventDefault();
                } }>
                    <div className="appSwitcher-container">
                        <div className="appSwitcher" style={
                            {
                                width: self.state.openedIcons.length * (48 + 5) + 10,
                                left: (document.body.clientWidth - self.state.openedIcons.length * (48 + 5)) / 2
                            }
                        }>
                            {
                                self.state.openedIcons.map((icon, index) => <div key={index}
                                    className="appSwitcher-item" style={{
                                        left: index * 53,
                                        border: self.state.appSwitcherSelectedAppIndex == icon.index ? "2px solid black" : ""
                                    }}>
                                    <img src={icon.icon || defaultIconSrc}/>
                                </div>)
                            }
                        </div>
                    </div>
                </div> : null
            }
            {
                self.state.showStartmenu ? <div className="startmenu-cover" onClick={e => {
                    self.hiddenStartmenuing = true;
                    self.setState({
                        showStartmenu: false
                    });
                    e.stopPropagation();
                    e.preventDefault();
                } }>
                    <div className="startmenu-container">
                        <div className="startmenu">
                            { self.props.appIcons ? self.props.appIcons.filter(x => !(!x.url && !x.content)).map((item, index) => {
                                return <div  className="startmenu-item" onClick={e => self.handleClick.bind(self)(item) } key={index} >
                                    <img src={item.icon || defaultIconSrc } alt={item.text}  />
                                    <span>{item.text}</span>
                                </div>;
                            }) : null}
                        </div>
                    </div>
                </div> : null
            }
            { windows }
        </div >;
    }
};
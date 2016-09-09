/// <reference path="../../typings/tsd.d.ts" /> 
class Config {
    defaultAlertTimeout = 2000
    defaultErrorTimeout = 2000
    alert: (msg: string, className?: string, timeout?: number) => void
    error: (msg: string, timeout?: number) => void
    openUrl: (url: string, title: string, icon?: string) => { close: () => void }
    openContent: (content: JSX.Element, title: string, icon?: string) => { close: () => void }
    openImage: (src: string, title?: string) => { close: () => void }
}

export let config = new Config();
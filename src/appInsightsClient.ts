"use strict";
const appInsights = require("applicationinsights");

export class AppInsightsClient {
    private _client;

    constructor() {
        this._client = appInsights.getClient("a25ddf11-20fc-45c6-96ae-524f47754f28");
    }

    public sendEvent(eventName: string, properties?: { [key: string]: string; }): void {
            this._client.trackEvent(eventName === "" ? "bat" : eventName, properties);
    }
}

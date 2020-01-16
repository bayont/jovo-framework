import { Input, Inputs, JovoRequest, SessionConstants, SessionData } from 'jovo-core';
import _get = require('lodash.get');
import _set = require('lodash.set');

export interface CorePlatformInput extends Input {}

export type RequestType = 'LAUNCH' | 'INTENT' | 'TEXT' | 'EVENT' | 'AUDIO' | 'END' | 'ERROR';
export type DeviceType = 'AUDIO' | 'BROWSER';
export type Capability = 'AUDIO' | 'HTML' | 'TEXT';


export interface Request {
  id: string;
  timestamp: string;
  type: RequestType;
  body: RequestBody;
  locale?: string;
  nlu?: Nlu;
  data?: Record<string, any>;
}

export interface Nlu {
  intent?: string;
  inputs?: Record<string, CorePlatformInput>;
  confidence?: number;
}
export interface RequestBody {
  audio?: {
    sampleRate: number;
    b64string: string;
  },
  text?: string;
  event?: Record<string, any>;
}

export interface Session {
  id: string;
  new: boolean;
  data?: Record<string, any>;
}

export interface User {
  id: string;
  accessToken?: string;
  data?: Record<string, any>;
}

export interface Device {
  id: string;
  type: DeviceType;
  capabilities: Record<Capability, string>;
}

export interface Context {
  appId: string;
  device: Device;
  session: Session;
  user: User;
}

export interface CorePlatformRequestJSON {
  version: string;
  request: Request;
  context: Context;
}

export class CorePlatformRequest implements JovoRequest {

  static fromJSON(json: CorePlatformRequestJSON | string): CorePlatformRequest {
    if (typeof json === 'string') {
      return JSON.parse(json, CorePlatformRequest.reviver);
    } else {
      const corePlatformRequest = Object.create(CorePlatformRequest.prototype);
      // tslint:disable-next-line
      return Object.assign(corePlatformRequest, json);
    }
  }

  static reviver(key: string, value: any): any {
    return key === '' ? CorePlatformRequest.fromJSON(value) : value;
  }

  version: string = '0.01';
  request?: Request;
  context?: Context;

  addInput(key: string, value: string | object): this {
    if (typeof value === 'string') {
      _set(this, `inputs.${key}`, {
        name: key,
        value,
      });
    } else {
      _set(this, `inputs.${key}`, value);
    }

    return this;
  }

  addSessionAttribute(key: string, value: any): this {
    if (this.getSessionAttributes()) {
      _set(this, `session.data.${key}`, value);
    }
    return this;
  }

  addSessionData(key: string, value: any): this {
    return this.addSessionAttribute(key, value);
  }

  getAccessToken(): string | undefined {
    return _get(this, `user.accessToken`);
  }

  getInputs(): Inputs {
    return this.inputs || {};
  }

  getIntentName(): string | undefined {
    if (_get(this, 'nlu.intentName')) {
      return _get(this, 'nlu.intentName');
    }
    return;
  }

  getLocale(): string {
    return _get(this, `request.locale`, '');
  }

  getSessionAttributes(): SessionData {
    return _get(this, 'session.data', {});
  }

  getSessionData(): SessionData {
    return this.getSessionAttributes();
  }

  getSessionId(): string | undefined {
    if (this.session) {
      return this.session.id;
    }
    return;
  }

  getState(): string | undefined {
    return _get(this.getSessionAttributes(), SessionConstants.STATE);
  }

  getSupportedInterfaces(): Record<string, any> {
    return _get(this, `request.supportedInterfaces`, []);
  }

  getTimestamp(): string {
    return _get(this, `request.timestamp`, '');
  }

  getUserId(): string {
    return _get(this, 'user.id');
  }

  hasAudioInterface(): boolean {
    return this.supportsInterface('AudioPlayer');
  }

  hasScreenInterface(): boolean {
    return this.supportsInterface('Display');
  }

  hasVideoInterface(): boolean {
    return this.supportsInterface('VideoApp');
  }

  isNewSession(): boolean {
    return _get(this, `session.new`, true);
  }

  hasTextInput(): boolean {
    return !this.fromVoice || false;
  }

  setAccessToken(accessToken: string): this {
    _set(this, `user.accessToken`, accessToken);
    return this;
  }

  setAudioInterface(): this {
    if (_get(this, 'request.supportedInterfaces')) {
      _set(this, 'request.supportedInterfaces', {
        AudioPlayer: {},
      });
    }
    return this;
  }

  setInputs(inputs: Inputs): this {
    this.inputs = inputs;
    return this;
  }

  setIntentName(intentName: string): this {
    _set(this, 'nlu.intentName', intentName);
    return this;
  }

  setLocale(locale: string): this {
    if (_get(this, `request.locale`)) {
      _set(this, 'request.locale', locale);
    }
    return this;
  }

  setNewSession(isNew: boolean): this {
    if (_get(this, 'session.new')) {
      _set(this, 'session.new', isNew);
    }
    return this;
  }

  setScreenInterface(): this {
    if (_get(this, 'request.supportedInterfaces')) {
      _set(this, 'request.supportedInterfaces', {
        AudioPlayer: {},
        Display: {},
        VideoApp: {},
      });
    }
    return this;
  }

  setSessionAttributes(attributes: SessionData): this {
    if (this.getSessionAttributes()) {
      _set(this, 'session.data', attributes);
    }
    return this;
  }

  setSessionData(sessionData: SessionData): this {
    return this.setSessionAttributes(sessionData);
  }

  setState(state: string): this {
    if (_get(this, 'session.data')) {
      _set(this, `session.data[${SessionConstants.STATE}]`, state);
    }
    return this;
  }

  setTimestamp(timestamp: string): this {
    if (_get(this, `request.timestamp`)) {
      _set(this, 'request.timestamp', timestamp);
    }
    return this;
  }

  setUserId(userId: string): this {
    _set(this, 'user.id', userId);
    return this;
  }

  setVideoInterface(): this {
    if (_get(this, 'request.supportedInterfaces')) {
      _set(this, 'request.supportedInterfaces', {
        AudioPlayer: {},
        Display: {},
        VideoApp: {},
      });
    }
    return this;
  }

  supportsInterface(identifier: string): boolean {
    return this.getSupportedInterfaces()[identifier];
  }

  toJSON(): any {
    return Object.assign({}, this);
  }

  getDeviceName(): string {
    throw new Error('Method not implemented.');
  }
  isNewSessionTemporaryWorkaround(): boolean {
    throw new Error('Method not implemented.');
  }
}

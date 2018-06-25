import { IncomingMessage } from 'http';

export class CustomIncomingMessage extends IncomingMessage {
  data: { [key: string]: any } = {};
}

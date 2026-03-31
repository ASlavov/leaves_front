// types/h3-event.d.ts
import { H3EventContext } from 'h3';

declare module 'h3' {
  interface H3EventContext {
    requestingUserId?: string;
    token?: string;
  }
}

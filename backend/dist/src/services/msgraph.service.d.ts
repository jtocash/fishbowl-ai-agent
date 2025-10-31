import { Client } from "@microsoft/microsoft-graph-client";
import { Email } from "../types/msgraph.types";
export declare const graphClient: Client;
export declare function getMail(): Promise<any>;
export declare function replyToEmail(messageId: string, replyText: string): Promise<void>;
export declare function createSubscription(): Promise<any>;
export declare function renewSubscriptions(): Promise<void>;
export declare function getEmailConversation(messageId: string): Promise<Email[]>;
//# sourceMappingURL=msgraph.service.d.ts.map
import { Client } from "@microsoft/microsoft-graph-client";
import { Email } from "../types/msgraph.types";
declare class MsGraphService {
    private graphClient;
    private credential;
    private initialized;
    private initialize;
    getClient(): Promise<Client>;
    getMail(): Promise<any>;
    replyToEmail(messageId: string, replyText: string): Promise<void>;
    sendEmail(recipientEmail: string, subject: string, body: string): Promise<void>;
    createSubscription(): Promise<any>;
    renewSubscriptions(): Promise<void>;
    clearSubscriptions(): Promise<{
        deletedCount: any;
    }>;
    refreshSubscription(): Promise<{
        newSubscription: any;
        deletedCount: any;
    }>;
    getEmailConversation(messageId: string): Promise<Email[]>;
}
export declare const msGraphService: MsGraphService;
export {};
//# sourceMappingURL=msgraph.service.d.ts.map
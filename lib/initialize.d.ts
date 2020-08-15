import Config from "@webresto/api/modelsHelp/Config";
declare global {
    interface SailsConfig {
        restoapi: Config;
    }
}
export default function ToInitialize(): (cb: any) => any;

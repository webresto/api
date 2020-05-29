import Config from "@webresto/api/modelsHelp/Config";
export default function <T extends keyof Config>(key: T): Promise<PropType<Config, T>>;

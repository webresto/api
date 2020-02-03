import SystemInfo from "@webresto/core/models/SystemInfo";
import Config from "@webresto/api/modelsHelp/Config";

export default async function <T extends keyof Config>(key: T): Promise<PropType<Config, T>> {
  return SystemInfo.use('restoapi', key);
}

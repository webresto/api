import HookTools from "@webresto/core/lib/hookTools";
import afterHook from "@webresto/api/lib/afterHook";
import Config from "@webresto/api/modelsHelp/Config";

declare global {
  interface SailsConfig {
    restoapi: Config
  }
}

export default function ToInitialize() {
  /**
   * List of hooks that required
   */
  const requiredHooks = [
    'webresto-core'
  ];

  return function initialize(cb) {
    /**
     * CONFIG
     */
    if (!HookTools.checkConfig('restoapi')) {
      return cb();
    }

    /**
     * AFTER OTHERS HOOKS
     */
    HookTools.waitForHooks('api', requiredHooks, afterHook);

    return cb();
  }
};

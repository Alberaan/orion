import Bluebird from 'bluebird';
import * as R from 'ramda';
import * as scaleApp from 'scaleapp';
import {VNode} from 'snabbdom/vnode';

const pluginFn: scaleApp.IPluginInitFn = function(core: any) {
  'use strict';

  /* Inicializar el plugin
   */
  const onPluginInit = () => {
    // function placeholder
  };

  /* Liberar medios
   */
  const onPluginDestroy = () => {
    // function placeholder
  };

  const moduleStart: (module: string, config: {}) => any =
  (module, config) => new Bluebird((resolve: any) => core.start(module, config, resolve));

  const moduleStop: (module: string) => any =
  (module) => {
    return new Bluebird((resolve: any) => {
      if (isModuleRunning(module)) {
        core.stop(module, resolve);
      } else {
        resolve();
      }
    });
  };

  const moduleEmit: (startEvent: string, endEvent: string, data: {}) => any =
  (startEvent: string, endEvent: string, data: {}) => {
    return new Bluebird((resolve) => {
      let subscription: any;

      // Subscribirse a cuando el stage haya terminado de mostrar el cast
      subscription = core.on(endEvent, (eventData: {}) => {
          subscription.detach();
          resolve(eventData);
      });

      core.emit(startEvent, data);
    });
  };

  const stopModules: (instanceList: string[]) => any =
  (instanceList) => Bluebird.map(instanceList, moduleStop);

  const stopAllModules: () => any = () => stopAllModulesExcept([]);

  // Esta funcion se encarga de parar todos los modulos, excepto los que estan
  // incluidos en el array pasado
  const stopAllModulesExcept: (noStopInstances: string[]) => any =
  (noStopInstances) => {
    // Hay que parar todos los modulos, excepto los que se pasan
    const runningInstances: any[] = R.without(
      noStopInstances,
      runningModules(),
    );

    return core.scaleApp.stopModules(runningInstances);
  };

  const runningModules: () => any =
  () => R.filter(isModuleRunning, core.lsInstances());

  const isModuleRunning: (instance: string) => boolean = (instance) => core._running[instance];

  const cleanSubscriptions: (subscriptions: any) => void =
  (subscriptions) => {
    let subscription: any;
    for (subscription of R.keys(subscriptions)) {
      if (subscriptions[subscription]) {
        subscriptions[subscription].detach();
      }
    }
  };

  // Extender el core
  core.scaleApp = {
    moduleStart,
    moduleStop,
    moduleEmit,
    stopModules,
    stopAllModules,
    runningModules,
    isModuleRunning,
    cleanSubscriptions,
    stopAllModulesExcept,
  };

  // Extender el sandbox
  core.Sandbox.prototype.scaleApp = {
    moduleStart,
    moduleStop,
    moduleEmit,
    stopModules,
    stopAllModules,
    runningModules,
    isModuleRunning,
    cleanSubscriptions,
    stopAllModulesExcept,
  };

  return {
    init: onPluginInit,
    destroy: onPluginDestroy,
  };
};

export default pluginFn;

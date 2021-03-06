// tslint:disable:no-console
import Bluebird, { any } from 'bluebird';
import program from 'commander';
import * as R from 'ramda';
import localConnectorCreator from './src/lib/connectors/local';
import remoteConnectorCreator from './src/lib/connectors/remote';
import formatterCreator from './src/lib/formatter/cli';
import repositoryCreator from './src/lib/repository/memory';
import {
  ICliModule,
  IElementDefinition,
  IFormattedResult,
  IOptionalElementDefinition,
} from './src/lib/typings';
import { JSONprettify, removeExtension } from './src/lib/utils';
import worldCreator from './src/lib/world';

const debug: boolean = false;
const locale: string = 'es';
const useConnector: number = 1;
const count: number = 1;
const ns: string = 'knave';
const type: string = 'pc';

const connectorCreators: any = {
  0: remoteConnectorCreator({
    debug,
    baseURL: 'https://raw.githubusercontent.com/rmoliva/orion/master/definitions/',
  }),
  1: localConnectorCreator({
    rootPath: './definitions',
  }),
};

const world = worldCreator({
  locale,
  connector: connectorCreators[useConnector],
  repository: repositoryCreator({
    locale,
    elements: {},
  }),
});

const spaces: (n: number) => string = (n) => ' '.repeat(n);

interface IOutInfo {
  depth: number;
  text: string;
}

const print: (element: IElementDefinition, parent: IElementDefinition | null, depth: number, acc: IOutInfo[] ) => void =
(element, parent, depth, acc) => {
  if (element.related) {
    acc.push({depth, text: `${element.text}`});
    R.forEach(
      (keyRelated: any) => {
        const related: any = element.related![keyRelated];
        R.forEach(
          (result: any) => {
            print(result, related, depth + 1, acc);
          },
          related.results,
        );
      },
      R.keys(element.related),
    );
  } else {
    if (parent) {
      acc.push({depth, text: `${parent.text}: ${element.text}`});
    }
  }
};

const accumulator: IOutInfo[] = [];

world.get({
  search: [{ns, type}],
  count,
}).then((data: any) => {
  console.log(JSONprettify(data));

  // R.forEach(
  //   (element: IElementDefinition) => {
  //     console.log(JSONprettify(element));
  //     print(element, null, 0, accumulator);
  //   }, data,
  // );

  // R.forEach((info: IOutInfo) => console.log(`${spaces(info.depth)} ${info.text}`), accumulator);
});

// import { readdirSync, readFileSync, writeFileSync } from 'fs';
// import YAML from 'yaml';
// const testFolder = './definitions/es/osdw';

// readdirSync(testFolder).forEach((file: string) => {
//   const data: any = readFileSync(testFolder + '/' + file);
//   const element: IOptionalElementDefinition = JSON.parse(data);
//   writeFileSync(
//     testFolder + '/' + removeExtension(file) + '.yml',
//     YAML.stringify(element),
//   );
// });

// // import fs from 'fs';
// import * as R from 'ramda';
// import connectorCreator from './src/lib/connectors/local';
// import repositoryCreator from './src/lib/repository/memory';
// import {
//   IElementDefinition,
//   IOptionalElement,
//   IOptionalElementDefinition,
//   IRelatedElement,
//   IRelatedElements,
// } from './src/lib/typings';
// import { JSONprettify } from './src/lib/utils';
// import worldCreator from './src/lib/world';

// import { join } from 'path';
// import folders from './src/lib/file/folders';

// // const f = folders(join(__dirname, 'definitions'));
// // f.folders().then(console.log);

// // const world = worldCreator({
// //   locale: 'es',
// //   connector: connectorCreator({
// //     baseURL: 'https://raw.githubusercontent.com/rmoliva/orion/master/definitions/',
// //   }),
// //   repository: repositoryCreator({
// //     locale: 'es',
// //     elements: {},
// //   }),
// // });

// const world = worldCreator({
//   locale: 'es',
//   connector: connectorCreator({
//     rootPath: './definitions',
//   }),
//   repository: repositoryCreator({
//     locale: 'es',
//     elements: {},
//   }),
// });

// const search: IRelatedElement = {
//   search: [{
//     ns: 'mr',
//     type: 'npc_asset',
//   }],
//   count: 2,
// };

// const checkRelated: (relatedElements: IRelatedElements) => void =
// (relatedElements) => {
//   R.forEach((key: string) => {
//     const related: IRelatedElement = relatedElements[key];
//     if (!related.results) {
//       console.log(`- ${key}: Result not found`);
//     }
//     R.forEach((element: IElementDefinition) => {
//       if (element.related) {
//         checkRelated(element.related);
//       }
//     });
//   }, R.keys(relatedElements));
// };

// world.get(search).then((elements: Array<IOptionalElementDefinition | IOptionalElement>) => {
//   R.forEach((element: IOptionalElementDefinition | IOptionalElement) => {
//     if (element && element.related) {
//       checkRelated(element!.related as IRelatedElements);
//     }
//   }, elements);
//   return elements;
// }).then(R.compose(console.log, JSONprettify));

// import requireDir from 'require-dir';
// import localConnector from './lib/connectors/local';
// import { mythicEvent, mythicEventFocus, mythicEventMeaning } from './lib/definitions/mythic/random_event';
// import { worldDefinition } from './lib/definitions/world';
// import localizeCreator from './lib/localize';
// import {
//   IElement,
//   IElementDefinition,
//   IRelatedElement,
//   IRelatedElements,
//   ITable,
//   ITableLocator
// } from './lib/typings';
// import worldCreator from './lib/world';

// import { debugObject } from './spec/support';

// const world = worldCreator(worldDefinition);

// const slashN: (i: number) => string = R.compose(R.join(''), R.times(() => '-'));

// const translations = requireDir('./translations', {recurse: true});
// const localize = localizeCreator({locale: 'es', debug: false, translations});

// const elementsTexts: (texts: string[], element: IRelatedElement, depth: number ) => void =
// (texts, element, depth) => {
//   if (!element || !element.results) {
//     return;
//   }

//   R.forEach((result: IElementDefinition | IElement) => {
//     // console.log(result)
//     texts.push(`${slashN(depth)} (${result.type}): ${localize.t(result)}`);
//     if (result.related) {
//       R.forEach((key: string) => {
//         const related: IRelatedElement = result.related![key] as IRelatedElement;
//         elementsTexts(texts, related, depth + 1);
//       }, R.keys(result.related));
//     }
//   }, element.results);
// };

// const t = localize.t;

// const elementNew: (definition: IElementDefinition) => void =
// (definition) => {
//   let n: any = { text: localize.t(definition) };

//   if (definition.options) {
//     n = R.set(R.lensProp('options'), R.map(elementNew, definition.options), n);
//   }

//   if (definition.related) {
//     n = R.set(R.lensProp('related'), definition.related, n);
//   }
//   return n;
// };

// const e: any = world.get({
//   search: [{ns: 'mr', type: 'magic'}],
//   count: 2,
// });

// // const ts: string[] = [];
// // elementsTexts(ts, e, 0);
// // debugObject(ts);

// // const definitions: any = [
// //   mythicEvent, mythicEventFocus, mythicEventMeaning
// // ];

// // const lines: string[] = R.map(
// //   (def: IElementDefinition) => {
// //     return R.join('\n', [
// //       '----------------------------------------',
// //       JSON.stringify(elementNew(def), null, 2),
// //     ]);
// //   }, definitions,
// // );

// // fs.writeFile('./definitions.txt', R.join('\n', lines) , function(err) {
// //     if (err) {
// //       return console.log(err);
// //     }
// //     console.log('The file was saved!');
// // });

// // const connector = localConnector({
// //   rootPath: './definitions',
// // });

// // const locator: ITableLocator = {
// //   locale: 'es',
// //   ns: 'mr',
// //   type: 'dungeon',
// // };

// // connector.get(locator).then((data: ITable) => {
// //   console.log(data);
// // });
// // TODO:
// // Add namespace to definitions
// // GIve a name to the saved elements (optional)
// // Categorize definitions
// // Add an icon of definitions
// // Get a list of definitions also by category

// import memoryRepository from './lib/repository/memory';
// import { uuid, IWorldDefinition, ISearchDefinition, ISearchResult } from './lib/typings';
// import { getUUID } from './lib/utils';

// const guid: uuid = getUUID();
// const text: string = 'Test';
// const repository = memoryRepository({
//   locale: 'es',
//   elements: {
//     es: [{
//       ns: 'ns',
//       type: 'item1',
//       guid,
//       text,
//     }, {
//       ns: 'ns',
//       type: 'item2',
//       guid: getUUID(),
//       text: 'Test2',
//     }],
//   },
// });

// repository.get(guid).then(console.log);

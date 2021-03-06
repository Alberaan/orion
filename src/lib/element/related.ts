import Bluebird from 'bluebird';
import * as R from 'ramda';
import elementModule from '../element';
import randomModule from '../random';
import {
  IElementDefinition,
  IOptionalElementDefinition,
  IRelatedElement,
  IRelatedElements,
  IRelatedModule,
  ISearchDefinition,
} from '../typings';
import { compactArray, deepMerge } from '../utils';
import { hasRelated } from './utili';

const relatedModule: IRelatedModule =
(world) => {
  const optionCount: (relatedElement: IRelatedElement) => any =
    R.compose(R.defaultTo(1), R.view(R.lensProp('count')));

  const searchElement: (search: ISearchDefinition[]) => Bluebird<IOptionalElementDefinition> =
    (search) => randomModule(world).random(search).then(elementModule(world).get);

  const oneRelated: (related: IRelatedElement) => Bluebird<IRelatedElement> =
  (related) => {
    return Bluebird.all(
      R.times(() => searchElement(related.search), optionCount(related)),
    ).then((results: IOptionalElementDefinition[]) => {
      return R.set(R.lensProp('results'), compactArray(results), related);
    });
  };

  const processRelated: (relatedMap: IRelatedElements) => Bluebird<IRelatedElements> =
  (relatedMap) => {
    return Bluebird.map(
      R.keys(relatedMap) as string[],
      (key: string) => {
        return oneRelated(relatedMap[key]).then((related: IRelatedElement) => {
          return R.set(R.lensProp(key), related, relatedMap);
        });
      },
    ).then(deepMerge);
  };

  const getElement: (element: IElementDefinition) => Bluebird<IElementDefinition> =
  (element) => {
    return processRelated(element!.related!).then((related: IRelatedElements) => {
      return R.set(R.lensProp('related'), related, element);
    });
  };

  const fetch: (element: IOptionalElementDefinition) => Bluebird<IOptionalElementDefinition> =
  (element) => {
    if (hasRelated(element)) {
      return getElement(element!);
    }
    return Bluebird.resolve(element);
  };

  return {
    fetch,
  };
};

export default relatedModule;

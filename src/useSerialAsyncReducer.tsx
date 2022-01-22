import { useCallback, useMemo } from 'react';
import { isPromiseLike } from './isPromiseLike';
import { useSerialAsyncState } from './useSerialAsyncState';

export function useSerialAsyncReducer<State, Action>(
  reducer: React.Reducer<State, Action>,
  initializer: () => State
): [State, React.Dispatch<(state: State) => Action | PromiseLike<Action>>] {
  const [state, setState] = useSerialAsyncState(initializer);

  const dispatch = useCallback((dispatchAction) => {
    setState(async (state) => {
      const result = dispatchAction(state);
      if (isPromiseLike(result)) {
        return reducer(state, await result);
      } else {
        return reducer(state, result);
      }
    });
  }, []);

  return useMemo(() => [state, dispatch], [state, dispatch]);
}

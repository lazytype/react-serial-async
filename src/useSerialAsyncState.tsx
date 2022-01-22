import { useCallback, useMemo, useRef, useState } from 'react';
import { isPromiseLike } from './isPromiseLike';
import { useEventLog } from './useEventLog';

type GetNextState<State> = (state: State) => State | PromiseLike<State>;
export type SetState<State> = (
  ...args: [state: State] | [getNextState: GetNextState<State>]
) => void;

export function useSerialAsyncState<State>(
  initializer: () => State
): readonly [State, SetState<State>] {
  const initialState = useMemo(initializer, [initializer]);
  const stateRef = useRef(initialState);

  const [, setCounter] = useState(0);

  const setState = useCallback((state: State) => {
    stateRef.current = state;
    setCounter((counter) => counter + 1);
  }, []);

  const processEvent = useCallback(
    (event: State | GetNextState<State>) => {
      if (typeof event === 'function') {
        const result = (event as GetNextState<State>)(stateRef.current);
        if (isPromiseLike(result)) {
          return result.then(setState);
        } else {
          setState(result);
        }
      } else {
        setState(event);
      }
    },
    [setState]
  );

  const logEvent = useEventLog(processEvent);

  const dispatch: SetState<State> = useCallback(
    (stateOrGetNextState) => {
      logEvent(stateOrGetNextState);
    },
    [logEvent]
  );

  return useMemo(
    () => [stateRef.current, dispatch],
    [stateRef.current, dispatch]
  );
}

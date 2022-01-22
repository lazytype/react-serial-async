import React, { useCallback, useContext } from 'react';
import { useSerialAsyncReducer } from './useSerialAsyncReducer';

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' };

interface State {
  count: number;
}

function reducer(state: State, action: Action) {
  const { count } = state;
  switch (action.type) {
    case 'INCREMENT':
      return { count: count + 1 };
    case 'DECREMENT':
      return { count: count - 1 };
    case 'RESET':
      return { count: 0 };
  }
}

const StateContext = React.createContext({ count: 0 });
const DispatchContext = React.createContext<
  React.Dispatch<(state: State) => Action | PromiseLike<Action>>
>(() => {});

async function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function AppWithUseReducer() {
  const [state, dispatch] = useSerialAsyncReducer(reducer, () => ({
    count: 0,
  }));

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <Count />
        <Increment />
        <Decrement />
        <Reset />
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function Count() {
  const { count } = useContext(StateContext);
  return <div>{count}</div>;
}

function Increment() {
  const dispatch = useContext(DispatchContext);
  const onClick = useCallback(
    () =>
      dispatch(async () => {
        await wait(Math.random() * 1000);
        return { type: 'INCREMENT' };
      }),
    [dispatch]
  );
  return <button onClick={onClick}>Increment</button>;
}

function Decrement() {
  const dispatch = useContext(DispatchContext);
  const onClick = useCallback(
    () =>
      dispatch(async () => {
        await wait(Math.random() * 1000);
        return { type: 'DECREMENT' };
      }),
    [dispatch]
  );
  return <button onClick={onClick}>Decrement</button>;
}

function Reset() {
  const dispatch = useContext(DispatchContext);
  const onClick = useCallback(
    () =>
      dispatch(async () => {
        await wait(Math.random() * 1000);
        return { type: 'RESET' };
      }),
    [dispatch]
  );
  return <button onClick={onClick}>Reset</button>;
}

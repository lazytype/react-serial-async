import React, { useCallback, useContext } from 'react';
import { SetState, useSerialAsyncState } from './useSerialAsyncState';

interface State {
  count: number;
}

const StateContext = React.createContext({ count: 0 });
const SetStateContext = React.createContext<SetState<State>>(() => {});

async function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function AppWithUseState() {
  const [state, setState] = useSerialAsyncState(() => ({ count: 0 }));

  return (
    <StateContext.Provider value={state}>
      <SetStateContext.Provider value={setState}>
        <Count />
        <Increment />
        <Decrement />
        <Reset />
      </SetStateContext.Provider>
    </StateContext.Provider>
  );
}

function Count() {
  const { count } = useContext(StateContext);
  return <div>{count}</div>;
}

function Increment() {
  const setState = useContext(SetStateContext);
  const onClick = useCallback(
    () =>
      setState(async ({ count }) => {
        await wait(Math.random() * 1000);
        return { count: count + 1 };
      }),
    [setState]
  );
  return <button onClick={onClick}>Increment</button>;
}

function Decrement() {
  const setState = useContext(SetStateContext);
  const onClick = useCallback(
    () =>
      setState(async ({ count }) => {
        await wait(Math.random() * 1000);
        return { count: count - 1 };
      }),
    [setState]
  );
  return <button onClick={onClick}>Decrement</button>;
}

function Reset() {
  const setState = useContext(SetStateContext);
  const onClick = useCallback(
    () =>
      setState(async () => {
        await wait(Math.random() * 1000);
        return { count: 0 };
      }),
    [setState]
  );
  return <button onClick={onClick}>Reset</button>;
}

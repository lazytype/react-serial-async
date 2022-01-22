import { useCallback, useEffect, useState } from 'react';
import { isPromiseLike } from './isPromiseLike';

export function useEventLog<Event>(
  processEvent: (event: Event) => void | PromiseLike<void>,
  { minimumRetainedEvents = 0 }: { minimumRetainedEvents?: number } = {}
): React.Dispatch<Event> {
  const [events, setEvents] = useState<ReadonlyArray<Event>>([]);
  const [queuedEventCount, setQueuedEventCount] = useState(0);
  const [currentProcessingTask, setCurrentProcessingTask] = useState<unknown>();

  useEffect(() => {
    let previousProcessingTask:
      | { processingTask: PromiseLike<unknown>; isPromiseLike: true }
      | { processingTask: unknown; isPromiseLike: false };

    if (isPromiseLike(currentProcessingTask)) {
      previousProcessingTask = {
        processingTask: currentProcessingTask,
        isPromiseLike: true,
      };
    } else {
      previousProcessingTask = {
        processingTask: currentProcessingTask,
        isPromiseLike: false,
      };
    }

    for (let index = queuedEventCount; index < events.length; index++) {
      if (previousProcessingTask.isPromiseLike) {
        previousProcessingTask.processingTask =
          previousProcessingTask.processingTask.then(() =>
            processEvent(events[index])
          );
      } else {
        const result = processEvent(events[index]);
        if (!isPromiseLike(result)) {
          previousProcessingTask.processingTask = result;
        } else {
          previousProcessingTask = {
            processingTask: result,
            isPromiseLike: true,
          };
        }
      }
    }
    setCurrentProcessingTask(previousProcessingTask.processingTask);
    setQueuedEventCount(events.length);
  }, [currentProcessingTask, queuedEventCount, events, processEvent]);

  useEffect(() => {
    if (queuedEventCount > minimumRetainedEvents) {
      setEvents(events.slice(queuedEventCount));
      setQueuedEventCount(0);
    }
  }, [queuedEventCount, events, minimumRetainedEvents]);

  return useCallback(
    (event: Event) => setEvents((events) => [...events, event]),
    []
  );
}

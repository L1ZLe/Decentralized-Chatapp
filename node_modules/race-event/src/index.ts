/**
 * @packageDocumentation
 *
 * Race an event against an AbortSignal, taking care to remove any event
 * listeners that were added.
 *
 * @example Getting started
 *
 * ```TypeScript
 * import { raceEvent } from 'race-event'
 *
 * const controller = new AbortController()
 * const emitter = new EventTarget()
 *
 * setTimeout(() => {
 *   controller.abort()
 * }, 500)
 *
 * setTimeout(() => {
 *   // too late
 *   emitter.dispatchEvent(new CustomEvent('event'))
 * }, 1000)
 *
 * // throws an AbortError
 * const resolve = await raceEvent(emitter, 'event', controller.signal)
 * ```
 *
 * @example Customising the thrown AbortError
 *
 * The error message and `.code` property of the thrown `AbortError` can be
 * specified by passing options:
 *
 * ```TypeScript
 * import { raceEvent } from 'race-event'
 *
 * const controller = new AbortController()
 * const emitter = new EventTarget()
 *
 * setTimeout(() => {
 *   controller.abort()
 * }, 500)
 *
 * // throws a Error: Oh no!
 * const resolve = await raceEvent(emitter, 'event', controller.signal, {
 *   errorMessage: 'Oh no!',
 *   errorCode: 'ERR_OH_NO'
 * })
 * ```
 *
 * @example Only resolving on specific events
 *
 * Where multiple events with the same type are emitted, a `filter` function can
 * be passed to only resolve on one of them:
 *
 * ```TypeScript
 * import { raceEvent } from 'race-event'
 *
 * const controller = new AbortController()
 * const emitter = new EventTarget()
 *
 * // throws a Error: Oh no!
 * const resolve = await raceEvent(emitter, 'event', controller.signal, {
 *   filter: (evt: Event) => {
 *     return evt.detail.foo === 'bar'
 *   }
 * })
 * ```
 *
 * @example Terminating early by throwing from the filter
 *
 * You can cause listening for the event to cease and all event listeners to be
 * removed by throwing from the filter:
 *
 * ```TypeScript
 * import { raceEvent } from 'race-event'
 *
 * const controller = new AbortController()
 * const emitter = new EventTarget()
 *
 * // throws Error: Cannot continue
 * const resolve = await raceEvent(emitter, 'event', controller.signal, {
 *   filter: (evt) => {
 *     if (...reasons) {
 *       throw new Error('Cannot continue')
 *     }
 *
 *     return true
 *   }
 * })
 * ```
 */

/**
 * An abort error class that extends error
 */
export class AbortError extends Error {
  public type: string
  public code: string | string

  constructor (message?: string, code?: string) {
    super(message ?? 'The operation was aborted')
    this.type = 'aborted'
    this.name = 'AbortError'
    this.code = code ?? 'ABORT_ERR'
  }
}

export interface RaceEventOptions<T> {
  /**
   * The message for the error thrown if the signal aborts
   */
  errorMessage?: string

  /**
   * The code for the error thrown if the signal aborts
   */
  errorCode?: string

  /**
   * When multiple events with the same name may be emitted, pass a filter
   * function here to allow ignoring ones that should not cause the returned
   * promise to resolve.
   */
  filter?(evt: T): boolean
}

/**
 * Race a promise against an abort signal
 */
export async function raceEvent <T> (emitter: EventTarget, eventName: string, signal?: AbortSignal, opts?: RaceEventOptions<T>): Promise<T> {
  // create the error here so we have more context in the stack trace
  const error = new AbortError(opts?.errorMessage, opts?.errorCode)

  if (signal?.aborted === true) {
    return Promise.reject(error)
  }

  return new Promise((resolve, reject) => {
    const eventListener = (evt: any): void => {
      try {
        if (opts?.filter?.(evt) === false) {
          return
        }
      } catch (err: any) {
        emitter.removeEventListener(eventName, eventListener)
        signal?.removeEventListener('abort', abortListener)

        reject(err)
        return
      }

      emitter.removeEventListener(eventName, eventListener)
      signal?.removeEventListener('abort', abortListener)

      resolve(evt)
    }
    const abortListener = (): void => {
      emitter.removeEventListener(eventName, eventListener)
      signal?.removeEventListener('abort', abortListener)

      reject(error)
    }

    emitter.addEventListener(eventName, eventListener)
    signal?.addEventListener('abort', abortListener)
  })
}

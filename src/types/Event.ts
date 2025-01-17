/**
 * Represents an event with a once property and a run method.
 */
export default interface Event {
  /**
   * Indicates whether this event should be triggered only once.
   */
  'once': boolean;

  /**
   * The function to be executed when the event is triggered.
   */
  'run': () => void;
};

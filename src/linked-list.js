/**
 * Represents a linked-list
 */
export default class LinkedList {
  /**
   * Returns the empty list.
   * @return {LinkedList<T>} The empty list
   */
  static nil() {
    return null;
  }

  /**
   * Returns a new list of the concatenation of a head value to another list (the tail). 
   * @param  {T} head - The value to add
   * @param  {LinkedList<T>} tail - The tail list
   * @return {LinkedList<T>} A linked list containing the head and the tail.
   */
  static cons(head, tail) {
    return { head, tail };
  }

  /**
   * Returns true if the list passed is empty.
   * @param  {LinkedList<T>} list - The list to test
   * @return {Boolean} Whether the list is empty
   */
  static isEmpty(list) {
    return list === null || list === undefined;
  }

  /**
   * Produces a list containing elements from the list provided in reversed order.
   * @param  {LinkedList<T>} list - The list to reverse
   * @return {LinkedList<T>} The reversed list
   */
  static reverse(list) {
    return LinkedList.reduce(list, (acc, x) => LinkedList.cons(x, acc), LinkedList.nil());
  }

  /**
   * Produces a new list containing only those elements from the list provided that pass the predicate function.
   * @param  {LinkedList<T>} list - The list to filter
   * @param  {function(x:T):boolean} predicate - The predicate used to test for inclusion in the new list
   * @return {LinkedList<T>} The filtered list
   */
  static filter(list, predicate) {
    return LinkedList.reverse(LinkedList.reduce(list, (acc, x) => predicate(x) ? LinkedList.cons(x, acc) : acc, LinkedList.nil()));
  }

  /**
   * Produces a new list of elements that are the result of mapping elements from an existing list using the selector
   * function provided.
   * @param  {LinkedList<T1>} list - The list to map
   * @param  {function(x:T1):T2} selector - The mapping function
   * @return {LinkedList<T2>} The mapped list.
   */
  static map(list, selector) {
    return LinkedList.reverse(LinkedList.reduce(list, (acc, x) => LinkedList.cons(selector(x), acc), LinkedList.nil()));
  }

  /**
   * Iterates over a list calling the action on each element in the list.
   * @param  {LinkedList<T>} list - The list to iterate
   * @param  {function(x:T)} action - The action to call for each element
   */
  static forEach(list, action) {
    LinkedList.reduce((_, x) => action(x));
  }

  /**
   * Creates an array containing the same elements as the list.
   * @param  {LinkedList<T>}  list - The list to create an array from
   * @param  {Boolean} [isReversedOrder=true] - Whether the elements are stored in reverse order
   * @return {Array<T>} The resulting array
   */
  static toArray(list, isReversedOrder = true) {
    const result = LinkedList.reduce(list, (acc, x) => {
      acc.push(x);
      return acc;
    }, []);
    isReversedOrder && result.reverse();
    return result;
  }

  /**
   * Creates a linked list containing the same elements as the array.
   * @param  {Array<T>}  array - The array to create a list from
   * @param  {Boolean} [isReversedOrder=true] - Whether the elements should be stored in reverse order in the list
   * @return {LinkedList<T>} The resulting list
   */
  static ofArray(array, isReversedOrder = true) {
    const reduce = isReversedOrder ? array.reduce.bind(array) : array.reduceRight.bind(array);
    return reduce((acc, x) => LinkedList.cons(x, acc), LinkedList.nil());
  }

  /**
   * Reduces a value by folding over the elements in a linked list from head to tail.
   * @param  {LinkedList<T>} list - The list to fold over
   * @param  {function(acc:TAcc, x:T):TAcc} accumulate - The function to accumulate a value
   * @param  {TAcc} seed - The initial value for the accumulator
   * @return {TAcc} The final accumulator
   */
  static reduce(list, accumulate, seed) {
    let current = list;
    let acc = seed;
    while (!LinkedList.isEmpty(current)) {
      acc = accumulate(acc, current.head);
      current = current.tail;
    }
    return acc;
  }
}
## RxJs comparison

You can build an observable model/state-tree in a declarative manner using [RxJS](http://reactivex.io/) and it is a more mature library. 

For example, you might do this by using the incremental aggregation operators like `scan(...)` to build primitive operators like `runningTotal(...)` etc. and then `combineLatest(...)` to bring together streams representing property values into streams representing objects. 

This may be suitable for many applications. However, there are some drawbacks to this approach.

1. Requex encourages a "single state atom" which makes it trivial to implement behaviours like undo/redo, hot-reloading etc. In Rx each instance of an aggregation operator (e.g., a `scan(...)`) has mutable state to keep track of its accumulator. Therefore, even simple applications end up with distributed mutable state. This means these behaviours become much harder to implement and reason about.

2. Sometimes a single event can cause changes to multiple parts of your model/state-tree.

Consider the following application.

Inputs:

* `A`, a number, initially `10`
* `B`, a number, initially `8`

Outputs:

* `D`, the absolute difference of the two numbers, initially `2`
* `S`, the sum of the two numbers, initially `18`

Actions/Events:

* `USER_CHANGED_A`, triggered when the user changes `A`'s input value
* `USER_CHANGED_B`, triggered when the user changes `B`'s input value

Model/state-tree structure:

    root: {
      inputs: { a: 10, b: 8 },
      outputs: { d: 2, s: 18 }
    }

If you use Rx, a single update in the application action/event stream can result in multiple updates in the model stream and wasted object allocations. 

For example: 

* action/event `USER_CHANGED_A {payload: 11}` occurs in the application action/event stream
  * triggers `a = 11`
    * triggers `inputs = { a: 11, b: 8}` (through `combineLatest(...)`)
      * triggers `root = { inputs: { a: 11, b: 8}, outputs: { d: 2, s: 18} }` (through `combineLatest(...)`)
  * triggers `d = 3`
    * triggers `outputs = { d: 3, s: 18}` (through `combineLatest(...)`)
      * triggers `root = { inputs: { a: 11, b: 8}, outputs: { d: 3, s: 18} }` (through `combineLatest(...)`)
  * triggers `s = 19`
    * triggers `outputs = { d: 3, s: 19}` (through `combineLatest(...)`)
      * triggers `root = { inputs: { a: 11, b: 8}, outputs: { d: 3, s: 19} }` (through `combineLatest(...)`)

Here 1 event resulted in 3 unneccessary object allocations (1 x `outputs` and 2 x `root`). It also triggered 3 updates to the `root` observable. Therefore, if you weren't scheduling your virtual DOM render and diff using something like `requestAnimationFrame(...)` this could have caused 2 extra virtual DOM diffs and 2 extra DOM patches.

You may be able to reduce this waste in your Rx model using scheduling but this would quickly become complex and hard to reason about.

If you use Requex (or for that matter Redux), this extra waste isn't an issue as the events are reduced by your model in a depth-first manner. In the example application, this means the `inputs` and `outputs` objects would be updated and allocated before the `root` is allocated. This means that each event (or possibly batch of events) only causes a single update to your single state atom.
/*
A State Controller to define and switch between multiple states

Controls activation/deactivation of multiple *state nodes*.
 
A state node could be any node or subnode in /lab
that logically groups multiple entities.

All nodes located in /lab/state/** are included in the list automatically,
but all outside ones MUST be included/grouped manually,
usually during the setup process in one of the scene setup() functions.

You could declare a few root nodes in /lab/state/**:

```
/lab
    /state
       /title
       /menu
       /credits
       /gameOver
```

Each implementing corresponding functionality.

Also you can declare the camera and the overlay layer to be a "game" state:
```
lab.control.state.group('game', [lab.camera, lab.overlay])
```

Now just run transitions between declared states
and they will be automatically activated/shown and deactivated/hidden:

```
lab.control.transitTo('menu')
...
lab.control.transitTo('game')
...
lab.control.transitTo('gameOver')
```

The current state can be requested by calling [lab.control.currentState()](#./lab/control/state/currentState)
or by checking the _env.state_ environment variable.

The current transition can be requested by calling [lab.control.currentTransition()](#./lab/control/state/currentTransition)
or by checking out the _env.transition_ environment variable.
It provides a detailed transition description or an empty string if there is no active transition in progress.

*/


// name directory of all included state nodes
const stateDir  = {}

// list of all included state nodes
const stateList = []

// a structure to represent a group of state nodes as a single state
class GroupState {

    constructor(st) {
        extend(this, st)

        if (!isString(this.name)) throw new Error('Group state MUST have a name')
        if (!isArray(this.states) || this.states.length === 0) throw new Error('Group state MUST have a states list')
    }

    // activate all included states
    activate() {
        this.states.forEach(state => activateState(state))
        this.deactivated = false
    }

    // deactivate all included states
    deactivate() {
        this.states.forEach(state => deactivateState(state))
        this.deactivated = true
    }

    lead() {
        return this.states[0]
    }
}

// include a new state node into the state controller
//
// The state object will be deactivated by default
//
// @param {object} - state node
function include(state) {
    if (!state || !isObj(state) || !state.name) throw new Error('Wrong state node!')

    if (stateDir[state.name]) {
        log.warn(`The state is already included: [${state.name}]`)
    }
    stateDir[state.name] = state
    stateList.push(state)

    deactivateState( state )
}

// include all provided states into the state controller
//
// @param {array/state-node} - the list of state nodes to include
function includeAll(states) {
    if (!states || !isArray(states)) throw new Error(`Array of states is expected!`)
    states.forEach(state => include(state))
}

// includes a group of state nodes under a unifying name
//
// @param {string} name - name of the new state
// @param {array/state-node} - a list of state nodes to group
function group(name, states) {
    this.include(new GroupState({
        __: this,
        name,
        states,
    }))
}

// auto-run by Collider.JAM at the mod setup to scan and include all states in /lab/state/*
function setup() {
    // include all in /lab/state by default if present
    if (lab.state) lab.state._ls.forEach(state => {
        include(state)
    })
}

// checks if the provided state is active
// @param {object/state} - a state node to check
// @returns {boolean} - true if the state is active, false otherwise
function isActive(state) {
    return !state.deactivated
}

// deactivate the state 
// @param {object/state} - a state node to check
function deactivateState(state) {
    if (isFun(state.deactivate)) {
        // direct deactivation
        state.deactivated = true
        state.deactivate()
    } else {
        // staged deactivation
        state.deactivated = true
        if (isFun(state.hide)) {
            state.hide()
        } else {
            state.hidden = true
            if (state.onHide) state.onHide()
        }
        if (isFun(state.pause)) {
            state.pause()
        } else {
            state.paused = true
            if (state.onPause) state.onPause()
        }
        if (isFun(state.disable)) {
            state.disable()
        } else {
            state.disabled = true
            if (state.onDisable) state.onDisable()
        }
    }
    if (state.control && isFun(state.control.onDeactivate)) state.control.onDeactivate()
}

// deactivate all states except the onces provided in the skip list
//
// @param {array} skipList - the list of state nodes to skip
// @param {boolean} force - force deactivation even when a state doesn't show as active
function deactivateAllExcept(skipList, force) {
    stateList.forEach( state => {
        if (!skipList.includes(state)) {
            if (force || isActive(state)) {
                deactivateState(state)
            }
        }
    })
}

// deactivate all states
// 
// @param {boolean} force - force deactivation even when a state doesn't show as active
function deactivateAll(force) {
    stateList.forEach( state => {
        if (force || isActive(state)) deactivateState(state)
    })
}

// activate the state
//
// @param {object/state} - a state node
function activateState(state) {
    if (!state) throw new Error(`Missing state entity!`)

    if (isFun(state.activate)) {
        state.deactivated = false
        state.activate()
    } else {
        state.deactivated = false
        if (isFun(state.show)) {
            state.show()
        } else {
            state.hidden = false
            if (isFun(state.onShow)) state.onShow()
        }
        if (isFun(state.resume)) {
            state.resume()
        } else {
            state.paused = false
            if (isFun(state.onResume)) state.onResume()
        }
        if (isFun(state.enable)) {
            state.enable()
        } else {
            state.disabled = false
            if (state.onEnable) state.onEnable()
        }
    }
    if (state.control && isFun(state.control.onActivate)) state.control.onActivate()
}

// define a target state or states based on a fuzzy parameter
//
// @param {string | array | object } fuzzyTarget - the name of a state, a state object or a list of names or state objects
// @returns {object} a target definition object
function defineTarget(fuzzyTarget) {
    const target = {
        names:  [],
        states: [],
    }

    function addTarget(name, state) {
        if (!name && !state) throw new Error(`Unknown annonymous state!`)

        if (name && !state) {
            state = stateDir[name]
            if (!state) throw new Error(`Unknown state: [${name}]`)
        }

        target.states.push(state)
        if (name) target.names.push(name)
    }

    if (isString(fuzzyTarget)) {
        addTarget(fuzzyTarget)
    } else if (isArray(fuzzyTarget)) {
        fuzzyTarget.forEach(subTarget => {
            if (isString(subTarget)) {
                addTarget(subTarget)
            } else if (isObject(subTarget)) {
                addTarget(subTarget.name, subTarget)
            } else {
                throw new Error(`Wrong sub-target listed - expecting a string or an object: [${subTarget}]`)
            }
        })
    } else if (isObj(fuzzyTarget)) {
        addTarget(fuzzyTarget.name, fuzzyTarget)
    } else {
        throw new Error(`Wrong state entry - expecting a string, an array or an object: [${fuzzyTarget}]`)
    }

    target.name = target.names.join(',')
    return target
}

// instantly switch to the specified state target
//
// @param {string | object | array} fuzzyTarget - specifies a state or states to transit to
// @param {boolean} force - set true to force the switch and activation/deactivation even when the target state is already active
function switchTo(fuzzyTarget, force) {
    const target = defineTarget(fuzzyTarget)
    if (target.name === env.state && !force) return // ignore, we're already at the target state

    if (force) deactivateAll(force)
    else deactivateAllExcept(target.states)

    env.state = target.name
    env.transition = ''
    log(`=== state [${target.name}] ===`)
    target.states.forEach(state => {
        if (force || !isActive(state)) activateState(state)
    })
}

// transit to the specified state target
//
// @param { string|object|array } fuzzyTarget - specifies a state or states to transit to
// @param {object} st - defines the transit properties, like fadein, keep and fadeout
// @param {boolean} force - set true to force the transition and activation/deactivation even when the target state is already active (optional)
function transitTo(fuzzyTarget, st, force) {
    const target = defineTarget(fuzzyTarget)

    if (env.state === target.name && !force) return // ignore, we're already at the target state

    const transition = env.state + ' -> ' + target.name
    if (env.transition === transition && !force) return // just ignore - we're already in this transition
    
    env.transition = transition
    log(`transiting ${env.transition}`)

    const ts = {
        fadein:  .5,
        keep:    .25,
        fadeout: .5,

        onFadeOut: function() {
            try {
                switchTo(fuzzyTarget, force)
            } catch(e) {
                log.err(e)
            }
            if (this.next) this.next()
        }
    }
    augment(ts, st)
    lab.vfx.transit(ts)
}

// force a transit to the specified state target
//
// The same as running [transitTo(fuzzyTarget, st, true)](#./lab/control/state/transitTo)
//
// @param { string|object|array } fuzzyTarget - specifies a state or states to transit to
// @param {object} st - defines the transit properties, like fadein, keep and fadeout
function forceTransitTo(fuzzyTarget, st) {
    transitTo(fuzzyTarget, st, true)
}

// get the current active state name
function currentState() {
    return env.state
}

function leadNode() {
    const state = stateDir[env.state]
    if (!state) return

    if (state instanceof GroupState) {
        return state.lead()
    } else {
        return state
    }
}

// get the current active transition
// @returns {string} transition description or an empty string if no transition at the moment
function currentTransition() {
    return env.transition
}

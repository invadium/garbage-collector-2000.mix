/*
 * The *controller* ghost is used to route input actions to the matching targets
 */

// error messages
const WRONG_CONTROLLER_ID = '[controller] controllerId is supposed to be a positive integer'
const WRONG_TARGET        = '[controller] target is supposed to be an object'

const OFF = 0

// holds actions control array for each controller
const ctrl = []

const ctrlActionCache = []
const ctrlActionPush  = []

// targets are recepients of action events
let targetMap = []
// a buffer used to temporary store existing target maps (e.g when switching the state)
const targetMapStack = []

// bind the controller to the target
//
// @param {number/1+} controllerId
// @param {object} target - a target object to bind to the controller
function bind(controllerId, target) {
    if (!controllerId || !isNumber(controllerId) || controllerId < 1) throw new Error(WRONG_CONTROLLER_ID)
    if (!target || !isObj(target)) throw WRONG_TARGET

    release(controllerId)

    const icontroller = controllerId - 1

    targetMap[icontroller] = target
    if (!ctrl[icontroller]) ctrl[icontroller] = [] // initialize actions control array if missing
    target._controllerId = controllerId
}

// cut off all actions for the provided controller
//
// @param {number/1+} controllerId
function cutOffAllActions(controllerId) {
    if (!controllerId || !isNumber(controllerId) || controllerId < 1) throw new Error(WRONG_CONTROLLER_ID)

    const icontroller = controllerId - 1
    const target = targetMap[icontroller]
    if (target && target.cutOff) {
        const triggers = ctrl[icontroller] || []
        for (let action = 0; action < triggers.length; action++) {
            if (triggers[action]) {
                target.cutOff(action)
            }
        }
    }
}

// release the controller
//
// @param {number/1+} controllerId
// @returns {boolean} - true if the target was found, false otherwise
function release(controllerId) {
    if (!controllerId || !isNumber(controllerId) || controllerId < 1) throw new Error(WRONG_CONTROLLER_ID)

    const icontroller = controllerId - 1
    const target = targetMap[icontroller]
    if (target) {
        cutOffAllActions(controllerId) // need to cut off all triggered actions before release
        target._controller = 0
        targetMap[icontroller] = false
        return true
    } else {
        return false
    }
}

// bind all controllers to the selected target
//
// @param {object} target - the object listening to actions on all controllers
function bindAll(target) {
    if (!target || !isObj(target)) throw WRONG_TARGET

    for (let icontroller = 0; icontroller < env.bind.MAX_CONTROLLERS; icontroller++) {
        bind(icontroller + 1, target)
    }
}

// release all controllers
function releaseAll() {
    for (let cid = 1; cid <= env.bind.MAX_CONTROLLERS; cid++) {
        release(cid)
    }
}

// save current target map for future restoration
function saveTargetMap() {
    targetMapStack.push(targetMap)
    targetMap = []
}

// resume controls - try to restore previously stored target map state
function restoreTargetMap() {
    if (targetMapStack.length === 0) {
        log.warn("can't restore controller targets - the buffer is empty!")
        return false
    }
    this.releaseAll()
    targetMap = targetMapStack.pop()
    return true
}

// find the next free controller
//
// @returns {number} - controllerId, 0 if none were found
function nextFree() {
    for (let icontroller = 0; icontroller < env.bind.MAX_CONTROLLERS; icontroller++) {
        if (!targetMap[icontroller]) return icontroller + 1
    }
    return 0
}

// bind the target to the next free controller
//
// @param {object} target
// @returns {number} - id of the binded controller, 0 if none were found
function bindNext(target) {
    const controllerId = this.findNext()
    if (controllerId === 0) return 0 // no free controllers left
    this.bind(controllerId, target)
    return controllerId
}

// get the target for the specified controller
//
// @param {number/1+} controller - controller id
function target(controller) {
    if (!controller || !isNumber(controller) || controller < 1) throw WRONG_CONTROLLER 

    const icontroller = controller - 1
    return targetMap[icontroller]
}

// process controller push
//
// @param {object/action}
// @param {object|number} - source value
function push(action, dt, source) {
    if (this.disabled) return // input MUST be filtered out by the active disabled flag
    if (!action) throw '[controller] missing the action to push()!'

    const actionId     = action.id
    const controllerId = action.controllerId
 
    if (!controllerId || !isNumber(controllerId) || controllerId < 1) throw new Error(WRONG_CONTROLLER_ID)

    const icontroller = controllerId - 1

    if (ctrl[icontroller]) {
        if (ctrl[icontroller][actionId]) {
            // continue action
            ctrlActionPush[icontroller][actionId] = true
            const target = targetMap[icontroller]
            if (target) {
                if (target.act && !target.disabled) {
                    target.act(
                        action,
                        dt,
                        env.realTime - ctrl[icontroller][actionId],
                        source
                    )
                }
            }

        } else {
            // actuate action
            ctrl[icontroller][actionId] = env.realTime

            if (!ctrlActionCache[icontroller]) {
                ctrlActionCache[icontroller] = []
            }
            ctrlActionCache[icontroller][actionId] = action

            if (!ctrlActionPush[icontroller]) {
                ctrlActionPush[icontroller] = []
            }
            ctrlActionPush[icontroller][actionId] = true

            const target = targetMap[icontroller]
            if (target) {
                if (target.actuate && !target.disabled) {
                    target.actuate(action, source)
                }
            } else {
                // no target binded, try to capture the controller
                trap('capture', {
                    action,
                    dt,
                    source,
                })
            }
        }

    }  else {
        trap('capture', {
            action,
            dt,
            source,
        })
    }

    if (this.__.combo) this.__.combo.register(action)
}

// actuate or continue the controller action
//
// @param {object/action}
// @param {object|number} - source value
function act(action, source) {
    if (this.disabled) return // input MUST be filtered out by the active disabled flag
    if (!action) throw '[controller] missing the action to act()!'

    const actionId     = action.id
    const controllerId = action.controllerId
    if (!controllerId || !isNumber(controllerId) || controllerId < 1) throw new Error(WRONG_CONTROLLER_ID)

    const icontroller = controllerId - 1

    if (ctrl[icontroller]) {
        if (!ctrl[icontroller][actionId]) {
            ctrl[icontroller][actionId] = env.realTime
            if (!ctrlActionCache[icontroller]) {
                ctrlActionCache[icontroller] = []
            }
            ctrlActionCache[icontroller][actionId] = action

            const target = targetMap[icontroller]
            if (target) {
                if (target.actuate && !target.disabled) {
                    target.actuate(action, source)
                }
            } else {
                // no target binded, try to capture the controller
                trap('capture', {
                    action,
                    source,
                })
            }
        }
    }  else {
        trap('capture', {
            action,
            source,
        })
    }

    if (this.__.combo) this.__.combo.register(action)
}

// stop the controller action
//
// @param {number} action
// @param {number/1+} controller
function cutOff(action, source) {
    if (this.disabled) return // input MUST be filtered out by the active disabled flag
    if (!action) throw '[controller] missing the action to cutOff()!'

    const actionId     = action.id
    const controllerId = action.controllerId
    if (!controllerId || !isNumber(controllerId) || controllerId < 1) throw new Error(WRONG_CONTROLLER_ID)

    const icontroller = controllerId - 1

    if (ctrl[icontroller]) {
        const started = ctrl[icontroller][actionId]
        if (started) {
            const target = targetMap[icontroller]
            if (target && target.cutOff && !target.disabled) {
                target.cutOff(action, env.realTime - started)
            }
        }
        ctrl[icontroller][actionId] = OFF
    }
}

function evo(dt) {
    for (let icontroller = 0; icontroller < ctrl.length; icontroller++) {
        if (ctrl[icontroller]) {
            for (let actionId = 0; actionId < ctrl[icontroller].length; actionId++) {
                if (ctrl[icontroller][actionId]) {
                    const target = targetMap[icontroller]
                    const action = ctrlActionCache[icontroller][actionId]
                    const duration = env.realTime - ctrl[icontroller][actionId]

                    if (target && target.act && !target.disabled) {
                        target.act(
                            action,
                            dt,
                            duration
                        )
                    }

                    if (action.pushable) {
                        if (ctrlActionPush[icontroller][actionId]) {
                            ctrlActionPush[icontroller][actionId] = false
                        } else {
                            if (target && target.cutOff && !target.disabled) {
                                target.cutOff(action, duration)
                            }
                            ctrl[icontroller][actionId] = OFF
                        }
                    }
                }
            }
        }
    }
}

//
// gamepad controllers monitor
//
const bind = require('env/bind')
const controllerMonitor = require('lab/monitor/controller')

const USAGE_TIMEOUT = 15 * 1000

let sens = 0.3 // analog sticks sensitivity

const padRegistry = []
const lastUsage = []

function touch(padId) {
    lastUsage[padId] = Date.now()
}

function isActive(id) {
    return (lastUsage[id] && Date.now()
        -lastUsage[id] < USAGE_TIMEOUT);
}

function evo(dt) {
    pad().forEach(d => {
        if (!d.connected) return // TODO maybe process a disconnect controller action here?

        const padId = d.index
        if (padId >= bind.MAX_GAMEPADS) return // the gamepad is out of binding space

        const controllerId = bind.GAMEPAD_CONTROLLERS_BASE + padId

        if (!padRegistry[padId]) {
            // the gamepad is not registered yet!
            if (!bind.padActionMaps[padId]) return // the gamepad is not mapped
            log(`registering gamepad #${padId} as controller #${controllerId}:`)
            console.dir(d)
            padRegistry[padId] = d
            touch(padId)
        }

        const b = bind.padActionMaps[padId]
        const padActionMap = bind.padActionMaps[padId]

        for (let buttonId = 0; buttonId < d.buttons.length; buttonId++) {
            const action = padActionMap.buttons[buttonId]
            if (action) {
                const buttonState = d.buttons[buttonId]
                if (buttonState.pressed) {
                    touch(padId)
                    controllerMonitor.push(action, dt, buttonState)
                }
            }
        }

        for (let axisId = 0; axisId < d.axes.length; axisId++) {
            const axisVal = d.axes[axisId]
            const sensitivity = padActionMap.axesSensitivity

            if (axisVal < -sensitivity) {
                const action = padActionMap.axesNegative[axisId]
                if (action) {
                    touch(padId)
                    controllerMonitor.push(action, dt, axisVal)
                }
            } else if (axisVal > sensitivity) {
                const action = padActionMap.axesPositive[axisId]
                if (action) {
                    touch(padId)
                    controllerMonitor.push(action, dt, axisVal)
                }

            }
        }
    })
}


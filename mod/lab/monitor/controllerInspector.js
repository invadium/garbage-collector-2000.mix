/*
 * Controls monitor state debug inspector.
 *
 * To enable, set ```env.debugControls = true```
 * or set debugControls config flag with:
 *
 * ```
 * jam -d --debugControls
 * ```
 */


function draw() {
    if (env.debugControls || env.config.debugControls) {
        const ctrl = lab.monitor.controller.ctrl

        font('12px pixel-operator-mono8')
        alignLeft()
        fill(.1, 1, 1)

        let x = 20
        let y = 20
        const dx = 100,
              dy = 25
        for (let controller = 0; controller < ctrl.length; controller++) {
            if (ctrl[controller]) {
                // controller title
                text(`[#${controller + 1}]`, x, y)
                y += dy

                // state of controller actuators
                for (let actionId = 0; actionId < ctrl[controller].length; actionId++) {
                    if (ctrl[controller][actionId]) {
                        text('[' + env.bind.actionName(actionId) + ']', x, y)
                    } else {
                        text(' ' + env.bind.actionName(actionId) + ' ', x, y)
                    }
                    y += dy
                }
            }
            x += dx
            y = 20
        }
    }
}

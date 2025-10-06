/*
 * Menu Widget
 *
 * Use as a separate screen or in combination with other widgets.
 *
 * Create with *items* array or use _selectFrom(st)_ to define the items and event hooks:
 *
 * ```
 *  items: [
 *      // simple items
 *      'Simple Item',
 *      'Another Simple Item',
 *
 *      // section item - visible, but not selectable
 *      { section: true, title: 'Section One'},
 *      // switch item
 *      ['from', 'list', 'selection'],
 *
 *      // another section
 *      { section: true, title: 'Another Section'},
 *      // option item
 *      {
 *          title: 'music', // optional title
 *          options: ['on', 'off', 'random'],
 *          sync: function() {
 *              console.dir(this)
 *              log('syncing music to: ' + this.options[this.current])
 *          },
 *      },
 *      // complex section
 *      { section: true, title: 'Complex Section'},
 *      // complex item
 *      {
 *          title: 'Complex Item',
 *          onSelect: function() {
 *              log('complex item is selected!')
 *          },
 *      },
 *      // complex hidden item
 *      {
 *          hidden: true,
 *          title: 'Hidden Item',
 *      },
 *      // complex disabled item
 *      {
 *          disabled: true,
 *          title: 'A Disabled Item',
 *      },
 *      'The Last Item',
 *
 *  ],
 * ```
 */

const defaultColorTheme = {
    main:        '#f2c157',
    selected:    '#e35730',
    highlighted: '#de7118',
    deactivated: '#808080',
    disabled:    '#ffff80',

    background:  '#404040',
    shadow:      '#00000080',
    backline:    '#606060',
    activeBackline: '#808080',
}

// check if the item is just a plain string
function isSimpleItem(item) {
    return isStr(item)
}

// check if the item is a switch represented by an array
function isSwitch(item) {
    return isArray(item)
}

// check if the item is not a simple one
function isComplexItem(item) {
    return ( isObj(item) && !isSwitch(item) )
}

function isSection(item) {
    return ( isComplexItem(item) && item.section )
}

function isOption(item) {
    return ( isComplexItem(item) && isArr(item.options) )
}


class Menu extends sys.LabFrame {

    constructor(st) {
        super( extend({
            x: 0,
            y: 0,
            w: 400,
            h: 40,
            step: 60,
            border: 2,
            shadowShift: 6,
            IDLE_TIMEOUT: 20,

            OPTION_PREFIX: '< ',
            OPTION_SUFIX:  ' >',

            color: defaultColorTheme,

            current:  0,
            warp:     true,
            hidden:   true,
            paused:   true,
            disabled: true,

            showBackground: false,
            showBackline:   false,

            trap:           {},
            menuStack:      [],

            debug:          false,
        }, st) )
    }

    init() {
        if (this.trap) this.setTrap(this.trap)
        if (this.items) this.selectFrom(this.items)
    }

    syncTheme() {
        this.color = defaultColorTheme
    }

    adjust() {
        this.x = rx(.5)
        this.y = ry(.5)
        this.w = rx(.5)
        this.h = this.activeItems() * this.step
        this.zones = []
    }

    show() {
        if (!this.items) throw new Error('[menu] Unable to open the menu - no menu items are specified')

        this.adjust()
        this.hidden = false
        this.lastTouch = Date.now()

        lab.monitor.controller.saveTargetMap()
        this._capture = true
        lab.monitor.controller.bindAll(this)
        if (this.items.preservePos) {
            this.touch()
        } else {
            this.setCurrent(0)
        }
        if (isFun(this.trap.onShow)) this.trap.onShow()
        if (isFun(this.items.onShow)) this.items.onShow()
        this.notifyOnShow()
    }

    hide() {
        this.hidden = true
        if (this._capture) {
            lab.monitor.controller.restoreTargetMap()
            this._capture = false
        }
        this.notifyOnHide()
        if (isFun(this.items.onHide)) this.items.onHide()
        if (isFun(this.trap.onHide)) this.trap.onHide()
    }

    itemTitle(item) {
        if (isSimpleItem(item)) return item
        if (isSwitch(item)) return item[item.current || 0]
        if (isOption(item)) return item.options[item.current || 0]
        if (isComplexItem(item)) return item.title
        return ''
    }

    normalizeItems() {
        const __ = this
        this.items.__ = __
        this.items.forEach(item => {
            if (isComplexItem(item) || isSwitch(item)) {
                item.__ = __
            }
            if (isSwitch(item) || isOption(item)) {
                if (!item.current) item.current = 0
            }
        })
        this.zones = []
    }

    notifyOnShow() {
        this.items.forEach(item => {
            if (isComplexItem(item) || isSwitch(item)) {
                if (isFun(item.onShow)) item.onShow()
            }
        })
    }

    notifyOnHide() {
        this.items.forEach(item => {
            if (isComplexItem(item) || isSwitch(item)) {
                if (isFun(item.onHide)) item.onHide()
            }
        })
    }

    setItems(items) {
        if (!items) return

        this.items = items
        this.normalizeItems()

        this.setCurrent(0)
    }

    setTrap(trap) {
        if (!trap) return

        this.trap = trap
        this.trap.__ = this
    }

    currentItem() {
        return this.items[this.current]
    }

    setCurrent(current) {
        this.current = current
        this.touch()
    }

    // select from items provided in st object
    // The st object can contains items array and traps object.
    // Traps handle events like onSelect and onIdle.
    selectFrom(items, trap) {
        this.setItems(items)
        this.setTrap(trap)

        if (this.deactivated) {
            this.activate()
        } else {
            this.notifyOnShow()
        }
    }

    subSelectFrom(items) {
        this.items.current = this.current
        this.notifyOnHide()
        this.menuStack.push(this.items)
        this.setItems(items)
        this.notifyOnShow()
    }

    returnBack(restorePos) {
        if (this.menuStack.length === 0) throw new Error('[menu] No submenu found to return to!')

        this.items.current = this.current
        this.notifyOnHide()

        const prevItems = this.menuStack.pop()
        this.setItems(prevItems)
        this.notifyOnShow()

        if (restorePos && prevItems.current) {
            this.setCurrent(prevItems.current)
        }
    }

    // slide to the next active menu item
    //
    // A service recursive method that is used by next() to silently slide to the next active menu item.
    slideNext(step) {
        step = step || 1
        if (!this.items || step > this.items.length) return false

        this.current ++
        if (this.current >= this.items.length) {
            if (this.warp) {
                this.current = 0
            } else {
                this.current = this.items.length - 1
                return false
            }
        }

        const item = this.items[this.current]
        if (!item || (isObj(item) && (item.section || item.disabled || item.hidden))) {
            return this.slideNext(step + 1)
        } else {
            return true
        }
    }

    // select the next menu item
    next(step) {
        const prev = this.current
        if (this.slideNext()) {
            // landed on the next item
            if (this.trap.onMove) this.trap.onMove(item)
            //lib.sfx('select')
        } else {
            this.current = prev
            if (this.trap.onBlock) this.trap.onBlock(item)
        }
    }

    // touch the current menu item, move next if hidden/disabled or a section
    touch() {
        if (!this.items) return

        const item = this.items[this.current]
        if (!item || (isObj(item) && (item.section || item.disabled || item.hidden))) {
            const prev = this.current
            if (!this.slideNext()) {
                this.current = prev
            }
        }
    }

    // slide to the previous active menu item
    //
    // A service recursive method that is used by prev() to silently slide to the previous active menu item.
    slidePrev(step) {
        step = step || 1
        if (!this.items || step > this.items.length) return false

        this.current --
        if (this.current < 0) {
            if (this.warp) {
                this.current = this.items.length - 1
            } else {
                this.current = 0
                return false
            }
        }

        const item = this.items[this.current]
        if (!item || (isObj(item) && (item.section || item.disabled || item.hidden))) {
            return this.slidePrev(step + 1)
        } else {
            return true
        }
    }

    // move to the previous available menu item
    prev() {
        const prev = this.current
        if (this.slidePrev()) {
            // landed on the previous item
            if (this.trap.onMove) this.trap.onMove(item)
            //lib.sfx('select')
        } else {
            this.current = prev
            if (this.trap.onBlock) this.trap.onBlock(item)
        }
    }

    left() {
        if (this.hidden) return
        const item = this.currentItem()
        if (isSwitch(item)) {
            if (!item.current) item.current = 0
            item.current --
            if (item.current < 0) item.current = item.length - 1
            if (isFun(this.items.onSwitch)) this.items.onSwitch(item, this.current)
            if (isFun(this.trap.onSwitch)) this.trap.onSwitch(item, this.current)
            //lib.sfx('apply')
        } else if (isOption(item)) {
            if (!item.current) item.current = 0
            item.current --
            if (item.current < 0) item.current = item.options.length - 1
            if (isFun(this.items.onSwitch)) this.items.onSwitch(item, this.current)
            if (isFun(this.trap.onSwitch)) this.trap.onSwitch(item, this.current)
            if (item.sync) item.sync()
            //lib.sfx('apply')
        }
        if (this.trap.onMove) this.trap.onMove(item)
    }

    right(item) {
        if (this.hidden) return
        item = item || this.currentItem()
        if (isSwitch(item)) {
            if (!item.current) item.current = 0
            item.current ++
            if (item.current >= item.length) item.current = 0

            if (isFun(item.sync)) item.sync(item.current)
            if (isFun(this.items.onSwitch)) this.items.onSwitch(item, this.current)
            if (isFun(this.trap.onSwitch)) this.trap.onSwitch(item, this.current)

            //lib.sfx('apply')
        } else if (isOption(item)) {
            if (!item.current) item.current = 0
            item.current ++
            if (item.current >= item.options.length) item.current = 0

            if (isFun(item.sync)) item.sync(item.current)
            if (isFun(this.items.onSwitch)) this.items.onSwitch(item, this.current)
            if (isFun(this.trap.onSwitch)) this.trap.onSwitch(item, this.current)
            //lib.sfx('apply')
        }
        if (isFun(this.items.onMove)) this.items.onMove(item, this.current)
        if (isFun(this.trap.onMove)) this.trap.onMove(item, this.current)
    }

    select(item) {
        item = item || this.currentItem()
        if (isSwitch(item) || isOption(item)) {
            this.right(item)
        } else {
            if (isFun(item.select)) {
                item.select(this)
            } else if (item.submenu) {
                // open a submenu
                const items = this._dir[item.submenu]
                if (items) this.subSelectFrom(items)
            } else if (isFun(this.items.select)) {
                this.items.select(item, this.current)
            } else if (isFun(this.trap.select)) {
                this.trap.select(item, this.current)
            }
            if (isFun(this.items.onSelect)) this.items.onSelect(item, this.current)
            if (isFun(this.trap.onSelect)) this.trap.onSelect(item, this.current)
            //lib.sfx('use')
        }
    }

    mouseSelect() {
        const i = this.highlightedItem()
        if (i < 0) return
        
        const item = this.items[i]
        if (item.section || item.disabled || item.hidden) return
        this.select( item )
    }

    back() {
        if (this.onBack) {
            this.onBack( this.currentItem() )
        }
        //lib.sfx('back')
    }

    actuate(action) {
        this.lastTouch = Date.now()

        const i = this.highlightedItem()
        if (i >= 0) return

        switch(action.name) {
            case "UP":    this.prev();   break;
            case "LEFT":  this.left();   break;
            case "DOWN":  this.next();   break;
            case "RIGHT": this.right();  break;
            case "A":     this.select(); break;
            case "B":     this.back();   break;
        }
    }

    focusOn(target) {
        const i = isNum(target)? target : this.items.indexOf(target)
        this.setCurrent(i)
    }

    drawDebug() {
        lineWidth(2)
        stroke('#ffff00')
        rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
        lib.draw.cross(this.x, this.y, 20)
    }

    activeItems() {
        if (!this.items) return 0

        let rs = 0
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            if (isObj(item)) {
                if (!item.hidden) rs++
            } else {
                rs++
            }
        }
        return rs
    }

    selectedValue(i) {
        const item = this.items[i]
        if (isString(item)) return item
        else if (isArray(item)) {
            return item[item.current]
        }
    }

    highlightedItem() {
        if (mouse.out || this.zones.length === 0) return -1

        const { x, y } = mouse
        for (let i = 0; i < this.zones.length; i++) {
            const zone = this.zones[i]
            if (x >= zone.x1 && x <= zone.x2
                && y >= zone.y1 && y <= zone.y2) return zone.id
        }
        return -1
    }

    draw() {
        super.draw()

        if (!this.items) return // nothing to show!
        if (env.debug && this.debug) this.drawDebug()

        const highlighted = this.highlightedItem()
        const n = this.items.length
        const cx = this.x
        const cy = this.y - floor(this.h/2)

        alignCenter()
        baseTop()

        const b = this.border
        const x = cx
        const rw = this.w
        const rx = floor(this.x - rw/2)
        const h = n * this.step + 2*b
        let y = cy

        if (this.showBackground) {
            fill(this.color.background)
            rect(rx, y-h/2, rw, h)
        }

        for (let i = 0; i < n; i++) {
            const item = this.items[i],
                  hidden = item? !!item.hidden : false,
                  disabled = item? !!item.disabled : false
            let title,
                active = true,
                curFont = env.style.font.menu.head

            if (isSimpleItem(item)) {
                title = item
            } else if (isSwitch(item)) {
                title = this.OPTION_PREFIX + item[item.current || 0] + this.OPTION_SUFIX
            } else if (isComplexItem(item)) {
                if (item.section) {
                    active = false
                    title = item.title
                } else if (isOption(item)) {
                    title = this.OPTION_PREFIX + (item.title? item.title + ': ' : '')
                        + item.options[item.current || 0] + this.OPTION_SUFIX
                } else {
                    title = item.title
                }
            } else {
                title = '[empty title]'
            }

            if (!hidden) {
                if (this.showBackline) {
                    if (i === this.current) fill(this.color.activeBackline)
                    else fill(this.color.backline)
                    rect(rx+b, y-1, rw-2*b, this.step-2)
                }

                // text
                let fillColor
                if (!active) fillColor = this.color.deactivated
                else if (disabled) fillColor = this.color.disabled
                else if (i === highlighted) {
                    fillColor = this.color.selected
                    curFont = env.style.font.menuHigh.head
                } else if (highlighted < 0 && i === this.current) fillColor = this.color.selected
                else fillColor = this.color.main

                // shadow
                font(curFont)
                fill(this.color.shadow)
                text(title, x + this.shadowShift, y + this.shadowShift)


                fill(fillColor)
                text(title, x, y)
                if (!this.zones[i]) {
                    // calculate zone area
                    const tw = textWidth(title)
                    this.zones[i] = {
                        id: i,
                        x1: x - tw,
                        y1: y,
                        x2: x + tw,
                        y2: y + this.step,
                        w:  tw,
                        h:  this.step,
                    }
                }

                y += this.step
            }
        }
    }

    evo(dt) {
        const idle = (Date.now() - this.lastTouch)/1000
        if (idle >= this.IDLE_TIMEOUT) {
            this.lastTouch = Date.now()
            if (isFun(this.items.onIdle)) {
                this.items.onIdle()
            }
            if (isFun(this.trap.onIdle)) {
                this.trap.onIdle()
            }
        }
    }
}

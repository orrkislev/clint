/// <reference path="./p5.global-mode.d.ts" />
const pencilColor = '#2d3142'
const BG = '#999'


function setup() {
    createCanvas(1000, 1000);
    angleMode(DEGREES)
    noFill()
    noLoop()
    stroke(0)
    strokeWeight(1.5)
    makeImage()
}

function makeImage() {
    // background(BG)
    stroke(pencilColor)
    translate(width / 2, height * 0.8)


    loft(getPerspectiveCirclePoints(80), getPerspectiveCirclePoints(90), 30)
    loft(getFlowerPoints(40, 12), getFlowerPoints(50,3).rotate(90), 350)
    loft(getPerspectiveCirclePoints(100), getPerspectiveCirclePoints(120), 20)
    loft(getPerspectiveCirclePoints(120), getPerspectiveCirclePoints(120), 100)
    loft(getPerspectiveCirclePoints(120), getFlowerPoints(30,5), 50)

    translate(0,60)
    rotate(-100)
    translate(0,150)
    loft(getPerspectiveCirclePoints(300).rotate(0).slice(0,90),
         getPerspectiveCirclePoints(300).rotate(0).slice(0,90),
         300)

    // resetMatrix()
    // p = get()
    // background(255)
    // image(p, 0, 0)

    // finishImage()
    // fxpreview()
}

function loft(p1, p2, totalHeight) {
    push()
    if (p1.ps.length > p2.ps.length) p2.rebuild(p1.ps.length)
    else if (p2.ps.length > p1.ps.length) p1.rebuild(p2.ps.length)

    for (h = 0; h < totalHeight; h++) {
        slc = lerpShapes(p1, p2, h / totalHeight)
        applyRemove(() => fillShape(slc, 0, -h))

        slc.forEach((p, i) => {
            const p1 = slc.get(i + 1)
            const angle = p5.Vector.sub(p, p1).rotate(90).heading()
            let val = getShadeAtAngle(shade_round_shiny, angle)
            halfTone(p.copy().add(0, -h), val)
        })
    }
    pop()
    translate(0, -totalHeight)
}

function lerpShapes(p1, p2, t) {
    newPs = p1.ps.map((p, i) => p5.Vector.lerp(p, p2.ps[i], t))
    return newPs
}

function getFlowerPoints(r, segments) {
    const alpha = 360 / segments / 2
    const small_r = 4 * r * sin(alpha / 2)
    const wide = 180 + alpha
    const res = []
    for (let i = 0; i < segments; i++) {
        const dir = i * 360 / segments
        const c = p5.Vector.fromAngle(radians(dir)).setMag(r)
        const s = dir - wide / 2
        const e = dir + wide / 2
        let ps = getEllipse(small_r, small_r, 1, s, e)
        ps.forEach(p => p.add(c))
        res.pushArray(ps)
    }
    res.forEach(p => p.y *= 0.4)
    return new Shape(res)
}

function applyRemove(func) {
    push()
    noStroke()
    fill(0)
    blendMode(REMOVE)
    func()
    pop()
}
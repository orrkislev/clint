function getPerspectiveCirclePoints(r, s=0, e=360) {
    const points = []
    for (let i = 0; i < abs(s - e); i += 1) {
        const p = i / abs(s - e)
        const a = lerp(s, e, p)
        const pos = getPointOnEllipse(r, r * 0.4, a)
        points.push(pos)
    }
    return new Shape(points)

}

function getPointOnEllipse(w, h, a) {
    return createVector(w * 0.5 * cos(a), h * 0.5 * sin(a))
}
function getEllipse(w,h,step=1,s=0,e=360){
    const ps = []
    for (let a=s;a<e;a+=step) ps.push(getPointOnEllipse(w,h,a))
    return ps
}

function makeCurve(ps) {
    const newCurve = []
    for (let i = 0; i < ps.length - 1; i++) {
        const curr = ps[i]
        const next = ps[i + 1]
        const l = p5.Vector.dist(curr, next)
        for (let j = 0; j < l; j++) {
            const t = j / l
            const control1 = i > 0 ? ps[i - 1] : curr
            const control2 = i < ps.length - 1 ? ps[i + 1] : next
            const x = curvePoint(control1.x, curr.x, next.x, control2.x, t)
            const y = curvePoint(control1.y, curr.y, next.y, control2.y, t)
            newCurve.push(v(x, y))
        }
    }
    return newCurve
}

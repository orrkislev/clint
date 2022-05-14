class Shape {
    constructor(ps) {
        this.ps = ps
    }
    copy() {
        return new Shape(this.ps.map(p => p.copy()))
    }

    rebuild(l) {
        const sumToAdd = l - this.ps.length
        for (let i = 0; i < sumToAdd; i++) {
            const r = round_random(0, this.ps.length - 1)
            this.ps.splice(r, 0, this.ps[r])
        }
        return this
    }

    center() {
        const center = createVector(0, 0)
        this.ps.forEach(p => center.add(p.pos))
        center.div(this.ps.length)
        return center
    }

    rotate(a) {
        const center = this.center()
        this.ps = this.ps.map(p => {
            const regularY = p.y * (1 / 0.4)
            const regularPos = v(p.x,regularY)
            regularPos.rotate(a)
            regularPos.y *= 0.4
            return regularPos
            // const pAngle = p5.Vector.sub(p, center).heading()
        })
        return this
        // const sumToRotate = ps.length * a / 360
        // for (let i = 0; i < sumToRotate; i++) ps.push(ps.shift())
    }

    slice(s,e){
        this.ps = this.ps.slice(s,e)
        return this
    }


    onlyFront() {
        this.ps = this.ps.map((p, i) => {return {pos:p,i:i}})
        rightMost = this.ps.reduce((a, b) => a.pos.x > b.pos.x ? a : b).i
        leftMost = this.ps.reduce((a, b) => a.pos.x < b.pos.x ? a : b).i
        this.ps =  this.ps.slice(rightMost, leftMost)
        this.ps = this.ps.map(p=>p.pos)
        return this
    }
}
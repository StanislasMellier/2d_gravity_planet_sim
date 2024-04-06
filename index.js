const canvas = document.getElementById("canva");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


class Body {
    constructor(x, y, velocity, mass, frozen, color) {
        this.x = x
        this.y = y
        this.velocity = velocity || { x: 0, y: 0 }
        this.frozen = frozen || false
        this.mass = mass || 1
        this.color = color || "white"
    }

}
class Simulation {
    constructor(canvas, softeningFactor, timeFactor) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.bodies = []
        this.softeningFactor = 20 || softeningFactor
        this.timeFactor = 1 || timeFactor

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
        })

        this.init()
    }
    init() {

        let xCenter = this.ctx.canvas.width * 0.5;
        let yCenter = this.ctx.canvas.height * 0.5;

        this.addBody(xCenter, yCenter, null, 5, true, "yellow");
        this.addBody(xCenter, yCenter - yCenter * 0.5, { x: 2, y: 0 }, 1);
        this.addBody(xCenter, yCenter - yCenter * -0.5, { x: -2, y: 0 }, 1);
        this.addBody(xCenter, yCenter - yCenter * -0.55, { x: -2.7, y: 0 }, 0.00000001);

    }
    addBody(x, y, velocity, mass, forzen, color) {
        this.bodies.push(new Body(x, y, velocity, mass, forzen, color));
    }
    update(delta) {
        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i]

            if (body.frozen === false) {
                let a = { x: 0, y: 0 }
                for (let j = 0; j < this.bodies.length; j++) {
                    let otherBody = this.bodies[j]

                    if (body !== otherBody) {
                        let diff = { x: otherBody.x - body.x, y: otherBody.y - body.y }

                        let d2 = Math.sqrt(diff.x ** 2 + diff.y ** 2) ** 2

                        a.x += diff.x * otherBody.mass / d2
                        a.y += diff.y * otherBody.mass / d2
                    }
                }

                body.velocity.x += a.x * delta
                body.velocity.y += a.y * delta

                body.x += body.velocity.x * delta
                body.y += body.velocity.y * delta
            }
        }
    }
    draw() {
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];

            let radius = body.mass * 2 + this.canvas.width * 0.001
            this.ctx.fillStyle = `${body.color}`;
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, radius, 0, Math.PI * 2);
            this.ctx.fill()
        }
    }
}
const simulation = new Simulation(canvas);

let body = { x: 0, y: 0, velocity: { x: 0, y: 0 }, mass: 1, color: '#ffffff', frozen: false }

let gui = new dat.GUI()

let SimulationFolder = gui.addFolder("Simulation");
let softeningController = SimulationFolder.add(simulation, 'softeningFactor', 0, 100);

let AddBodyParameterFoler = gui.addFolder("Add Body Parameter");
let AddBodyMassController = AddBodyParameterFoler.add(body, 'mass', 0, 100)
let AddBodyColorController = AddBodyParameterFoler.addColor(body, 'color')
let AddBodyFrozenController = AddBodyParameterFoler.add(body, 'frozen')


canvas.addEventListener('mousedown', (e) => {
    body.x = e.offsetX
    body.y = e.offsetY
})
canvas.addEventListener('mouseup', (e) => {
    if (!body) return
    body.velocity.x = (body.x - e.offsetX) * 0.05
    body.velocity.y = (body.y - e.offsetY) * 0.05
    simulation.addBody(e.offsetX, e.offsetY, { x: body.velocity.x, y: body.velocity.y }, body.mass, body.frozen, body.color)
})


let fps = 60;
let frameRate = 1000 / fps;
let last = Date.now()
let timeSinceLastFrame = 0;
function animate() {
    timeSinceLastFrame = Date.now() - last;
    if (timeSinceLastFrame > frameRate) {
        simulation.update(0.5);
        simulation.draw();

        last = Date.now();
    }
    requestAnimationFrame(animate);
}

animate()
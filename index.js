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
        this.G = 1
        this.softeningFactor = 20 || softeningFactor
        this.timeFactor = 0.1 || timeFactor

        this.camera = { x: 0, y: 0, zoom: 1 }
        this.followCenterOfSimulation = false

        this.gui = new dat.GUI()
        this.guiElement = {}
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
        })

        this.init()
    }
    init() {
        let SimulationFolder = this.gui.addFolder("Simulation");
        SimulationFolder.open()

        let cameraZoomController = SimulationFolder.add(this.camera, 'zoom', 0, 1);
        cameraZoomController.name('Camera zoom');
        let softeningController = SimulationFolder.add(this, 'softeningFactor', 0, 100);
        let timeFactorController = SimulationFolder.add(this, 'timeFactor', 0.01, 1.00);
        let FollowCenterController = SimulationFolder.add(this, 'followCenterOfSimulation');
        FollowCenterController.name('Camera centered');

        this.guiElement = { ...this.guiElement, SimulationFolder, cameraZoomController, softeningController, timeFactorController, FollowCenterController }

        this.loadExemple()
        this.handleMouseAddBody()

    }
    addBody(x, y, velocity, mass, forzen, color) {
        this.bodies.push(new Body(x, y, velocity, mass, forzen, color));
    }
    handleMouseAddBody() {
        let body = { x: 0, y: 0, velocity: { x: 0, y: 0 }, mass: 1, color: '#ffffff', frozen: false }

        let AddBodyParameterFoler = this.gui.addFolder("Add Body Parameter");
        AddBodyParameterFoler.open()

        let AddBodyMassController = AddBodyParameterFoler.add(body, 'mass')
        let AddBodyColorController = AddBodyParameterFoler.addColor(body, 'color')
        let AddBodyFrozenController = AddBodyParameterFoler.add(body, 'frozen')

        this.guiElement = { ...this.guiElement, AddBodyParameterFoler, AddBodyMassController, AddBodyColorController, AddBodyFrozenController }

        this.canvas.addEventListener('mousedown', (e) => {
            let clickXFromCanvaCenter = e.offsetX - (this.canvas.width / 2)
            let clickYFromCanvaCenter = e.offsetY - (this.canvas.height / 2)
            body.x = this.camera.x + (clickXFromCanvaCenter / this.camera.zoom)
            body.y = this.camera.y + (clickYFromCanvaCenter / this.camera.zoom)
        })
        this.canvas.addEventListener('mouseup', (e) => {
            if (!body) return

            let clickXFromCanvaCenter = e.offsetX - (this.canvas.width / 2)
            let clickYFromCanvaCenter = e.offsetY - (this.canvas.height / 2)

            let clickXCoordInSimulation = this.camera.x + (clickXFromCanvaCenter / this.camera.zoom)
            let clickYCoordInSimulation = this.camera.y + (clickYFromCanvaCenter / this.camera.zoom)

            body.velocity.x = ((body.x - clickXCoordInSimulation) * 0.05) * this.camera.zoom
            body.velocity.y = ((body.y - clickYCoordInSimulation) * 0.05) * this.camera.zoom
            this.addBody(body.x, body.y, { x: body.velocity.x, y: body.velocity.y }, body.mass, body.frozen, body.color)
        })
    }

    loadExemple() {

        this.addBody(0, 0, null, 10, true, "yellow");
        this.addBody(0, -250, { x: 3.25, y: 0 }, 1);
        this.addBody(0, 250, { x: -3.25, y: 0 }, 1);
        this.addBody(0, 260, { x: -4.0, y: 0 }, 0.001);

    }
    update(delta) {
        this.CenterOfSimulation = { x: 0, y: 0 }
        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i]

            let a = { x: 0, y: 0 }
            if (body.frozen === false) {
                for (let j = 0; j < this.bodies.length; j++) {
                    let otherBody = this.bodies[j]

                    if (body !== otherBody) {
                        let diff = { x: otherBody.x - body.x, y: otherBody.y - body.y }
                        let d2 = Math.sqrt(diff.x ** 2 + diff.y ** 2 + this.softeningFactor) ** 2

                        a.x += this.G * diff.x * otherBody.mass / d2
                        a.y += this.G * diff.y * otherBody.mass / d2
                    }
                }

                body.velocity.x += a.x * (delta * this.timeFactor)
                body.velocity.y += a.y * (delta * this.timeFactor)

                body.x += body.velocity.x * (delta * this.timeFactor)
                body.y += body.velocity.y * (delta * this.timeFactor)
            }
            if (this.followCenterOfSimulation === true) {
                this.CenterOfSimulation.x += body.x
                this.CenterOfSimulation.y += body.y
            }
        }

        if (this.followCenterOfSimulation === true) {
            this.CenterOfSimulation.x = this.CenterOfSimulation.x / this.bodies.length
            this.CenterOfSimulation.y = this.CenterOfSimulation.y / this.bodies.length

            this.camera.x = this.CenterOfSimulation.x
            this.camera.y = this.CenterOfSimulation.y
        }
    }
    draw() {
        this.ctx.fillStyle = "rgba(0,0,0,1.0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];

            let objectXfromCam = (body.x - this.camera.x) * this.camera.zoom
            let objectYfromCam = (body.y - this.camera.y) * this.camera.zoom

            let objectXOnCanva = objectXfromCam + this.canvas.width / 2
            let objectYOnCanva = objectYfromCam + this.canvas.height / 2

            let radius = (body.mass * 2) * this.canvas.width * 0.0005 + this.canvas.width * 0.0005

            this.ctx.fillStyle = `${body.color}`;

            this.ctx.filter = `blur(${radius * Math.ceil(this.camera.zoom)}px)`;
            this.ctx.beginPath();
            this.ctx.arc(objectXOnCanva, objectYOnCanva, radius * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.fill()

            this.ctx.filter = 'none';
            this.ctx.beginPath();
            this.ctx.arc(objectXOnCanva, objectYOnCanva, radius * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.fill()
        }
    }
}
const simulation = new Simulation(canvas);

let fps = 60;
let frameRate = 1000 / fps;
let last = Date.now()
let timeSinceLastFrame = 0;
function animate() {
    timeSinceLastFrame = Date.now() - last;
    if (timeSinceLastFrame > frameRate) {
        simulation.update(frameRate);
        simulation.draw();

        last = Date.now();
    }
    requestAnimationFrame(animate);
}

animate()
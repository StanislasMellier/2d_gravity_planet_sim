const canvas = document.getElementById("canva");
const ctx = canvas.getContext("2d");


class Body {
    constructor(x, y, velocity, mass) {
        this.x = x;
        this.y = y;
        this.mass = mass || 1;
        this.velocity = velocity || { x: 0, y: 0 };
        this.movable = true;
    }
}

class Simulation {

    constructor(ctx) {
        this.ctx = ctx;
        this.body = [];
        this.G = 1
        self.softening_factor = 1;
        this.init();

    }
    init() {
        let xCenter = this.ctx.canvas.width * 0.5;
        let yCenter = this.ctx.canvas.height * 0.5;
        console.log(xCenter);

        this.body.push(new Body(xCenter, yCenter, null, 5));
        this.body[0].movable = false
        this.body.push(new Body(xCenter, yCenter - yCenter * 0.5, { x: 2, y: 0 }, 1));
        this.body.push(new Body(xCenter, yCenter - yCenter * -0.5, { x: -2, y: 0 }, 1));
        this.body.push(new Body(xCenter, yCenter - yCenter * -0.55, { x: -2.7, y: 0 }, 0.00000001));

        // this.body.push({ x: xCenter, y: yCenter - yCenter * 0.3, velocity: { x: 0.6, y: 0 }, acceleration: { x: 0, y: 0 } });




        // for (let i = 0; i < 2; i++) {
        //     this.body.push({ x: Math.floor(Math.random() * ctx.canvas.width), y: Math.floor(Math.random() * ctx.canvas.height), velocity: { x: 0, y: 0 }, acceleration: { x: 0, y: 0 } });
        // }
        // for (let i = 0; i < 20; i++) {
        //     this.body.push({ x: Math.random() - 0.5, y: Math.random() - 0.5, velocity: { x: 0, y: 0 }, acceleration: { x: 0, y: 0 } });
        // }
        // console.log(this.body);

    }
    update(timestep) {
        for (let i = 0; i < this.body.length; i++) {
            let body = this.body[i];

            let acceleration = { x: 0, y: 0 };


            for (let j = 0; j < this.body.length; j++) {
                const otherBody = this.body[j];
                if (body !== otherBody) {

                    let diff_x = otherBody.x - body.x
                    let diff_y = otherBody.y - body.y

                    let distance = Math.sqrt(Math.pow(diff_x, 2) + Math.pow(diff_y, 2))
                    let distance2 = Math.pow(distance, 2) + 20
                    acceleration.x += (this.G * otherBody.mass * diff_x / distance2);
                    acceleration.y += (this.G * otherBody.mass * diff_y / distance2);
                }

            }
            if (body.movable == true) {

                body.velocity.x += acceleration.x * timestep
                body.velocity.y += acceleration.y * timestep

                body.x += body.velocity.x * timestep
                body.y += body.velocity.y * timestep
            }

        }
    }
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // console.log(this.body);

        for (let i = 0; i < this.body.length; i++) {
            let body = this.body[i];
            // let cX = body.x * canvas.width / 2;
            // let cY = body.y * canvas.height / 2;
            let cX = body.x
            let cY = body.y

            // let softV = 1
            // cX *= softV
            // cY *= softV

            // cX = canvas.width / 2 + cX;
            // cY = canvas.height / 2 + cY;
            // console.log(cX, cY);
            // console.log(canvas.width / 2 + cX, canvas.height / 2 + cY);

            this.ctx.fillStyle = "red";
            this.ctx.fillRect(cX, cY, body.mass * 2 + 4, body.mass * 2 + 4);
            this.ctx.strokeStyle = "green";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(cX, cY);
            this.ctx.lineTo(cX + body.velocity.x, cY + body.velocity.y);
            this.ctx.stroke();

        }
    }
}

const simulation = new Simulation(ctx);



let fps = 60;
let frameRate = 1000 / fps;
let last = Date.now()
let timeSinceLastFrame = 0;


const stepBtn = document.getElementById("step");
simulation.draw();
// simulation.update(16);
stepBtn.addEventListener("click", () => {
    simulation.update(frameRate);
    simulation.draw();
})
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
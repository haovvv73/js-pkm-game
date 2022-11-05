class Sprite {  // vi tri  , gia toc , img 
    constructor({ position = { x: 0, y: 0 }, veclo, image, frames = { max: 1, hold: 30 }, sprites = {}, animate = false, rotation = 0 }) {
        this.position = position;
        this.veclo = veclo;
        this.image = new Image();
        this.image.src = image.src;
        this.frames = { ...frames, value: 0, time: 0 };
        this.image.onload = () => {
            this.width = this.image.width / frames.max;
            this.height = this.image.height;
        }
        this.animate = animate;
        this.sprites = sprites;
        // status battle
        // style
        this.opacity = 1;
        this.rotation = rotation;
        // property
        // this.healthBar = 100;
        // this.isEnemy = isEnemy;
        // this.nameMonster = nameMonster;
    }
    draw() {
        game.save()
        // opacity monster
        game.globalAlpha = this.opacity
        // rotation fireball
        // make xy(0,0) move to fireball
        game.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
        // rotate the fire ball
        game.rotate(this.rotation)
        // move xy(0,0) to default
        game.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)
        // draw sprite 
        game.drawImage(this.image,
            // crop image
            this.frames.value * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            // shape iamge
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height,
        )
        game.restore()
        // stop animation
        if (!this.animate) { return }

        // timing move
        if (this.frames.max > 1) {
            this.frames.time++
        }

        // animation move
        if (this.frames.time % this.frames.hold == 0) {
            if (this.frames.value < this.frames.max - 1) {
                this.frames.value++
            } else {
                this.frames.value = 0
            }
        }
    }
    goDown() {
        this.position.y -= 2;
    }
    goUp() {
        this.position.y += 2;
    }
    goLeft() {
        this.position.x += 2;
    }
    goRight() {
        this.position.x -= 2;
    }


}

class Monster extends Sprite {
    constructor({ position = { x: 0, y: 0 }, veclo, image, frames = { max: 1, hold: 30 }, sprites = {}, animate = false, isEnemy = false, rotation = 0, nameMonster = 'Null' }) {
        super({
            position,
            veclo,
            image,
            frames,
            animate,
            sprites,
            rotation,
        })
        // status battle
        // property
        this.healthBar = 100;
        this.isEnemy = isEnemy;
        this.nameMonster = nameMonster;
    }

    // METHOD
    // action battle for monster player
    attack({ attack = {}, recipient = {}, renderBattle = [] }) {
        // display dialogbox
        const dialog = document.querySelector('#dialogbox');
        dialog.style.display = 'block';
        dialog.innerHTML = this.nameMonster + ' used ' + attack.nameATK;

        // logic when call attack
        switch (attack.nameATK) {
            case 'tackle':
                const tl = gsap.timeline()
                // dame monster
                let distanceDameMove = 20;
                if (this.isEnemy) distanceDameMove -= 10;
                // health monser bar
                let healthEnemyBar = '#healthDraggleBar';
                if (this.isEnemy) healthEnemyBar = '#healthEmbyBar';
                // monster 2 health bar down
                recipient.healthBar = recipient.healthBar - attack.dame

                // monster 1 attack animation
                tl.to(this.position, {
                    x: this.position.x - distanceDameMove,
                }).to(this.position, {
                    x: this.position.x + distanceDameMove * 2,
                    duration: 0.1,
                    // monster 2 is attacked animation
                    onComplete: () => {
                        // monster 2 get hit
                        // music hit
                        audio.tackleHit.play()
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            repeat: 3,
                            yoyo: true,
                            duration: 0.08,
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 3,
                            yoyo: true,
                            duration: 0.08,
                        })
                        gsap.to(healthEnemyBar, {
                            width: `${recipient.healthBar}%`
                        })
                    }
                }).to(this.position, {
                    // finish attack
                    x: this.position.x,
                })
                break;
            case 'ember':
                // music init fire ball
                audio.initFireball.play()
                const fireBallImg = new Image();
                fireBallImg.src = './static/img/fireball.png';
                const fireBall = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y,
                    },
                    veclo: 0,
                    image: fireBallImg,
                    frames: {
                        max: 4,
                        hold: 20,
                    },
                    animate: true,
                    rotation: 45,// 45 deg
                })
                // monster 2 health bar down
                recipient.healthBar = recipient.healthBar - attack.dame
                // render fireball
                renderBattle.splice(1, 0, fireBall)

                // monster 1 : animation move fireball to monster enemy
                gsap.to(fireBall.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    duration: 0.6,
                    onComplete: () => {
                        // monster 2 get hit
                        audio.fireballHit.play()
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            repeat: 3,
                            yoyo: true,
                            duration: 0.08,
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 3,
                            yoyo: true,
                            duration: 0.08,
                        })
                        // animation monster 2 health bar down
                        gsap.to('#healthDraggleBar', {
                            width: `${recipient.healthBar}%`
                        })
                        // hide fireball
                        renderBattle.splice(1, 1);
                    }
                })
                break;
        }
    }
    faint() {
        const dialog = document.querySelector('#dialogbox');
        dialog.innerHTML = this.nameMonster + ' fainted';
        //animation faited
        gsap.to(this.position, {
            y: this.position.y + 20,

        })
        gsap.to(this, {
            opacity: 0,
        })
        // music victory
        audio.battle.stop()
        audio.victory.play()
    }
}

// --------

class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position = {} }) {
        // obj position
        this.position = position;
        this.width = 48;
        this.height = 48;
    }
    draw() {
        game.fillStyle = 'red'
        game.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    // set position boundary
    goRight() {
        this.position.x -= 2;
    }
    goLeft() {
        this.position.x += 2;
    }
    goUp() {
        this.position.y += 2;
    }
    goDown() {
        this.position.y -= 2;
    }
}
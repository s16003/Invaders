"use strict";
/*
 * Created by s16003 on 17/01/27.
 */

class Player {
    static get HALF_WIDTH() {
        return 20;
    }

    static get HALF_HEIGHT() {
        return 8.5;
    }

    constructor(input, x, y, speed, canvas_width) {
        this.input = input;
        this.pos = {'x': x, 'y': y};
        this.bullet = null;
        //this.player = null;
        this.speed = speed;
        this.canvas_width = canvas_width;
        this.isCollied = false;
    }

    getBullet() {
        return this.bullet;
    }

    //getPlayer() {
    //    return this.player;
    //}

    move() {
        if (this.input.isLeft && this.input.isRight) {
            //なにもしない
        } else if (this.input.isLeft) {
            this.pos.x -= this.speed;
        } else if (this.input.isRight) {
            this.pos.x += this.speed;
        }
        //左側へ行き過ぎたら戻す
        if (this.pos.x < Player.HALF_WIDTH) {
            this.pos.x = Player.HALF_WIDTH;
        }
        //右側へ行き過ぎたら戻す
        if (this.pos.x > this.canvas_width - Player.HALF_WIDTH) {
            this.pos.x = this.canvas_width - Player.HALF_WIDTH;
        }
    }


    //TODO: 移動関連を先にやる
    draw(ctx) {

        if (this.input.isSpace &&  this.bullet == null) {
            this.bullet = new Bullet(this.pos.x, this.pos.y);
        }
        if (this.bullet != null) {
            this.bullet.draw(ctx);
            if (!this.bullet.isValid()) {
                this.bullet = null;
            }
        }

        this.player = new Player(this.pos.x, this.pos.y);

        this.move();

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = "#F00";
        ctx.fillStyle = "#F00";

        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-20, -7);
        ctx.lineTo(-3, -7);
        ctx.lineTo(0, -10);
        ctx.lineTo(3, -7);
        ctx.lineTo(20, -7);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.strokeStyle = "#fff";
        ctx.fillStyle = "#fff";

        ctx.beginPath();
        ctx.moveTo(-800,-15);
        ctx.lineTo(800, -15);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.restore();

    }
}

class Input {
    constructor() {
        this.isLeft = false;
        this.isRight = false;
        this.isSpace = false;
    }
    onKeyDown(event) {
        switch (event.code) {
            case "ArrowLeft":
                this.isLeft = true;
                break;
            case "ArrowRight":
                this.isRight = true;
                break;
            case "Space":
                this.isSpace = true;
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    onKeyUp(event) {
        switch (event.code) {
            case "ArrowLeft":
                this.isLeft = false;
                break;
            case "ArrowRight":
                this.isRight = false;
                break;
            case "Space":
                this.isSpace = false;
                break;
            default:
                return;
        }
        event.preventDefault();
    }
}

class Bullet {
    static get SPEED() {
        return 10;
    }

    static get HALF_HEIGHT() {
        return 5;
    }

    static get HALF_WIDTH() {
            return 1.5;
    }

    constructor(x, y) {
        this.pos = {'x': x, 'y': y};
        this.isCollied = false;
    }

    move() {
        this.pos.y -= Bullet.SPEED;
    }

    isValid() {
        //TODO: 敵との衝突判定で衝突してたらfalseを返す
        if (this.isCollied) {
            return false;
        }
        return this.pos.y >= -Bullet.HALF_HEIGHT;
    }

    setInvalidate() {
        this.isCollied = true;
    }

    draw(ctx) {
        this.move();

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;


        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();
        /*
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-20, -7);
        ctx.lineTo(-3, -7);
        ctx.lineTo(0, -10);
        ctx.lineTo(3, -7);
        ctx.lineTo(20, -7);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        */
        ctx.restore();

    }

}

class Enemy {
    /*
    @return {number}
     */
    static get SPEED(){
        return 4;
    }

    static get HALF_SIZE() {
        return Enemy.SIZE / 2;
    }

    static get SIZE() {
        return 64;
    }

    constructor(image, x, y) {
        this.image = image;
        this.pos = {'x': x, 'y': y};
        this.isOrder = false;
        this.canvas_width = 800;
    }

    move(dx, dy) {
        this.pos.x += dx;
        this.pos.y += dy;
    }

    act() {
        if (this.isOrder == false) {
            this.pos.x += Enemy.SPEED;
            if (this.pos.x > this.canvas_width - Enemy.HALF_SIZE) {
                this.pos.y += 48;
                this.isOrder = true;
            }
        }
        if (this.isOrder == true) {
            this.pos.x -= Enemy.SPEED;
            if(this.pos.x < Enemy.HALF_SIZE) {
                this.pos.y += 48;
                this.isOrder = false;
            }
        }
    }

    draw(ctx) {


        this.act();


        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        ctx.drawImage(this.image, -Enemy.HALF_SIZE, -Enemy.HALF_SIZE, Enemy.SIZE, Enemy.SIZE);

        ctx.restore();

        //線を超えたらgameover
        if (this.pos.y >= 560 - Enemy.HALF_SIZE) {

            ctx.strokeStyle = "red";

            ctx.clearRect(0, 0, 850, 600);
            ctx.strokeText("GAME OVER" , 380, 300)
        }



    }

    isCollision(bullet) {
        let dx = Math.abs(this.pos.x - bullet.pos.x);
        let dw = Enemy.HALF_SIZE + Bullet.HALF_WIDTH;

        let dy = Math.abs(this.pos.y - bullet.pos.y);
        let dh = Enemy.HALF_SIZE + Bullet.HALF_HEIGHT;

        return(dx < dw && dy < dh)
    }

    //isAttack(player) {
    //    console.log(player.pos.x);
    //    let bx = Math.abs(this.pos.x - player.pos.x);
    //    let bw = Enemy.HALF_SIZE + Player.HALF_WIDTH;

    //    let by = Math.abs(this.pos.y - player.pos.y);
    //    let bh = Enemy.HALF_SIZE + Player.HALF_HEIGHT;

    //    return(bx < bw && by < bh)
    //}


    }

class EnemyManager {
    constructor() {
        this.score = 0;
        this.enemyList = [];
    }

    getScore() {
        return this.score;
    }

    generateEnemies() {
        let image = new Image();
        image.src = "img/teki.png";
        for (let h = 0; h < 5; h++) {
            for (let w = 0; w < 10; w++) {
                this.enemyList.push(
                    new Enemy(image,
                        50 + Enemy.SIZE * w,
                        50 + Enemy.SIZE * h));
            }
        }
    }

    //point(score) {
    //    if(this.collision) {
    //        this.score += 100;
    //        console.log(this.score)
    //    }
    //}

    draw(ctx) {
        this.enemyList.forEach(
            (enemy) => enemy.draw(ctx)
        );

        //クリア画面
        ctx.strokeStyle = "white";

        if (this.enemyList.length == 0) {
            ctx.fill();
            ctx.clearRect(0, 0, 800, 550);
            ctx.strokeText("GAME CLEAR!", 380, 300)
        }
    }

    collision(bullet) {
        if (bullet == null) {
            return;
        }
        const length = this.enemyList.length;
        for (let i = 0; i < length; i++) {
            if (this.enemyList[i].isCollision(bullet)) {
                this.enemyList.splice(i, 1);
                this.score += 100;
                bullet.setInvalidate();
                return;
            }

        }
    }

    //attack(player) {
    //    if (player == null) {
    //        return;
    //    }

    //    const length = this.enemyList.length;
    //    for (let i = 0; i < length; i++) {
    //        if (this.enemyList[i].isAttack(player)) {
    //            console.log("good");
    //            return;
    //        }

    //    }


    //}

}

window.addEventListener("DOMContentLoaded", function() {
    //必要な定数、変数を指定しておく
   const canvas = document.getElementById("main");
   const score = document.getElementById("sub");
   const ctx = canvas.getContext('2d');
   const WIDTH = canvas.width;
   const HEIGHT = canvas.height;
   const SPF = 1000 / 30;
   const PLAYER_SPEED = 5;

   let input = new Input();
   let player = new Player(input, WIDTH / 2, HEIGHT * 14 / 15, PLAYER_SPEED, WIDTH);

   //必要な初期化処理
    document.addEventListener("keydown", (evt) => input.onKeyDown(evt));
    document.addEventListener("keyup", (evt) => input.onKeyUp(evt));


    let manager = new EnemyManager();
    manager.generateEnemies();
    manager.getScore();

    //manager.attack(player.getPlayer());

    //let enemyImage = new Image();
    //enemyImage.src = "teki.png";
    //let enemy = new Enemy(enemyImage(), 300, 400);

    //メインループ
    let mainLoop = function() {
        //画面消去
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        //プレイヤーの描画
        player.draw(ctx);

        manager.collision(player.getBullet());

        //敵の描画
        manager.draw(ctx);

        score.innerHTML = manager.getScore();

        //再度この関数を呼び出す
        setTimeout(mainLoop, SPF);

    };
    setTimeout(mainLoop, SPF);
});
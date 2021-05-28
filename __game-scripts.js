// follow.js
var Follow = pc.createScript('follow');

Follow.attributes.add('target', {
    type: 'entity',
    title: 'Target',
    description: 'The Entity to follow'
});

Follow.attributes.add('distance', {
    type: 'number',
    default: 4,
    title: 'Distance',
    description: 'How far from the Entity should the follower be'
});

// initialize code called once per entity
Follow.prototype.initialize = function() {
    this.vec = new pc.Vec3();
};

// update code called every frame
Follow.prototype.update = function(dt) {
    if (!this.target) return;

    // get the position of the target entity
    var pos = this.target.getPosition();

    // calculate the desired position for this entity
    pos.x += 0.75 * this.distance;
    pos.y += 1.0 * this.distance;
    pos.z += 0.75 * this.distance;

    // smoothly interpolate towards the target position
    this.vec.lerp(this.vec, pos, 0.1);

    // set the position for this entity
    this.entity.setPosition(this.vec); 
};


// movement.js
var Movement = pc.createScript('movement');

Movement.attributes.add('speed', {
    type: 'number',    
    default: 0.1,
    min: 0.05,
    max: 0.5,
    precision: 2,
    description: 'Controls the movement speed'
});

// initialize code called once per entity
Movement.prototype.initialize = function() {
    this.force = new pc.Vec3();
};

// update code called every frame
Movement.prototype.update = function(dt) {
    var forceX = 0;
    var forceZ = 0;

    // calculate force based on pressed keys
    if (this.app.keyboard.isPressed(pc.KEY_LEFT)) {
        forceX = -this.speed;
    } 

    if (this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
        forceX += this.speed;
    }

    if (this.app.keyboard.isPressed(pc.KEY_UP)) {
        forceZ = -this.speed;
    } 

    if (this.app.keyboard.isPressed(pc.KEY_DOWN)) {
        forceZ += this.speed;
    }

    this.force.x = forceX;
    this.force.z = forceZ;

    // if we have some non-zero force
    if (this.force.length()) {

        // calculate force vector
        var rX = Math.cos(-Math.PI * 0.25);
        var rY = Math.sin(-Math.PI * 0.25);
        this.force.set(this.force.x * rX - this.force.z * rY, 0, this.force.z * rX + this.force.x * rY);

        // clamp force to the speed
        if (this.force.length() > this.speed) {
            this.force.normalize().scale(this.speed);
        }
    }

    // apply impulse to move the entity
    this.entity.rigidbody.applyImpulse(this.force);
};


// teleport.js
var Teleport = pc.createScript('teleport');

Teleport.attributes.add('target', {
    type: 'entity',
    title: 'Target Entity',
    description: 'The target entity where we are going to teleport'
});

// initialize code called once per entity
Teleport.prototype.initialize = function() {
    if (this.target) {
        // Subscribe to the triggerenter event of this entity's collision component.
        // This will be fired when a rigid body enters this collision volume.
        this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    }
};

Teleport.prototype.onTriggerEnter = function (otherEntity) {
    // it is not teleportable
    if (! otherEntity.script.teleportable)
        return;

    // teleport entity to the target entity
    otherEntity.script.teleportable.teleport(this.entity, this.target);
};


// Tablet.js
var Tablet = pc.createScript('tablet');
// initialize code called once per entity
Tablet.attributes.add('linkto', {
    type: 'entity',
    description: 'The particle effect to trigger when the Tablet is clicked'
});
Tablet.prototype.initialize = function() {

    

    this.app.mouse.disableContextMenu();


    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onSelect, this);
    
};

// update code called every frame
Tablet.prototype.update = function(dt) {
    
};

Tablet.prototype.onSelect = function (event) {
    // If the left mouse button is pressed, go to landing page
    
    if (event.button === pc.MOUSEBUTTON_LEFT) {
        window.open("https://landing-golonai.netlify.app/");
    }
};

// teleportable.js
var Teleportable = pc.createScript('teleportable');

// initialize code called once per entity
Teleportable.prototype.initialize = function() {
    this.lastTeleportFrom = null;
    this.lastTeleportTo = null;
    this.lastTeleport = Date.now(); 
    this.startPosition = this.entity.getPosition().clone();       
};

// update code called every frame
Teleportable.prototype.update = function(dt) {
    // Make sure we don't fall over. If we do then
    // teleport to the last location
    var pos = this.entity.getPosition();
    if (pos.y < 0) {
        this.teleport(this.lastTeleportFrom, this.lastTeleportTo);
    }
};


Teleportable.prototype.teleport = function(from, to) {
    // can't teleport too often (500ms)
    if (from && (Date.now() - this.lastTeleport) < 500)
        return;

    // set new teleport time
    this.lastTeleport = Date.now();

    // set last teleport targets
    this.lastTeleportFrom = from;
    this.lastTeleportTo = to;

    // position to teleport to
    var position;

    if (to) {
        // from target
        position = to.getPosition();
        // move a bit higher
        position.y += 0.5;
    } else {
        // to respawn location
        position = this.startPosition;
    }

    // move ball to that point
    this.entity.rigidbody.teleport(position);
    // need to reset angular and linear forces
    this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
    this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;            
};


// Television.js
var Television = pc.createScript('television');

// initialize code called once per entity
Television.prototype.initialize = function() {
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('mouseup', this.onRelease, this);
    this.entity.element.on('mouseleave', this.onLeave, this);
    
    this.entity.element.on('touchstart', this.onPress, this);
    this.entity.element.on('touchend', this.onRelease, this);
};
Television.prototype.onPress = function(event){

        var test = -10;
        this.app.fire('life', test);

};
// update code called every frame
Television.prototype.update = function(dt) {
    
};



// swap method called for script hot-reloading
// inherit your script state here
// Television.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// btnnewScene.js
var BtnnewScene = pc.createScript('btnnewScene');

BtnnewScene.attributes.add("sceneId", {type: "string", default: "0", title: "Scene ID to load"});
BtnnewScene.prototype.initialize = function(){
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('mouseup', this.onRelease, this);
    this.entity.element.on('mouseleave', this.onLeave, this);
    this.entity.element.on('touchstart', this.onPress, this);
    this.entity.element.on('touchend', this.onRelease, this);
};

BtnnewScene.prototype.onPress = function(event){
    var oldHierarchy = this.app.root.findByName('Root');
    
    oldHierarchy.destroy();
    this.loadScene(this.sceneId, function(){
        
    });
};

BtnnewScene.prototype.update = function(dt){
    
};

BtnnewScene.prototype.loadScene = function(id, callback){
    var url = id + ".json";
    this.app.loadSceneHierarchy(url, function(err, parent){
        if(!err){
            callback(parent);
        }else{
            console.error(err);
        }
    });
};

// click.js
var Click = pc.createScript('click');
Click.attributes.add('textElement', {type : 'entity' }); //รับ attribute ตรง text เลือด
// initialize code called once per entity
Click.prototype.initialize = function() {
    this.Health = 500; //เลือดเริ่มต้น
    this.mask = 0;
    this.app.on('enddaymath', function(select){
        this.mask = select;
    },this);
    this.app.on('randomseed', function(randoms){
        console.log(randoms);
        this.randoms = randoms;
    },this);
    // this.entity.element.on('mousedown', this.onPress, this);
    this.textElement.element.text = 500;
    
    this.app.on('cal',function(){
            if(this.randoms === 0){
                console.log('seen 0');
                if(this.mask == 1){ //N95
                    this.Health = this.Health - 30;  //เลือดลด 10
                }
                if(this.mask == 2){ //Medical Mask
                    this.Health = this.Health - 50;  //เลือดลด 10
                }
                if(this.mask == 3){ //FFP1
                    this.Health = this.Health - 30;  //เลือดลด 10
                }
                if(this.mask == 4){ //No mask
                    this.Health = this.Health - 80;  //เลือดลด 0
                }
            }
            if(this.randoms === 1){
                console.log('seen 1');
                if(this.mask == 1){ //N95
                    this.Health = this.Health - 40;  //เลือดลด 10
                }
                if(this.mask == 2){ //Medical Mask
                    this.Health = this.Health - 60;  //เลือดลด 10
                }
                if(this.mask == 3){ //FFP1
                    this.Health = this.Health - 30;  //เลือดลด 10
                }
                if(this.mask == 4){ //No mask
                    this.Health = this.Health - 90;  //เลือดลด 0
                }
            }
            if(this.randoms === 2){
                console.log('seen 2');
                 if(this.mask == 1){ //N95
                    this.Health = this.Health - 20;  //เลือดลด 10

                }
                if(this.mask == 2){ //Medical Mask
                    this.Health = this.Health - 30;  //เลือดลด 10
                }
                if(this.mask == 3){ //FFP1
                    this.Health = this.Health - 20;  //เลือดลด 10
                }
                if(this.mask == 4){ //No mask
                    this.Health = this.Health - 60;  //เลือดลด 0
                }
            }
            if(this.randoms === 3){
                console.log('seen 3');
                 if(this.mask == 1){ //N95
                    this.Health = this.Health - 25;  //เลือดลด 10

                }
                if(this.mask == 2){ //Medical Mask
                    this.Health = this.Health - 40;  //เลือดลด 10
                }
                if(this.mask == 3){ //FFP1
                    this.Health = this.Health - 25;  //เลือดลด 10
                }
                if(this.mask == 4){ //No mask
                    this.Health = this.Health - 70;  //เลือดลด 0
                }
            }
            if(this.randoms === 4){
                console.log('seen 4');
                 if(this.mask == 1){ //N95
                    this.Health = this.Health - 10;  //เลือดลด 10

                }
                if(this.mask == 2){ //Medical Mask
                    this.Health = this.Health - 10;  //เลือดลด 10
                }
                if(this.mask == 3){ //FFP1
                    this.Health = this.Health - 10;  //เลือดลด 10
                }
                if(this.mask == 4){ //No mask
                    this.Health = this.Health - 20;  //เลือดลด 0
                }
            }

        //this.app.root.findByName('stay!').enabled = false;

    
        this.textElement.element.text = this.Health; //แสดงจำนวนเลือดปัจจุบัน
        
        if(this.Health <= 0){
            app = this.app;
            this.textElement.element.text = 0;
            console.log("END");
            this.health = 500;
            this.app.root.findByName('Gameover').enabled = true;
            app.root.findByName('N95Button').enabled = false;
            app.root.findByName('MedicalButton').enabled = false;
            app.root.findByName('FFP1Button').enabled = false;
            app.root.findByName('FilterButton').enabled = false;
            app.root.findByName('Button_for_tablet').enabled = false;
            app.root.findByName('task').enabled = false;
            app.root.findByName('tvendday').enabled = false;
            app.root.findByName('blackboxend').enabled = true;
            app.root.findByName('Group').enabled = false;
        } 
    },this);
};
// Click.prototype.onPress = function(event){ //เมื่อคลิก
//     if(this.mask == 1){ //N95
//             this.Health = this.Health - 10;  //เลือดลด 10
//     }
//     if(this.mask == 2){ //Medical Mask
//             this.Health = this.Health - 10;  //เลือดลด 10
//     }
//     if(this.mask == 3){ //FFP1
//             this.Health = this.Health - 10;  //เลือดลด 10
//     }
//     if(this.mask == 4){ //Filter
//             this.Health = this.Health;  //เลือดลด 0
//     }
//     if(this.mask === 0){ //No mask
//             this.Health = this.Health - 100;  //เลือดลด 0
//     }
//    //this.app.root.findByName('stay!').enabled = false;

    
//     this.textElement.element.text = this.Health; //แสดงจำนวนเลือดปัจจุบัน
//     if(this.Health <= 0){
//        this.textElement.element.text = 0;
//         console.log("END");
//         this.app.root.findByName('Gameover').enabled = true;
//     }
    
    
// };


// tutor.js
var Tutortest = pc.createScript('tutor');

var button = Tutortest.attributes.add("input", {type: "string", default: "0", title: "button"});
Tutortest.prototype.initialize = function() {
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('mouseup', this.onRelease, this);
    this.entity.element.on('mouseleave', this.onLeave, this);
    
    this.entity.element.on('touchstart', this.onPress, this);
    this.entity.element.on('touchend', this.onRelease, this);
};

Tutortest.prototype.onPress = function(event){
    if(event.button === pc.MOUSEBUTTON_LEFT){
    this.obj(this.input, function(){
        
    });
    }
};
// update code called every frame
Tutortest.prototype.update = function(dt) {
    
};


Tutortest.prototype.obj = function(obj, callback){
    this.app.root.findByName(obj).enabled = false;
};


// tablettest.js
var Tablettest = pc.createScript('tablettest');

var url = Tablettest.attributes.add('urli',{type:'string', default: "0", title: "url"});
var url2 = Tablettest.attributes.add('urli2',{type:'string', default: "0", title: "url"});

Tablettest.prototype.initialize = function(){
    
    var Entity = this.entity;
    Entity.element.on('mousedown', this.onPress, this);
    this.app.mouse.disableContextMenu();
};

Tablettest.prototype.onPress = function(event){
    console.log(event.element.name);
    if(event.button === pc.MOUSEBUTTON_LEFT){
    this.loadweb(this.urli, function(){
        
    });
    }
    else if(event.button === pc.MOUSEBUTTON_RIGHT){
    this.loadweb(this.urli2, function(){
        
    });
    }

};

Tablettest.prototype.update = function(dt){
    
};

Tablettest.prototype.loadweb = function(link){
    var urli = link;
        window.open(urli);
};


// tv-test.js
var TvTest = pc.createScript('tvTest');
TvTest.attributes.add('textElement', {type : 'entity' });
TvTest.attributes.add('textElement2', {type : 'entity' });
TvTest.attributes.add('textElement3', {type : 'entity' });
var select = 0;
TvTest.prototype.initialize = function() {
    this.day = 1;
    this.entity.element.on('mousedown', this.onPress, this);
};

TvTest.prototype.onPress = function(event){

    this.day = this.day + 1;
    this.food = this.food - 1;
    if(event.button === pc.MOUSEBUTTON_LEFT){
        var app = this.app;
        app.fire('cal');
        app.fire('masked');
        this.app.root.findByName('tvendday').enabled = false;
        app.root.findByName('endday').enabled = false;
        app.root.findByName('Daygone').enabled = true;
        app.root.findByName('blackbox').enabled = true;
        app.root.findByName('player').enabled = false;
        this.textElement.element.text = "day"+this.day;
        this.textElement2.element.text = "day"+this.day;
        this.textElement3.element.text = this.day - 1 + " " + "day";
        setTimeout(function() {
            //app.fire('');
            app.root.findByName('Daygone').enabled = false;
            app.root.findByName('blackbox').enabled = false;
            app.root.findByName('player').enabled = true;
            app.root.findByName('1').enabled = false;
            app.root.findByName('2').enabled = false;
            app.root.findByName('3').enabled = false;
            app.root.findByName('4').enabled = false;
        }, 1200);
    }
};

// TvTest.prototype.onMath = function(select){
//     console.log(select);
// };



// distv.js
var Distv = pc.createScript('distv');
var button = Distv.attributes.add("input", {type: "string", default: "0", title: "obj"});
// initialize code called once per entity
Distv.prototype.initialize = function() {
    this.entity.element.on('mousedown', this.onPress, this);
};

Distv.prototype.onPress = function(event){
    if(event.button === pc.MOUSEBUTTON_LEFT){
        this.obj(this.input, function(){
        
    });
    }
};

Distv.prototype.obj = function(obj, callback){
    this.app.root.findByName(obj).enabled = true;
};



// notv.js
var Notv = pc.createScript('notv');

// initialize code called once per entity
Notv.prototype.initialize = function() {
    this.entity.element.on('mousedown', this.onPress, this);
};

Notv.prototype.onPress = function(event){
    if(event.button === pc.MOUSEBUTTON_LEFT){
        this.app.root.findByName('endday').enabled = false;
    }
};


// Mask.js
var Mask = pc.createScript('mask');
Mask.attributes.add('textElement', {type : 'entity' });
var select = Mask.attributes.add('mask',{type:'string', default: "0", title: "Choose"});
Mask.select = 0;

Mask.prototype.initialize = function(){
    this.mask1 = 10;
    this.mask2 = 10;
    this.mask3 = 10;
    this.min1 = 9;
    this.min2 = 9;
    this.min3 = 9;
    this.max1 = 10;
    this.max2 = 10;
    this.max3 = 10;
    this.check = 0;
    this.app.mouse.disableContextMenu();
    var Entity = this.entity;
    Entity.element.on('mousedown', this.onPress, this);
    this.app.on('masked', function(){
        if(this.check === 1){
            this.min1 -= 1;
            this.max1 -= 1;
            this.app.root.findByName('MedicalButton').enabled = true;
            this.app.root.findByName('FFP1Button').enabled = true;
            this.app.root.findByName('FilterButton').enabled = true;
        }
        if(this.check === 2){
            this.min2 -= 1;
            this.max2 -= 1;
            this.app.root.findByName('N95Button').enabled = true;
            this.app.root.findByName('FFP1Button').enabled = true;
            this.app.root.findByName('FilterButton').enabled = true;
        }
        if(this.check === 3){
            this.min3 -= 1;
            this.max3 -= 1;
            this.app.root.findByName('N95Button').enabled = true;
            this.app.root.findByName('MedicalButton').enabled = true;
            this.app.root.findByName('FilterButton').enabled = true;
        }
        if(this.check === 4){
            this.app.root.findByName('N95Button').enabled = true;
            this.app.root.findByName('MedicalButton').enabled = true;
            this.app.root.findByName('FFP1Button').enabled = true;
        }
        if(this.mask1 <= 0){
            this.app.root.findByName('N95text').enabled = false;
            this.app.root.findByName('N95Button').enabled = false;
            this.app.root.findByName('N95').enabled = false;
        }
        if(this.mask2 <= 0){
            this.app.root.findByName('MedicalMaskText').enabled = false;
            this.app.root.findByName('MedicalButton').enabled = false;
            this.app.root.findByName('MedicalMask').enabled = false;
        }
        if(this.mask3 <= 0){
            this.app.root.findByName('FFP1text').enabled = false;
            this.app.root.findByName('FFP1Button').enabled = false;
            this.app.root.findByName('FFP1').enabled = false;
        }
    },this);
};

Mask.prototype.onPress = function(event){
    if(event.button === pc.MOUSEBUTTON_LEFT){
        this.select(this.mask, function(){
        
    });
    }
    else if(event.button === pc.MOUSEBUTTON_RIGHT){
        this.select(this.mask, function(){
        
    });
    }
};

Mask.prototype.select = function(select){
    if(event.button === pc.MOUSEBUTTON_LEFT){
        this.app.fire('enddaymath',select);
        this.app.root.findByName('1').enabled = false;
        this.app.root.findByName('2').enabled = false;
        this.app.root.findByName('3').enabled = false;
        this.app.root.findByName('4').enabled = false;
        this.app.root.findByName(select).enabled = true;
        this.app.root.findByName('tvendday').enabled = true;
        if(this.mask1 > this.min1){
            if(select === '1'){
                this.mask1 = this.mask1 - 1;
                this.textElement.element.text = this.mask1;
                this.check = 1;
                this.app.root.findByName('MedicalButton').enabled = false;
                this.app.root.findByName('FFP1Button').enabled = false;
                this.app.root.findByName('FilterButton').enabled = false;
            }
        }
        if(this.mask2 > this.min2){
            if(select ==='2'){
                this.mask2 = this.mask2 - 1;
                this.textElement.element.text = this.mask2;
                this.check = 2;
                this.app.root.findByName('N95Button').enabled = false;
                this.app.root.findByName('FFP1Button').enabled = false;
                this.app.root.findByName('FilterButton').enabled = false;
            }
        }
        if(this.mask3 > this.min3){
            if(select === '3'){
                this.mask3 = this.mask3 - 1;
                this.textElement.element.text = this.mask3;
                this.check = 3;
                this.app.root.findByName('N95Button').enabled = false;
                this.app.root.findByName('MedicalButton').enabled = false;
                this.app.root.findByName('FilterButton').enabled = false;
            }
        }
        if(select === '4'){
            this.check = 4;
            this.app.root.findByName('N95Button').enabled = false;
            this.app.root.findByName('MedicalButton').enabled = false;
            this.app.root.findByName('FFP1Button').enabled = false;
        }
    }
    else if(event.button === pc.MOUSEBUTTON_RIGHT){ // 10 -> 9 -> 10 9+1 = 10
        if(this.mask1 < this.max1){
            if(select === '1'){
                this.mask1 = this.mask1 + 1;
                this.textElement.element.text = this.mask1;
                this.check = 4;
                this.app.root.findByName('MedicalButton').enabled = true;
                this.app.root.findByName('FFP1Button').enabled = true;
                this.app.root.findByName('FilterButton').enabled = true;
            }
        }
        if(this.mask2 < this.max2){
            if(select === '2'){
                this.mask2 = this.mask2 + 1;
                this.textElement.element.text = this.mask2;
                this.check = 4;
                this.app.root.findByName('N95Button').enabled = true;
                this.app.root.findByName('FFP1Button').enabled = true;
                this.app.root.findByName('FilterButton').enabled = true;
            }
        }
        if(this.mask3 < this.max3){
            if(select === '3'){
                this.mask3 = this.mask3 + 1;
                this.textElement.element.text = this.mask3;
                this.check = 4;
                this.app.root.findByName('N95Button').enabled = true;
                this.app.root.findByName('MedicalButton').enabled = true;
                this.app.root.findByName('FilterButton').enabled = true;
            }
        }
        if(select === '4'){
            this.check = 4;
            this.app.root.findByName('N95Button').enabled = true;
            this.app.root.findByName('MedicalButton').enabled = true;
            this.app.root.findByName('FFP1Button').enabled = true;
        }
        this.app.root.findByName(select).enabled = false;
        this.app.root.findByName('tvendday').enabled = false;
    }
};


// randomevent.js
var Randomevent = pc.createScript('randomevent');
// initialize code called once per entity
Randomevent.prototype.initialize = function() {
    this.entity.element.on('mousedown', this.onPress, this);
};


Randomevent.prototype.onPress = function(event){
    var random = pc.math.roundUp(pc.math.random(0,5),1)-1;
    var app = this.app;
    app.fire('randomseed',random);
    console.log(random);
    if(random === 0){
        app.root.findByName('event0').enabled = true;
        app.root.findByName('event1').enabled = false;
        app.root.findByName('event2').enabled = false;
        app.root.findByName('event3').enabled = false;
        app.root.findByName('event4').enabled = false;
        app.root.findByName('Boardbutton0').enabled = true;
        app.root.findByName('Boardbutton1').enabled = false;
        app.root.findByName('Boardbutton2').enabled = false;
        app.root.findByName('Boardbutton3').enabled = false;
        app.root.findByName('Boardbutton4').enabled = false;
    }
    if(random === 1){
        app.root.findByName('event0').enabled = false;
        app.root.findByName('event1').enabled = true;
        app.root.findByName('event2').enabled = false;
        app.root.findByName('event3').enabled = false;
        app.root.findByName('event4').enabled = false;
        app.root.findByName('Boardbutton0').enabled = false;
        app.root.findByName('Boardbutton1').enabled = true;
        app.root.findByName('Boardbutton2').enabled = false;
        app.root.findByName('Boardbutton3').enabled = false;
        app.root.findByName('Boardbutton4').enabled = false;
    }
    if (random === 2){
        app.root.findByName('event0').enabled = false;
        app.root.findByName('event1').enabled = false;
        app.root.findByName('event2').enabled = true;
        app.root.findByName('event3').enabled = false;
        app.root.findByName('event4').enabled = false;
        app.root.findByName('Boardbutton0').enabled = false;
        app.root.findByName('Boardbutton1').enabled = false;
        app.root.findByName('Boardbutton2').enabled = true;
        app.root.findByName('Boardbutton3').enabled = false;
        app.root.findByName('Boardbutton4').enabled = false;
    }
    if (random === 3){
        app.root.findByName('event0').enabled = false;
        app.root.findByName('event1').enabled = false;
        app.root.findByName('event2').enabled = false;
        app.root.findByName('event3').enabled = true;
        app.root.findByName('event4').enabled = false;
        app.root.findByName('Boardbutton0').enabled = false;
        app.root.findByName('Boardbutton1').enabled = false;
        app.root.findByName('Boardbutton2').enabled = false;
        app.root.findByName('Boardbutton3').enabled = true;
        app.root.findByName('Boardbutton4').enabled = false;
    }
    if (random === 4){
        app.root.findByName('event0').enabled = false;
        app.root.findByName('event1').enabled = false;
        app.root.findByName('event2').enabled = false;
        app.root.findByName('event3').enabled = false;
        app.root.findByName('event4').enabled = true;
        app.root.findByName('Boardbutton0').enabled = false;
        app.root.findByName('Boardbutton1').enabled = false;
        app.root.findByName('Boardbutton2').enabled = false;
        app.root.findByName('Boardbutton3').enabled = false;
        app.root.findByName('Boardbutton4').enabled = true;
    }

};


// update code called every frame
Randomevent.prototype.update = function(dt) {
    
};


// un-enabled.js
var UnEnabled = pc.createScript('unEnabled');

// initialize code called once per entity
UnEnabled.prototype.initialize = function() {
    app = this.app;
    this.entity.element.on('mousedown', this.onPress, this);
};

UnEnabled.prototype.onPress = function() {
    if(event.button === pc.MOUSEBUTTON_LEFT){
        app.root.findByName('N95Button').enabled = true;
        app.root.findByName('MedicalButton').enabled = true;
        app.root.findByName('FFP1Button').enabled = true;
        app.root.findByName('FilterButton').enabled = true;
        app.root.findByName('Button_for_tablet').enabled = true;
        app.root.findByName('task').enabled = true;
        app.root.findByName('tvendday').enabled = false;
        app.root.findByName('next').enabled = true;
        app.root.findByName('nextbutton').enabled = true;
    }
};

// mainmenu.js
var Mainmenu = pc.createScript('mainmenu');

Mainmenu.attributes.add("sceneId", {type: "string", default: "0", title: "Scene ID to load"});
Mainmenu.prototype.initialize = function(){
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('mouseup', this.onRelease, this);
    this.entity.element.on('mouseleave', this.onLeave, this);
    this.entity.element.on('touchstart', this.onPress, this);
    this.entity.element.on('touchend', this.onRelease, this);
};

Mainmenu.prototype.onPress = function(event){
    window.location.reload();
    
};

Mainmenu.prototype.update = function(dt){
    
};


// food.js
var Food = pc.createScript('food');
Food.attributes.add('textElement', {type : 'entity' });
var select = Food.attributes.add('task',{type:'string', default: "0", title: "Choose"});
Food.select = 0;

Food.prototype.initialize = function(){
    this.task1 = 4;
    this.min1 = 3;
    this.max1 = 4;
    this.check = 0;
    this.app.mouse.disableContextMenu();
    var Entity = this.entity;
    this.app.on('newweek',function(){
        if(this.task1 !== 0){
            this.app.fire('fail');
        }
        this.task1 = 4;
        this.min1 = 3;
        this.max1 = 4;
    },this);
    Entity.element.on('mousedown', this.onPress, this);
    this.app.on('tasked', function(){
        if(this.check === 1){
            this.min1 -= 1;
            this.max1 -= 1;
            this.app.root.findByName('Jobbutton2').enabled = true;
            this.app.root.findByName('Jobbutton3').enabled = true;
        }
        if(this.check === 2){
            this.app.root.findByName('Jobbutton1').enabled = true;
            this.app.root.findByName('Jobbutton3').enabled = true;
        }
        if(this.check === 3){
            this.app.root.findByName('Jobbutton1').enabled = true;
            this.app.root.findByName('Jobbutton2').enabled = true;
        }
        if(this.task1 <= 0){
            this.app.root.findByName('Jobbutton1').enabled = false;
            this.app.root.findByName('jobleft').enabled = false;
        }
    },this);
};

Food.prototype.onPress = function(event){
    if(event.button === pc.MOUSEBUTTON_LEFT){
        this.select(this.task, function(){
        
    });
    }
    else if(event.button === pc.MOUSEBUTTON_RIGHT){
        this.select(this.task, function(){
        
    });
    }
};

Food.prototype.select = function(select){
    if(event.button === pc.MOUSEBUTTON_LEFT){
        //this.app.fire('life', select);
        console.log(select);
        this.app.fire('tasked',select);
        this.app.root.findByName('Job1').enabled = false;
        this.app.root.findByName('Job2').enabled = false;
        this.app.root.findByName('Job3').enabled = false;
        this.app.root.findByName('Job' + select).enabled = true;
        this.app.root.findByName('tvendday').enabled = true;
        if(this.task1 > this.min1){
            if(select === '1'){
                //ทำงาน
                this.task1 = this.task1 - 1;
                this.textElement.element.text = "(" + this.task1 + " Left to do in this week.)";
                this.check = 1;
                this.app.root.findByName('Job1').enabled = true;
                this.app.root.findByName('J2').enabled = false;
                this.app.root.findByName('J3').enabled = false;
            }
        }
            if(select ==='2'){
                //ซื้ออาหาร
                this.check = 2;
                this.app.root.findByName('Job2').enabled = true;
                this.app.root.findByName('J1').enabled = false;
                this.app.root.findByName('J3').enabled = false;
                this.app.root.findByName('jobleft').enabled = false;
            }
            if(select === '3'){
                //อยู่บ้าน
                this.check = 3;
                this.app.root.findByName('Job3').enabled = true;
                this.app.root.findByName('J1').enabled = false;
                this.app.root.findByName('J2').enabled = false;
                this.app.root.findByName('jobleft').enabled = false;
            }
    }
    else if(event.button === pc.MOUSEBUTTON_RIGHT){ // 10 -> 9 -> 10 9+1 = 10
        if(this.task1 < this.max1){
            if(select === '1'){
                this.task1 = this.task1 + 1;
                this.textElement.element.text = "(" + this.task1 + " Left to do in this week.)";
                this.check = 0;
                this.app.root.findByName('J1').enabled = true;
                this.app.root.findByName('Job1').enabled = false;
                this.app.root.findByName('J2').enabled = true;
                this.app.root.findByName('J3').enabled = true;
            }
        }
            if(select === '2'){
                this.check = 0;
                this.app.root.findByName('J1').enabled = true;
                this.app.root.findByName('Job2').enabled = false;
                this.app.root.findByName('J2').enabled = true;
                this.app.root.findByName('J3').enabled = true;
                this.app.root.findByName('jobleft').enabled = true;
            }
            if(select === '3'){
                this.check = 0;
                this.app.root.findByName('J1').enabled = true;
                this.app.root.findByName('Job3').enabled = false;
                this.app.root.findByName('J2').enabled = true;
                this.app.root.findByName('J3').enabled = true;
                this.app.root.findByName('jobleft').enabled = true;
            }
        this.app.root.findByName(select).enabled = false;
        this.app.root.findByName('tvendday').enabled = false;
    }
};


// tast.js
var Tast = pc.createScript('tast');

var button = Tast.attributes.add("input", {type: "string", default: "0", title: "button"});
Tast.prototype.initialize = function() {
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('mouseup', this.onRelease, this);
    this.entity.element.on('mouseleave', this.onLeave, this);
    
    this.entity.element.on('touchstart', this.onPress, this);
    this.entity.element.on('touchend', this.onRelease, this);
};

Tast.prototype.onPress = function(event){
    if(event.button === pc.MOUSEBUTTON_LEFT){
    this.obj(this.input, function(){
        
    });
    }
};
// update code called every frame
Tast.prototype.update = function(dt) {
    
};


Tast.prototype.obj = function(obj, callback){
    this.app.root.findByName(obj).active = false;
};


// open.js
var Open = pc.createScript('open');

var button = Open.attributes.add("input", {type: "string",title: "step"});
Open.attributes.add('textElement', {type : 'entity' });
var step = 0;
Open.prototype.initialize = function() {
    this.app.count = 0;
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('touchstart', this.onPress, this);
    this.entity.element.on('touchend', this.onRelease, this);
    this.app.on("nextstep",function(select){
        this.app.count = select;
        console.log("after");
        console.log(this.app.count);
        if(this.app.count === 0){
            //ลบปุ่มกลับกันไว้ อันนี้คือแนะนำสถานะการคราวๆ
            this.app.root.findByName('welcome').enabled = true;
            this.app.root.findByName('MaskGuide1').enabled = false;
            this.app.root.findByName('MaskGuide2').enabled = false;
            this.app.root.findByName('N95guide').enabled = false;
            this.app.root.findByName('MedicalMaskGuide').enabled = false;
            this.app.root.findByName('FFP1Guide').enabled = false;
            this.app.root.findByName('shelfgrow').enabled = false;
            
            this.app.root.findByName('backbutton').enabled = false;
            this.app.root.findByName('back').enabled = false;
        }
        if(this.app.count === 1){
            //ปุ่มกลับ กลับมา แล้วก็แนะนำหน้ากาก
            this.app.root.findByName('TVtext').enabled = false;
            this.app.root.findByName('MaskGuide1').enabled = true;
            this.app.root.findByName('MaskGuide2').enabled = true;
            this.app.root.findByName('N95guide').enabled = true;
            this.app.root.findByName('MedicalMaskGuide').enabled = true;
            this.app.root.findByName('FFP1Guide').enabled = true;
            this.app.root.findByName('shelfgrow').enabled = true;
            this.app.root.findByName('welcome').enabled = false;
            this.app.root.findByName('tvgrow').enabled = false;
            
            this.app.root.findByName('backbutton').enabled = true;
            this.app.root.findByName('back').enabled = true;

        }
        if(this.app.count === 2){
            //แนะนำทีวีต่อเลย
            this.app.root.findByName('MaskGuide1').enabled = false;
            this.app.root.findByName('MaskGuide2').enabled = false;
            this.app.root.findByName('N95guide').enabled = false;
            this.app.root.findByName('MedicalMaskGuide').enabled = false;
            this.app.root.findByName('FFP1Guide').enabled = false;
            this.app.root.findByName('taskguide').enabled = false;
            this.app.root.findByName('TVtext').enabled = true;
            this.app.root.findByName('tvgrow').enabled = true;
            this.app.root.findByName('shelfgrow').enabled = false;
            this.app.root.findByName('taskgrow').enabled = false;
        }
        if(this.app.count === 3){
            //แนะนำ task
            this.app.root.findByName('TVtext').enabled = false;
            this.app.root.findByName('taskguide').enabled = true;
            this.app.root.findByName('taskgrow').enabled = true;
            this.app.root.findByName('tvgrow').enabled = false;
            this.app.root.findByName('Button_for_tabletgrow').enabled = false;
            
            this.app.root.findByName('landingguide2').enabled = false;
            this.app.root.findByName('landingguide1').enabled = false;
        }
        if(this.app.count === 4){
            //แนะนำ tablet
            this.app.root.findByName('landingguide2').enabled = true;
            this.app.root.findByName('landingguide1').enabled = true;
            this.app.root.findByName('Button_for_tabletgrow').enabled = true;
            this.app.root.findByName('taskguide').enabled = false;
            this.app.root.findByName('taskgrow').enabled = false;
        }
        if(this.app.count === 5){
            //แนะนำอาหาร ไม่ก็ปิดการแนะนำ
            this.app.root.findByName('N95Button').enabled = true;
            this.app.root.findByName('MedicalButton').enabled = true;
            this.app.root.findByName('FFP1Button').enabled = true;
            this.app.root.findByName('FilterButton').enabled = true;
            this.app.root.findByName('Button_for_tablet').enabled = true;
            this.app.root.findByName('task').enabled = true;
            this.app.root.findByName('tvendday').enabled = false;
            this.app.root.findByName('next').enabled = false;
            this.app.root.findByName('nextbutton').enabled = false;
            this.app.root.findByName('backbutton').enabled = false;
            this.app.root.findByName('back').enabled = false;
            this.app.root.findByName('landingguide2').enabled = false;
            this.app.root.findByName('landingguide1').enabled = false;
            this.app.root.findByName('Button_for_tabletgrow').enabled = false;
        }
    },this);
};

Open.prototype.onPress = function(event){
    if(event.button === pc.MOUSEBUTTON_LEFT){
        if(this.input === 'next'){
            console.log('next');
            this.app.count = this.app.count + 1;
            console.log(this.app.count);
            this.app.fire("nextstep",this.app.count);
            if(this.app.count === 4){
                this.textElement.element.text = "let go";
            }
        }
          if(this.input === 'none'){
            this.app.count = this.app.count + 1;
            this.app.count = this.app.count - 1;
        }
        if(this.input === 'back'){
            console.log('back');
            this.app.count = this.app.count - 1;
            console.log(this.app.count);
            this.app.fire("nextstep",this.app.count);
            if(this.app.count === 3){
                this.textElement.element.text = "next";
            }
            
        }
    }
     
};

// Open.prototype.obj = function(obj, callback){
//     this.app.root.findByName(obj).enabled = true;
// };
// Open.prototype.obj2 = function(obj, callback){
//     this.app.root.findByName(obj).enabled = false;
// };
// Open.prototype.obj3 = function(obj, callback){
//     this.app.root.findByName(obj).enabled = true;
// };
// Open.prototype.obj4 = function(obj, callback){
//     this.app.root.findByName(obj).enabled = false;
// };


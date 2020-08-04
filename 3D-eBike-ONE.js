	
	/*
	All Copyrights Reserved to Jorge Rosa (Portugal)
	Email: jorge.bigarte@gmail.com
	Portfolio: https://sites.google.com/site/jorgerosaportfolio
	With love to ASCR!
	*/	
	
	// --------------------------------------------------------------------------
	// --------------------------------------------------------------------------
	
	// This Model Specific Variables:
	var path = '3D-eBike-ONE/';
	var distance = 68;

	// --------------------------------------------------------------------------
	// --------------------------------------------------------------------------
	
	
	// Internet Browser has WebGl?...
	if (!Detector.webgl){
	document.getElementById('info').innerHTML = 'INFORMAÇÃO:<br />O seu navegador não suporta WebGL.<br />Não é possível apresentar o modelo em 3D.';
	};
	
	
	// Common Global Variables:
	var container;
	var stats;
	var camera, mirrorscamera, scene, renderer, controls;
	var mWIDTH  = window.innerWidth/2;
	var mHEIGHT = window.innerHeight/2;
	var autorotatetimeout;
	var maxanisotropy = 1;
	var ambientlight;
	var light1, lightIsOn = false; rotationStarted = false;
	// var helper1, helper2;
	var mirrors;
	var skytexture;
	// var composer, hblur, vblur;
	
	
	// Run:
	initialize();
	fill();
	draw();	

	// --------------------------------------------------------------------------
	
	// Function: Initialize 3D Javascript		
	function initialize() {
	window.addEventListener('resize', onWindowResize, false);
	container = document.createElement('div');
	document.body.appendChild(container);
	document.body.style.cursor = 'move';
				
	// Renderer:
	renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
	container.appendChild(renderer.domElement);
	renderer.setClearColor(0x000000, 1.0);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.sortObjects = true; // false == The objects will render in the order they are added to the scene
	renderer.autoClear = true;
	renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
	maxanisotropy = renderer.getMaxAnisotropy();					
				
	// Scene:
	scene = new THREE.Scene();	
	
	// Global light:
	ambientlight = new THREE.AmbientLight(0x303030); // 0xCCCCCC - Hexadecimal color (recommended)
	scene.add(ambientlight);
				
	// Fog:
	// scene.fog = new THREE.FogExp2(0xBBBBBB, 0.0010); // Near
				
	// Camera: (Normal)
	camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, 1.0, 5000); // Normal FOV is 45, PerspectiveCamera( fov, aspect, near, far )
	scene.add(camera); // Attach first!
	camera.position.set(0, 140, distance);
	// camera.position.set(0, 64, distance);
	// camera.target.set(0, 77, 0); // view direction perpendicular to XY-plane
	camera.castShadow = false;
	camera.receiveShadow = false;	

	
	// Light 1: (Attached to the camera)
	light1 = new THREE.SpotLight(0xFFFFFF); // https://threejs.org/docs/api/lights/SpotLight.html
	camera.add(light1); // Attach first!
	// light1.position.set(camera.position.x, camera.position.y, camera.position.z); // == To be in the SAMME position of camera == Gives Glitches !!!
	light1.castShadow = true;
	light1.receiveShadow = false;
	// light1.shadowMapVisible = true;
	light1.shadow.mapSize.width  = 1024; // 1024
	light1.shadow.mapSize.height = 1024; // 1024
	light1.shadow.camera.near = 1;
	light1.shadow.camera.far = 5000;
	light1.shadow.camera.fov = THREE.Math.radToDeg(2*light1.angle);	
	light1.intensity = 1.00;
	// Light 1 Target:
	var light1target = new THREE.Object3D();
	camera.add(light1target); // Attach first!
	light1target.name = 'lightTarget1';	
	light1target.position.set(0, 120, 0);	
	light1target.add(light1);
	light1target.castShadow = false;
	light1target.receiveShadow = false;
	// Add a target to this light:
	light1.target = light1target;
	light1.visible = false; // Light is OFF
	
				
	// Controls:
	controls = new THREE.OrbitControls(camera, renderer.domElement);				
	controls.target.set(0, 64, 0); // View direction
	controls.autoRotate = false;	
	controls.enableRotate = true;
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.enableDamping = false;
	// Movements:
	controls.autoRotateSpeed = 3.0;
	controls.dampingFactor = 0.25; // 0.25 is default
	controls.rotationSpeed = 0.5;
	controls.movementSpeed = 0.5;
	controls.lookSpeed = 0.05;
    controls.rollSpeed = 0.5;
	// Zoom:
	controls.zoomSpeed = 0.5; // 1.0 is default
	controls.minDistance = distance;
	controls.maxDistance = 250;
	// Where to stop Y rotation:
	controls.minPolarAngle = Math.PI/8; // radians (Altura maxima)
	controls.maxPolarAngle = Math.PI/2 - 0.09; // radians (Altura minima), - 0.05 para evitar transparencies glitches (sombra que vem com o modelo)

	// controls.mouseButtons = { PAN:THREE.MOUSE.LEFT, ZOOM:THREE.MOUSE.MIDDLE, ORBIT:THREE.MOUSE.RIGHT }; // swapping left and right buttons
	// THREE.MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 0 };
	controls.mouseButtons = { ORBIT: THREE.MOUSE.LEFT };

	// stop autorotate after the first interaction
	controls.addEventListener('start', function(){
	clearTimeout(autorotatetimeout); // Reset Delay
	controls.autoRotate = false;
	});
	
	// restart autorotate after the last interaction & an idle time has passed
	controls.addEventListener('end', function(){
	autorotatetimeout = setTimeout(function(){
	controls.autoRotate = true;
	}, 1000); // Delay 1000 == 1 Second
	});
	
	// Effects:
	/*
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );
	hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	composer.addPass( hblur );				
	vblur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	vblur.renderToScreen = true;
	composer.addPass( vblur );
	*/
				
	}; // End: initialize()
	
	// --------------------------------------------------------------------------
	
	// Function: Create 3D World	
	function fill() {	
	
	// Progressbar:
	var progressbar = document.getElementById('progressbar');	
	var loadingmanager = new THREE.LoadingManager();
	// Loading...
	loadingmanager.onProgress = function (item, loaded, total) {
	progressbar.style.width = (loaded/total*100) + '%';
	console.log(item, loaded, total); // Write to console...
	};
	// Loaded...
	loadingmanager.onLoad = function () {	
	progressbar.style.display = 'none';      // Hide
	progressbar.style.visibility = 'hidden'; // Hide
	// document.getElementById('info').innerHTML = 'Botão esquerdo do RATO: <strong>Rotação</strong>';
	console.log('All items were loaded!');   // Write to console...	
	};
	// Error...
	loadingmanager.onError = function () {
	progressbar.style.display = 'none';        // Hide
	progressbar.style.visibility = 'hidden';   // Hide
    console.log('There has been an error...'); // Write to console...
	};	
	
	// Tool: Degrees Function
	var setDegrees = function(degree) { return degree*(Math.PI/180); };
	
	
	// 1) 3D Model: Create the SKY (Background)
	var skygeometry = new THREE.SphereGeometry(4000, 12, 12);
	skytexture = new THREE.TextureLoader(loadingmanager).load(path+'maps/sky.jpg', function(material) {
    material = new THREE.MeshBasicMaterial({ map:skytexture }); // MeshBasicMaterial == No affected by lights
    var skymesh = new THREE.Mesh(skygeometry, material);	
    scene.add(skymesh);
	skymesh.material.side = THREE.BackSide;
	skymesh.castShadow = false;
	skymesh.receiveShadow = false;
	});	
	
		
	// 2) 3D Model: Load the Vehicle
	var mtlLoader = new THREE.MTLLoader(loadingmanager);
	mtlLoader.setTexturePath(path);
	mtlLoader.setPath(path);
	mtlLoader.load('ebike.mtl', function(materials) {
	materials.preload();
	var objLoader = new THREE.OBJLoader(loadingmanager);					
	objLoader.setMaterials(materials);
	objLoader.setPath(path);
	objLoader.load('ebike.obj', function (object) {
	scene.add(object); // Attach first!
	object.name = 'myVehicle';
	object.scale.set(1,1,1);
	object.position.set(0, 50.0, 0);
	// object.rotateY(-Math.PI/2.8);  // To start with a lateral view
	object.rotateY(setDegrees(-130)); // To start with a lateral view
	// object.renderOrder = 2;
	set_materials_for('myVehicle');
	create_mirror_effect_for('Espelho_001');
	create_mirror_effect_for('Espelho_002');
	// create_reflexes_for('Body_01'); --- TODO
	});	
	});	

	// Make these materials double sided:
	function set_materials_for(name) {
	var object = scene.getObjectByName(name, true);
	if (object!=null){
	object.traverse( function(node) {
	if (node.texture){
	node.texture.anisotropy = maxanisotropy; // High quality textures
	};
	if (node.material){ 
	node.material.side = THREE.DoubleSide;
	node.material.fog = false;
	node.castShadow = true;
	node.receiveShadow = true;
	// console.log( name + ' mat' ); // Write to console...
	}; 
	});
	};
	};	
	

	
	// Create real-time mirrors: (material from camera)
	mirrorscamera = new THREE.CubeCamera(50, 5000, 64); // Since the sky, to be reflected, is at 4000...
	mirrors = new THREE.MeshPhongMaterial({ side:THREE.FrontSide, emissive:0xFFFFFF, envMap:mirrorscamera.renderTarget });
	// mirrors = new THREE.MeshBasicMaterial({ side:THREE.FrontSide, emissive:0xFFFFFF, envMap:mirrorscamera.renderTarget });
	mirrors.castShadow = false;
	mirrors.receiveShadow = false;
	
	// Apply mirror materials:
	function create_mirror_effect_for(name) {
	var object = scene.getObjectByName(name, true);
	if (object!=null){
	object.traverse( function(node) {		
	if (node.name == name){
	node.material = mirrors; // Apply mirror material
	mirrorscamera.position = node.position;
    mirrorscamera.rotation = node.rotation;
	}; 
	});
	console.log( 'Mirror: Found node: ' + name );   // Write to console...
	} else {
	console.log( 'Mirror: Missing node: ' + name ); // Write to console...		
	};
	};	
	
	
	// 3) Lines: Create Lines...
	var groupinfos = new THREE.Object3D(); // Create an empty container
	scene.add(groupinfos); // Attach first!
	var linesmaterial = new THREE.LineBasicMaterial({ color:0xFFFFFF }); // Common lines material
	
	// Line n.1: (Comprimento total do veiculo)	
	var geometry1 = new THREE.Geometry();
	geometry1.vertices.push( new THREE.Vector3(-5,  50.5, 5), new THREE.Vector3(-5, 73.0, 5) );
	var line1 = new THREE.Line(geometry1, linesmaterial);
	groupinfos.add(line1);
	
	// Line n.2: (Altura chao ate ao guiador)
	var geometry2 = new THREE.Geometry();
	geometry2.vertices.push( new THREE.Vector3(5,  50.5, 5), new THREE.Vector3(5, 66.0, 5) );
	var line2 = new THREE.Line(geometry2, linesmaterial);
	groupinfos.add(line2);
	
	// Line n.3: (Altura chao ate ao selim)	
	var geometry3 = new THREE.Geometry();
	geometry3.vertices.push( new THREE.Vector3(-16,  50.5, 5), new THREE.Vector3(14, 50.5, 5) );
	var line3 = new THREE.Line(geometry3, linesmaterial);
	groupinfos.add(line3);
	
	// Line n.4: (Largura do guiador)
	var geometry4 = new THREE.Geometry();
	geometry4.vertices.push( new THREE.Vector3(-5,  73.0, 8), new THREE.Vector3(-5, 73.0, -8) );
	var line4 = new THREE.Line(geometry4, linesmaterial);
	groupinfos.add(line4);	
	
	// 4) 2D Stuff: Sprites
	// Sprite n.1: (Largura do guiador)
	var spriteInfo1TextureLoader = new THREE.TextureLoader(loadingmanager).load(path+'maps/sprite_dim1.png', function(material) {	
	material = new THREE.SpriteMaterial({ map:spriteInfo1TextureLoader }); // SpriteMaterial == No affected by lights
    var sprite = new THREE.Sprite(material);	
	groupinfos.add(sprite); // Attach first!
	sprite.name = 'mySpriteInfo1';	
	sprite.position.set(-5, 74.5, 0);
	sprite.scale.set(6, 3, 1); // imageWidth, imageHeight	
	// sprite.material.side = THREE.BackSide;
	sprite.castShadow = false;
	sprite.receiveShadow = false;	
	});

	// Sprite n.2: (Altura chao ate ao selim)
	var spriteInfo2TextureLoader = new THREE.TextureLoader(loadingmanager).load(path+'maps/sprite_dim2.png', function(material) {	
	material = new THREE.SpriteMaterial({ map:spriteInfo2TextureLoader }); // SpriteMaterial == No affected by lights
    var sprite = new THREE.Sprite(material);	
	groupinfos.add(sprite); // Attach first!
	sprite.name = 'mySpriteInfo2';	
	sprite.position.set(5, 60, 6);
	sprite.scale.set(6, 3, 1); // imageWidth, imageHeight	
	// sprite.material.side = THREE.BackSide;
	sprite.castShadow = false;
	sprite.receiveShadow = false;	
	});
	
	// Sprite n.3: (Altura chao ate ao guiador)
	var spriteInfo3TextureLoader = new THREE.TextureLoader(loadingmanager).load(path+'maps/sprite_dim3.png', function(material) {	
	material = new THREE.SpriteMaterial({ map:spriteInfo3TextureLoader }); // SpriteMaterial == No affected by lights
    var sprite = new THREE.Sprite(material);	
	groupinfos.add(sprite); // Attach first!
	sprite.name = 'mySpriteInfo3';	
	sprite.position.set(-5, 66, 6);
	sprite.scale.set(6, 3, 1); // imageWidth, imageHeight	
	// sprite.material.side = THREE.BackSide;
	sprite.castShadow = false;
	sprite.receiveShadow = false;	
	});
	
	// Sprite n.4: (Comprimento total do veiculo)
	var spriteInfo4TextureLoader = new THREE.TextureLoader(loadingmanager).load(path+'maps/sprite_dim4.png', function(material) {	
	material = new THREE.SpriteMaterial({ map:spriteInfo4TextureLoader }); // SpriteMaterial == No affected by lights
    var sprite = new THREE.Sprite(material);	
	groupinfos.add(sprite); // Attach first!
	sprite.name = 'mySpriteInfo4';	
	sprite.position.set(14, 52, 5);
	sprite.scale.set(6, 3, 1); // imageWidth, imageHeight	
	// sprite.material.side = THREE.BackSide;
	sprite.castShadow = false;
	sprite.receiveShadow = false;	
	});

	
	/*
	// Fonts ( Convert font '.ttf' to '.json' or '.js': http://gero3.github.io/facetype.js/ )	
	var fontLoader = new THREE.FontLoader(loadingmanager);
	fontLoader.load(path+'maps/fonte1.json', function (font) {
    var textgeometry = new THREE.TextGeometry("Bicicleta", {
    font:font,
    size:3,
    height:1,
    curveSegments:12,
    bevelThickness:0,
    bevelSize:0,
    bevelEnabled:false
    });
    var textmaterial = new THREE.MeshBasicMaterial({side:THREE.DoubleSide, color:0xFFFFFF});
    var textmesh = new THREE.Mesh(textgeometry, textmaterial);
	groupinfos.add(textmesh);
    // camera.add(textmesh);
	textmesh.position.set(0, 70, 0);
	});
	*/
	
	
	// Add this infos group to the main scene:	
	groupinfos.rotateY(setDegrees(-40)); // To match lines with the main model rotation
	groupinfos.visible = true;

	
	
	
	/*

	// load a texture, set wrap mode to repeat
	var original = new THREE.TextureLoader().load(path+'maps/text_metallics.jpg');
	var reflex = new THREE.TextureLoader().load(path+'maps/reflex.jpg');
	
	// var originaltexture = new THREE.TextureLoader(loadingmanager).load(path+'maps/text_metallics.jpg', function(material) {
	var reflexes = new THREE.MeshPhongMaterial({ 
	side:THREE.DoubleSide,
	color:0xFFFFFF,
	// ambient:0xFFFFFF,
	// shininess: 50,
	// specular:0x555555,
	map:original,
	// envMap:skytexture,
	// envMap:reflex,
	alphaMap:mirrorscamera.renderTarget,
	// alphaMap:mirrorscamera.renderTarget,
    combine:THREE.MixOperation, 
    reflectivity:0.9
	});
	
	reflexes.needsUpdate = true;
	
	// Apply reflective materials:
	function create_reflexes_for(name) {
	var object = scene.getObjectByName(name, true);
	if (object!=null){
	object.traverse( function(node) {		
	if (node.name == name){	
	
	node.material = reflexes; // Apply reflex material
	node.material.side = THREE.DoubleSide;
	node.material.fog = false;
	node.castShadow = true;
	node.receiveShadow = true;
	
	}; 
	});
	console.log( 'Reflex: Found node: ' + name );   // Write to console...
	} else {
	console.log( 'Reflex: Missing node: ' + name ); // Write to console...		
	};
	};		
	*/
	

	
	/*
	// 3) 2D Stuff: Create Sprites
	var spriteTitleTextureLoader = new THREE.TextureLoader(loadingmanager).load(path+'maps/sprite_title.png', function(material) {	
	material = new THREE.SpriteMaterial({ map:spriteTitleTextureLoader }); // SpriteMaterial == No affected by lights
    var sprite = new THREE.Sprite(material);	
	camera.add(sprite); // Attach first!
	sprite.name = 'mySpriteTitle';	
	sprite.position.set(0, 15.8, -105);
	sprite.scale.set(20, 10, 1.0); // imageWidth, imageHeight	
	// sprite.material.side = THREE.BackSide;
	sprite.castShadow = false;
	sprite.receiveShadow = false;	
	});
	*/
	
	
	}; // End: fill()
	
	


	
	// Lights:
	function lightwaiting() {
	// setTimeout(function (){ light1.visible = true; }, 1000); // Delay 1000 == 1 Second	
	setTimeout(function (){ light1.visible = true; lightIsOn = true; ambientlight.color.setHex(0xCACACA); }, 500); // Delay 1000 == 1 Second	
	};
	// Starts now the rotation:
	function rotationwaiting() {
	setTimeout(function (){ controls.autoRotate = true; rotationStarted = true; }, 600); // Delay 1000 == 1 Second	
	};	
	
	
	// Global:
	function onWindowResize() {
	// mWIDTH  = window.innerWidth/2;
	// mHEIGHT = window.innerHeight/2;
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	};	
	
	
	// --------------------------------------------------------------------------
	
	
	// Function: Render 3D World	
	function draw() {	
	// Debug Only:
	// console.log( 'Camera X: ' + camera.position.x );   // Write to console...
	// Turn ON Lights & Start the Rotation:
	if(!lightIsOn){ lightwaiting(); };
	if(lightIsOn && !rotationStarted){ rotationwaiting(); };
	// Controls:
	if (controls != null){ controls.update(); };
	// Render Elements:
	if (renderer != null){ renderer.render(scene, camera); };
	// Render real-time Mirrors:
	if (mirrorscamera != null){ mirrorscamera.updateCubeMap(renderer, scene); };
	// Effects:
	// composer.render();	
	// Mirror: (Must be after main renderer!... Else sometimes render, sometimes not)
	// if (mirror1 != null){ mirror1.render(); };
	// if (mirror2 != null){ mirror2.render(); };
	// Stats:
	// if (stats != null){ stats.update(); };
	// Render: (Loops this function itself)
	requestAnimationFrame(draw);
	};
	
	

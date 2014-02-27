#pragma strict

var grid_x:int;
var grid_y:int;	
var rocket_interval:float;
var mine_count:int;
var tagged_tiles: int = 0;
var tiles_left:int;

var tiles:Tile[];
private var last_rocket:int = 0;

private var game_playing = false;

var tile:Tile;
var rocket:Rocket;

var scoreboard:GUIText;
var mineboard:GUIText;
var tileboard:GUIText;

var score:int;

var cheat_mode = false;

var playtime_gui:GameObject;
var main_menu:GameObject;
var game_over:GameObject;

function Awake() {
	playtime_gui.SetActive(false);
	game_over.SetActive(false);
	//SetDifficulty(2);
	GenerateLevel();
}

function StartGame() {
	main_menu.SetActive(false);
	playtime_gui.SetActive(true);
	yield WaitForSeconds(0.5);
	game_playing = true;
}

function SetDifficulty(val:int) {
	var _fov;
	
	switch(val) {
		case 1: 
		grid_x = 8;
		grid_y = 8;
		mine_count = 10;
		_fov = 45;
		
		break;
		
		case 2: 
		grid_x = 20;
		grid_y = 20;
		mine_count = 50;
		_fov = 85;
		break;
		
		case 3: 
		grid_x = 30;
		grid_y = 30;
		mine_count = 120;
		_fov = 105;
		break;
	}
	
	GameObject.FindGameObjectWithTag("MainCamera").camera.fieldOfView = _fov;
	GenerateLevel();
}

function GenerateLevel () {
	var i:int;
	var j:int;
	var mine_remaining = mine_count;
	
	// destroy grid if existing
	if(this.tiles.length > 0){
	for(var _t:Tile in tiles) {
		GameObject.Destroy(_t.gameObject);
	}
	}
	
	// deploy mines
	this.tiles = new Tile[grid_x * grid_y];
	
	for(i = 0; i < grid_x; i++) {
		for(j = 0; j < grid_y; j++) {
			var tile:Tile = Instantiate(tile);
			tile.name = "tile";
			tile.tag = "tile";
			//tile.unopened_tile.renderer.material.color = Color.green;
			tile.transform.position.x = (-(grid_x / 2.0) + i) * 1.4;
			tile.transform.position.y = (-(grid_y / 2.0) + j) * 1.4;
			tile.gridx = i;
			tile.gridy = j;
			tiles[grid_x * i + j] = tile;
			if(mine_remaining > 0 && mine_count * 1.0/(grid_x*grid_y) >= Random.value) {
				tile.is_mine = true;
				mine_remaining --;
			}
		}
	}
	
	while(mine_remaining > 0) {
		for(i = 0; i < grid_x; i++) {
			for(j = 0; j < grid_y; j++) {
				tile = tiles[grid_x * i + j];
				if(tile.is_mine == false && mine_count * 1.0/(grid_x*grid_y) >= Random.value) {
					tile.is_mine = true;
					mine_remaining --;
				}
				if(mine_remaining == 0) break;
			}
			if(mine_remaining == 0) break;
		}
	
	}
	
	for(i = 0; i < grid_x; i++) {
		for(j = 0; j < grid_y; j++) {
			tile = tiles[grid_x * i + j];
			if(tile.is_mine) {
				if(cheat_mode) tile.GetComponent("UnopenedTile").renderer.material.color = Color.red;
				markAdjacent(i, j);
			}
		}
	}
	
	// init score
	score = 0;
	
	tiles_left = grid_x * grid_y;
	tileboard.text = tiles_left.ToString();
	
	//display mine count
	mineboard.text = mine_count.ToString();
}

function markAdjacent(i:int, j:int) {
	var a:int; var b:int; var temp_tile:Tile; var utemp_tile:Component;
	for(a = -1; a <= 1; a++) {
		for(b = -1; b <= 1; b++) {
			if(i+a >= 0 && j+b >=0 && i+a <grid_x && j+b < grid_y && !(a == 0 && b == 0)){
				temp_tile = tiles[grid_x * (i+a) + (j+b)];
				temp_tile.adjacent ++;
				temp_tile.mine_count_text.text = temp_tile.adjacent.ToString();
				if(!temp_tile.is_mine && cheat_mode) {
					temp_tile.unopened_tile.renderer.material.color.r += .125;
					temp_tile.unopened_tile.renderer.material.color.g += .125;
					temp_tile.unopened_tile.renderer.material.color.b += .125;
					temp_tile.mine_count_text.renderer.enabled = true;
				}
			}
		}
	}
}

function add_score(amount:int) {
	score += amount;
}

function Update () { 
	if(game_playing) {
		var hit: RaycastHit;
		var ray: Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		var _tile:GameObject;
		
		
		// update score display
		scoreboard.text = score.ToString();
		
		// rocket spawn
		if(Time.realtimeSinceStartup - last_rocket > rocket_interval) {
			// launch rocket
			var _rocket:Rocket = Instantiate(rocket);
			_rocket.tag = "rocket";
		
			var rocket_target:Tile;
			
			 do {
			 rocket_target = tiles[Mathf.Floor(Random.value * grid_x  * grid_y)];
			 } while(rocket_target.GetComponent(Tile).open);
			 
			_rocket.transform.position.z = -30;
			_rocket.transform.position.x = Random.value * 40 -20;
			_rocket.transform.position.y = Random.value * 40 -20;
			
			
			var heading = rocket_target.transform.position - _rocket.transform.position;
			var distance = heading.magnitude;
			var direction = heading / distance;  // This is now the normalized direction.
			
			
			_rocket.rigidbody.AddForce(direction * 7, ForceMode.VelocityChange);
			_rocket.transform.LookAt(rocket_target.transform);
			
			last_rocket = Time.realtimeSinceStartup;
		
		}
		
		
		// mouse click detection
		if(Input.GetMouseButtonUp(0) || Input.GetMouseButtonUp(1)) {
			if (Physics.Raycast(ray, hit)) {
				Debug.Log("clicked on " + hit.collider.gameObject.name);
				if(hit.collider.gameObject.name == "tile") {
					_tile = hit.collider.gameObject;
					//Debug.Log("Script component: " + _tile.GetComponent(MonoBehaviour) + " );
					if(Input.GetMouseButtonUp(0)) _tile.BroadcastMessage("TileClicked"); // next: mekanisme callback
					if(Input.GetMouseButtonUp(1)) _tile.BroadcastMessage("ToggleFlag");
				//_tile.getmine_count_text.renderer.enabled = true;
				}
				
				else if(hit.collider.gameObject.tag == "rocket") { 
					hit.collider.gameObject.BroadcastMessage("BlowUp");
					add_score(10);
				}
			}
		}
		
		
		
		if(tiles_left == mine_count) GameWin();
	}
	
	if(game_over.activeSelf == true) {
		if(Input.GetMouseButton(0)) {
			game_over.SetActive(false);
			main_menu.SetActive(true);
			score = 0;
			SetDifficulty(1);
		}
	}
}

function TaggedTilesChanged(val:int) {
	tagged_tiles += val;
}

function TilesLeftChanged(val:int) {
	tiles_left += val;
	tileboard.text = tiles_left.ToString();
}

function GameWin() {
	game_playing = false;
	playtime_gui.SetActive(false);
	game_over.SetActive(true);
	for(_r in GameObject.FindGameObjectsWithTag("rocket")) {
		GameObject.Destroy(_r);
	}
	GameObject.Find("Game Over Text").guiText.text = "YOU WIN!";
	GameObject.Find("Game Over Score").guiText.text = "Score: " + score.ToString();
}

function GameOver() {
	game_playing = false;
	playtime_gui.SetActive(false);
	game_over.SetActive(true);
	for(_r in GameObject.FindGameObjectsWithTag("rocket")) {
		GameObject.Destroy(_r);
	}
	GameObject.Find("Game Over Text").guiText.text = "GAME OVER!";
	GameObject.Find("Game Over Score").guiText.text = "Score: " + score.ToString();
}

function TileClicked_callback(arr) {

}

function detectMines(x:int, y:int) {

}
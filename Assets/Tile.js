#pragma strict

var is_mine = false;
var open = false;
var gridx:int;
var gridy:int;
var adjacent:int;
var mine_count_text:TextMesh;
var explosion:GameObject;
var unopened_tile:GameObject;

var spring:SpringJoint;

var fade_time:float;
var fade_delay:float;
var flagged = false;

private var initial_color:Color;

private var start_fade:float;

function Start () {
	mine_count_text.renderer.enabled = false;
	explosion.SetActive(false);
	initial_color = unopened_tile.renderer.material.color;
	//spring.anchor = this.gameObject.transform.localPosition;
	//spring.autoConfigureConnectedAnchor = true;
	//this.gameObject.springJoint.anchor = this.gameObject.transform.position;
	Debug.Log(initial_color);
}

function Update () {
	if(open) {
		unopened_tile.renderer.material.color = Color.Lerp(initial_color, Color.clear, (Time.time - start_fade) / fade_time);
	}
	
	else {
		if(flagged) {
			unopened_tile.renderer.material.color = Color.red;
		} else {
			unopened_tile.renderer.material.color = initial_color;
		}
	}
}

function TileClicked() {
	if(!flagged) {
	open_tile();
	//Debug.Log("is_mine: " + is_mine + " adjacent: " + adjacent);
	GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("add_score", 100);
	}
	
}	

function ToggleFlag() {
	flagged = !flagged;
	if (flagged) {
	GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("TaggedTilesChanged", 1);
	} else {
	GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("TaggedTilesChanged", -1);
	}
}

function find_other_adjacent() {
	if(adjacent == 0) {
		yield WaitForSeconds(fade_delay);
		var other_tiles = GameObject.FindGameObjectsWithTag("tile");
		var arr:Array = new Array();
		arr.push(this.gridx);
		arr.push(this.gridy);
		for(var _a:GameObject in other_tiles) {
			_a.BroadcastMessage("check_adjacence_to_clicked_tile", arr);
		}
	}
}

private function open_tile() { 
	if(!is_mine){
		GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("TilesLeftChanged", -1);
		if(adjacent > 0) 
		{
		mine_count_text.renderer.enabled = true;
		
		}
		collider.enabled = false;
		//unopened_tile.renderer.enabled = false;
		start_fade = Time.time;
		open = true;
		find_other_adjacent();
		
		var radius = 10000.0;
	var power = 3000.0;
	
		// Applies an explosion force to all nearby rigidbodies
		var explosionPos : Vector3 = transform.position;
		var colliders : Collider[] = Physics.OverlapSphere (explosionPos, radius);
		
		for (var hit : Collider in colliders) {
			if (hit && hit.rigidbody) {
				//hit.rigidbody.AddExplosionForce(power, explosionPos, radius, 3.0);
			}
		}
	
	} else {
		kaboom();
	}
}

function kaboom() {
	
	var other_tiles = GameObject.FindGameObjectsWithTag("tile");
		var arr:Array = new Array();
		for(var _a:GameObject in other_tiles) {
			_a.BroadcastMessage("detonate", arr);
		}
	GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("GameOver");
}

function detonate() {
collider.enabled = true;
	if(is_mine) {
	unopened_tile.renderer.enabled = false;
	explosion.SetActive(true);
	
	var radius = 10000.0;
	var power = 300000.0;
	
		// Applies an explosion force to all nearby rigidbodies
		var explosionPos : Vector3 = transform.position;
		var colliders : Collider[] = Physics.OverlapSphere (explosionPos, radius);
		
		for (var hit : Collider in colliders) {
			if (hit && hit.rigidbody)
				hit.rigidbody.AddExplosionForce(power, explosionPos, radius, 3.0);
		}
	}
	
}



function check_adjacence_to_clicked_tile(arr:Array) {
	var x:int = arr[0];
	var y:int = arr[1];
	if(this.gridx - x <= 1 && this.gridx - x >= -1 
	&& this.gridy - y <= 1 && this.gridy - y >= -1
	&& !((gridx - x == 0) && gridy - y == 0)
	&& !this.open && !this.flagged) {
		open_tile();
		GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("add_score", 5);
	}
}
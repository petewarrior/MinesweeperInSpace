#pragma strict

var target:GameObject;
var explosion:GameObject;

function Start () {
	GameObject.Destroy(this, 20);
}

function Update () {
	
}

function OnCollisionEnter(col:Collision) {
	var tile:GameObject;
	var exp:GameObject;
	
	Debug.Log("hit " + col.gameObject.name);
	if(col.gameObject.tag == "tile") {
	
		tile = col.gameObject;
		tile.BroadcastMessage("TileClicked");
		//if(tile.GetComponent(MonoBehaviour) == false) {
		GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("add_score", 150);
		
		exp = Instantiate(explosion, col.contacts[0].point, this.transform.rotation);
		GameObject.Destroy(this.gameObject);//this.gameObject.(false);
		
	}
}

function BlowUp() {
	Instantiate(explosion, this.transform.position, this.transform.rotation);
	GameObject.Destroy(this.gameObject);//this.gameObject.(false);
}
#pragma strict

function Start () {

}

function Update () {

}

function OnGUI () {
	// Make a group on the center of the screen
	GUI.BeginGroup (Rect (Screen.width / 2 - 150, Screen.height / 2 + 40, 300, 200));
	// All rectangles are now adjusted to the group. (0,0) is the topleft corner of the group.
	
	var button_width = 80;
	var button_height = 30;
	// We'll make a box so you can see where the group is on-screen.
	GUI.Box (Rect (0,0,300,150), "Select difficulty");
	if(GUI.Button (Rect (20,40,80,30), "Easy")) setDifficulty(1);
	if(GUI.Button (Rect (110,40,80,30), "Medium")) setDifficulty(2);
	if(GUI.Button (Rect (200,40,80,30), "Hard")) setDifficulty(3);
	if(GUI.Button (Rect (100,90,100,40), "START!")) startGame();

	// End the group we started above. This is very important to remember!
	GUI.EndGroup ();
}

private function setDifficulty(val:int) {
	GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("SetDifficulty", val);	
}

private function startGame() {
	GameObject.FindGameObjectWithTag("GameController").BroadcastMessage("StartGame");	
}
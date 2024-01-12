/* 
   lit-html snippet - Begin
   Add to the top of your code. Works with html or jsx!
   Formats html in a template literal  using the lit-html library 
   Syntax: html`<div> html or jsx here! ${variable} </div>`
*/
//lit-html snippet - Begin

let html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
//lit-html snippet - End

class House {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.rooms = [];
  }

  addRoom(name, area) {
    this.rooms.push(new Room(name, area));
  }
}

class Room {
  constructor(name, area) {
    this.id = generateUniqueId();
    this.name = name;
    this.area = area;
  }
}

class HouseService {
  static url = "https://659c8892633f9aee7907b1bf.mockapi.io/week12API/house";

  static getAllHouses() {
    return $.get(this.url);
  }

  static createHouse(name) {
    const newHouse = {
      name: name,
      rooms: [],
    };

    return $.post(this.url, newHouse);
  }

  static updateHouse(house) {
    console.log("update house", house);
    let api = $.ajax({
      url: `${this.url}/${house.id}`,
      dataType: "json",
      data: JSON.stringify(house),
      contentType: "application/json",
      type: "PUT",
    });
    console.log("api", api);
    return api;
  }

  static deleteHouse(id) {
    return $.ajax({
      url: `${this.url}/${id}`,
      type: "DELETE",
    });
  }
}

class DOMManager {
  static houses = [];

  static getAllHouses() {
    HouseService.getAllHouses().then((houses) => this.render(houses));
  }

  static createHouse(name) {
    HouseService.createHouse(name)
      .then(() => HouseService.getAllHouses())
      .then((houses) => this.render(houses));
  }

  static deleteHouse(id) {
    HouseService.deleteHouse(id)
      .then(() => HouseService.getAllHouses())
      .then((houses) => this.render(houses));
  }

  static addRoom(id) {
    console.log("addRoom called with id", id);

    const house = this.houses.find((house) => house.id === id);

    if (!house) {
      console.error(`House with id ${id} not found`);
      console.log(
        "Available house IDs:",
        this.houses.map((h) => h.id).join(", ")
      );
      return;
    }

    console.log("Checking house.id:", house.id);

    const roomNameElement = $(`#${id}-room-name`);
    const roomAreaElement = $(`#${id}-room-area`);

    console.log("roomNameElement length:", roomNameElement.length);
    console.log("roomAreaElement length:", roomAreaElement.length);

    if (!roomNameElement.length || !roomAreaElement.length) {
      console.error(`Room elements not found for house with id ${id}`);
      console.log(
        "Available elements:",
        roomNameElement.length,
        roomAreaElement.length
      );
      return;
    }

    const roomName = roomNameElement.val();
    const roomArea = roomAreaElement.val();

    console.log("Room Name:", roomName);
    console.log("Room Area:", roomArea);

    house.rooms.push(new Room(roomName, roomArea));

    HouseService.updateHouse(house)
      .then(() => HouseService.getAllHouses())
      .then((houses) => {
        console.log("Houses after update:", houses);
        this.render(houses);
      })
      .catch((error) => console.error("Error updating house:", error));
  }
  static deleteRoom(houseId, roomId) {
    for (let house of this.houses) {
      if (house.id == houseId) {
        for (let room of house.rooms) {
          if (room.id == roomId) {
            house.rooms.splice(house.rooms.indexOf(room), 1);
            HouseService.updateHouse(house)
              .then(() => HouseService.getAllHouses())
              .then((houses) => this.render(houses))
              .catch((error) => console.error("Error updating house:", error));
          }
        }
      }
    }
  }

  static render(houses) {
    console.log("Rendering houses:", houses);
    this.houses = houses;
    $(`#app`).empty();

    for (let house of houses) {
      console.log("Rendering house:", house);
      console.log(JSON.stringify(house));

      $(`#app`).prepend(html`
        <div id="${house.id}" class="card">
          <div class="card-header">
            <h2>${house.name}</h2>
            <button
              class="btn btn-danger"
              onclick="DOMManager.deleteHouse('${house.id}')"
            >
              Delete
            </button>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-sm">
                <input
                  type="text"
                  id="${house.id}-room-name"
                  class="form-control"
                  placeholder="room name"
                />
              </div>
              <div class="col-sm">
                <input
                  type="text"
                  id="${house.id}-room-area"
                  class="form-control"
                  placeholder="room area"
                />
              </div>
              <div class="col-sm">
                <button
                  id="${house.id}-new-room"
                  onclick="DOMManager.addRoom('${house.id}')"
                  class="btn btn-primary form-control"
                >
                  Add
                </button>
              </div>
            </div>
            <br />
            <div id="rooms-${house.id}">
              <!-- Display rooms here -->
            </div>
          </div>
        </div>
      `);

      for (let room of house.rooms) {
        console.log("Rendering room:", room);
        $(`#rooms-${house.id}`).append(`
            <p>
              <strong>Name:</strong> ${room.name}<br>
              <strong>Area:</strong> ${room.area}<br>
              <button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house.id}', '${room.id}')">Delete Room</button>
            </p>
          `);
      }
    }
  }
}

$("#create-new-house").click(() => {
  DOMManager.createHouse($("#new-house-name").val());
  $("#new-house-name").val("");
  DOMManager.getAllHouses(); // Move inside the click event callback
});

DOMManager.getAllHouses();

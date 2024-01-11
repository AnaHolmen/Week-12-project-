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
    this.name = name;
    this.area = area;
  }
}

class HouseService {
  static url = "https://659c8892633f9aee7907b1bf.mockapi.io/week12API/Houses";

  static getAllHouses() {
    return $.get(this.url);
  }

  static createHouse(name) {
    console.log("Creating house with name:", name);
    return $.post(this.url, { name });
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
  static houses;

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
    console.log("addroom...", id);
    for (let house of this.houses) {
      if (house.name == id) {
        // Use house.name instead of house.id
        console.log("house", house.name);
        house.rooms.push(
          new Room(
            $(`#${house.name}-room-name`).val(),
            $(`#${house.name}-room-area`).val()
          )
        );
        console.log("house object", house);
        HouseService.updateHouse(house)
          .then(() => HouseService.getAllHouses())
          .then((houses) => this.render(houses));
      }
    }
  }

  static deleteRoom(houseId, roomId) {
    for (let house of this.houses) {
      if (house.id == houseId) {
        for (let room of house.rooms) {
          if (room.id == roomId) {
            house.rooms.splice(house.rooms.indexOf(room), 1);
            HouseService.updateHouse(house)
              .then(() => {
                HouseService.getAllHouses();
              })
              .then((houses) => this.render(houses));
          }
        }
      }
    }
  }

  static render(houses) {
    this.houses = houses;
    $("#app").empty();
    for (let house of houses) {
      $("#app").prepend(html`
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
            <div class="card">
              <div class="row">
                <div class="col-sm">
                  <input
                    type="text"
                    id="${house.name}-room-name"
                    class="form-control"
                    placeholder="room name"
                  />
                </div>
                <div class="col-sm">
                  <input
                    type="text"
                    id="${house.name}-room-area"
                    class="form-control"
                    placeholder="room area"
                  />
                </div>
              </div>
              <button
                id="${house.name}-new-room"
                onclick="DOMManager.addRoom('${house.id}')"
                class="btn btn-primary form-control"
              >
                Add
              </button>
            </div>
            <br />
            <div id="rooms-${house.id}">
              <!-- Display rooms here -->
            </div>
          </div>
        </div>
      `);

      for (let room of house.rooms) {
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
});

DOMManager.getAllHouses();

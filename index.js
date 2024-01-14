/* 
   lit-html snippet - Begin
   Add to the top of your code. Works with html or jsx!
   Formats html in a template literal  using the lit-html library 
   Syntax: html`<div> html or jsx here! ${variable} </div>`
*/
//lit-html snippet - Begin

class House {
  constructor(name) {
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
  static url = "https://ancient-taiga-31359.herokuapp.com/api/houses";

  static getAllHouses() {
    return $.get(this.url);
  }

  static getHouse(id) {
    return $.get(this.url + `/${id}`);
  }

  static createHouse(house) {
    return $.post(this.url, house);
  }

  static updateHouse(house) {
    console.log(house);
    return $.ajax({
      url: this.url + `/${house._id}`,
      dataType: "json",
      data: JSON.stringify(house),
      contentType: `application/json`,
      type: "PUT",
    });
  }

  static deleteHouse(id) {
    return $.ajax({
      url: this.url + `/${id}`,
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
    HouseService.createHouse(new House(name))
      .then(() => {
        return HouseService.getAllHouses();
      })
      .then((houses) => this.render(houses));
  }

  static deleteHouse(id) {
    HouseService.deleteHouse(id)
      .then(() => {
        return HouseService.getAllHouses();
      })
      .then((houses) => this.render(houses));
  }

  static addRoom(id) {
    for (let house of this.houses) {
      if (house._id == id) {
        house.rooms.push(
          new Room(
            $(`#${house._id}-room-name`).val(),
            $(`#${house._id}-room-area`).val()
          )
        );
        HouseService.updateHouse(house)
          .then(() => {
            return HouseService.getAllHouses();
          })
          .then((houses) => this.render(houses));
      }
    }
  }

  static deleteRoom(houseId, roomId) {
    for (let house of this.houses) {
      if (house._id == houseId) {
        for (let room of house.rooms) {
          if (room._id == roomId) {
            house.rooms.splice(house.rooms.indexOf(room), 1);
            HouseService.updateHouse(house)
              .then(() => {
                return HouseService.getAllHouses();
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
      $("#app").prepend(
        `<div id="${house._id}" class="card">
          <div class="card-header">
            <h2>${house.name}</h2>
            <button class="btn btn-danger" onclick="DOMManager.deleteHouse('${house._id}')">Delete</button>
          </div>
          
          <div class="card-body">
            <div class="card">
              <div class="row">
                <div class="col-sm">
                  <input type="text" id="${house._id}-room-name" class="form-control" placeholder="Room Name">
                </div>
                <div class="col-sm">
                  <input type="text" id="${house._id}-room-area" class="form-control" placeholder="Room Area">
                </div>
              </div>
              <button id="${house._id}-new-room" onclick="DOMManager.addRoom('${house._id}')" class="btn btn-primary form-control mt-3">Add</button>
            </div>
            <div id="rooms-${house._id}" class="mt-3">
              <!-- Display rooms here -->
            </div>
          </div>
        </div><br>`
      );

      // Check if the house has rooms
      for (let room of house.rooms) {
        $(`#${house._id}`)
          .find(".card-body")
          .append(
            `<p class = "mt-2">
                <span id="name-${room._id}" class="p-2" ><strong>Name: </strong> ${room.name} </span>
                <span id="area-${room._id}" class="p-2"><strong>Area: </strong> ${room.area} </span>
<button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house.id}', '${room.id}')"> Delete Room</button>
</p>`
          );
      }
    }
  }
}

$(document).on("click", "#create-new-house", function () {
  DOMManager.createHouse($("#new-house-name").val());
  $("#new-house-name").val("");
});

DOMManager.getAllHouses();

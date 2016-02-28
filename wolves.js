// Generated by CoffeeScript 1.10.0
(function() {
  var WolvesModel,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  WolvesModel = (function(superClass) {
    var u;

    extend(WolvesModel, superClass);

    function WolvesModel() {
      return WolvesModel.__super__.constructor.apply(this, arguments);
    }

    u = ABM.util;

    WolvesModel.prototype.setup = function() {
      var j, len, patch, ref, results;
      this.rate = 35;
      this.energy_per_tick_eating = 0.5;
      this.energy_per_tick_resting = 0.1;
      this.num_hunt = 0;
      this.last_level = false;
      this.fraction = 1.5;
      this.fraction_rate = this.rate * this.fraction;
      this.resting1 = 0;
      this.resting2 = 0;
      this.eating1 = false;
      this.move = false;
      this.hunted = 0;
      this.size_wolf = 1.9;
      this.walk_speed_wolf = 8;
      this.run_speed_mean_wolf = 47 / this.fraction;
      this.run_speed_sd_wolf = 10 / this.fraction;
      this.vision_wolf = 4;
      this.max_time_hunting = 20;
      this.energy_lose = 0.05;
      this.hunting_energy = this.energy_lose * 8;
      this.color_wolf = u.color.lightgray;
      this.size_deer = 2;
      this.walk_speed_deer = 9;
      this.run_speed_mean_deer = 49 / this.fraction;
      this.run_speed_sd_deer = 5 / this.fraction;
      this.vision_deer = 2;
      this.num_to_die_deer = 4;
      this.time_eating_deer = 30;
      this.clumsiness_deer = 90;
      this.fight_back_deer = 0;
      this.color_deer = u.color.fromHex('ba8759');
      this.size_moose = 2.8;
      this.walk_speed_moose = 6;
      this.run_speed_mean_moose = 45 / this.fraction;
      this.run_speed_sd_moose = 3 / this.fraction;
      this.vision_moose = 2.5;
      this.num_to_die_moose = 5;
      this.time_eating_moose = 48;
      this.clumsiness_moose = 110;
      this.fight_back_moose = 2;
      this.color_moose = u.color.fromHex('bea596');
      this.fight_back_wolf = 3;
      this.color_enemy_wolf = u.color.lightslategray;
      this.animator.setRate(this.rate);
      this.refreshPatches = false;
      this.agentBreeds(["wolves", "deer", "moose", "enemy_wolves"]);
      this.wolves.setDefault("color", this.color_wolf);
      this.wolves.setDefault("size", this.size_wolf);
      this.deer.setDefault("color", this.color_deer);
      this.deer.setDefault("size", this.size_deer);
      this.deer.setDefault("fight_back", this.fight_back_deer);
      this.moose.setDefault("color", this.color_moose);
      this.moose.setDefault("size", this.size_moose);
      this.moose.setDefault("fight_back", this.fight_back_moose);
      this.enemy_wolves.setDefault("color", this.color_enemy_wolf);
      this.enemy_wolves.setDefault("size", this.size_wolf);
      ref = this.patches.create();
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        patch = ref[j];
        results.push(patch.color = u.color.random({
          type: "gray",
          min: 10,
          max: 30
        }));
      }
      return results;
    };

    WolvesModel.prototype.step = function() {
      var deer, i, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, m, moose, n, o, predators, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results, s, t, wolf;
      this.end_game();
      this.wolves.setProperty("color", this.color_wolf);
      ref = this.wolves;
      for (j = 0, len = ref.length; j < len; j++) {
        wolf = ref[j];
        this.fight_other_wolves(wolf);
        if (wolf.energy < 0) {
          this.die_wolf(wolf);
          break;
        }
      }
      if (this.resting1 > 0) {
        this.resting1--;
        if (this.eating1) {
          ref1 = this.wolves;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            wolf = ref1[k];
            this.eat1(wolf);
          }
        } else {
          ref2 = this.wolves;
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            wolf = ref2[l];
            this.change_energy(wolf, this.energy_per_tick_resting);
          }
        }
      } else {
        if (this.hunting1 == null) {
          if (this.animator.ticks % (this.rate / 2) === 0) {
            this.change_label("status", "Roaming");
          }
          this.roam(this.wolves[0], false);
          ref3 = this.wolves;
          for (i = m = 0, len3 = ref3.length; m < len3; i = ++m) {
            wolf = ref3[i];
            if (i > 0) {
              this.follow1(wolf, i - 1);
            }
          }
        } else {
          if (this.hunting1[1] > this.max_time_hunting) {
            this.change_label("status", "Resting");
            this.eating1 = false;
            this.hunting1 = null;
            this.resting1 = this.max_time_hunting * 1.5;
          } else {
            this.change_label("status", "Hunting");
            this.hunting1[1]++;
            ref4 = this.wolves;
            for (n = 0, len4 = ref4.length; n < len4; n++) {
              wolf = ref4[n];
              this.hunt1(wolf);
              this.get_hurt(wolf, this.hunting1[0].fight_back);
            }
          }
        }
      }
      if (this.enemy_wolves.length > 0) {
        if (this.resting2 > 0) {
          this.resting2--;
          if (this.eating2) {
            ref5 = this.enemy_wolves;
            for (o = 0, len5 = ref5.length; o < len5; o++) {
              wolf = ref5[o];
              this.eat2(wolf);
            }
          }
        } else {
          if (this.hunting2 == null) {
            this.roam(this.enemy_wolves[0], true);
            ref6 = this.enemy_wolves;
            for (i = q = 0, len6 = ref6.length; q < len6; i = ++q) {
              wolf = ref6[i];
              if (i > 0) {
                this.follow2(wolf, i - 1);
              }
            }
          } else {
            if (this.hunting2[1] > this.max_time_hunting) {
              this.eating2 = false;
              this.hunting2 = null;
              this.resting2 = this.max_time_hunting * 1.5;
            } else {
              this.hunting2[1]++;
              ref7 = this.enemy_wolves;
              for (r = 0, len7 = ref7.length; r < len7; r++) {
                wolf = ref7[r];
                this.hunt2(wolf);
              }
            }
          }
        }
      }
      ref8 = this.deer;
      for (s = ref8.length - 1; s >= 0; s += -1) {
        deer = ref8[s];
        predators = deer.neighbors({
          radius: this.vision_deer
        }).exclude("deer moose");
        if (predators.any()) {
          this.run_away(deer, predators, this.run_speed_mean_deer, this.run_speed_sd_deer, this.clumsiness_deer);
          this.die_prey(deer, this.num_to_die_deer, this.time_eating_deer);
        } else {
          this.wiggle(deer, this.walk_speed_deer);
        }
      }
      ref9 = this.moose;
      results = [];
      for (t = ref9.length - 1; t >= 0; t += -1) {
        moose = ref9[t];
        predators = moose.neighbors({
          radius: this.vision_moose
        }).exclude("deer moose");
        if (predators.any()) {
          this.run_away(moose, predators, this.run_speed_mean_moose, this.run_speed_sd_moose, this.clumsiness_moose);
          results.push(this.die_prey(moose, this.num_to_die_moose, this.time_eating_moose));
        } else {
          results.push(this.wiggle(moose, this.walk_speed_moose));
        }
      }
      return results;
    };

    WolvesModel.prototype.set_level = function(num_hunt, num_wolves, num_deer, num_moose, num_enemy_wolves, clumsiness_deer, clumsiness_moose, fight_back_wolf, fight_back_deer, fight_back_moose, last_level) {
      var deer, j, k, len, len1, moose, ref, ref1;
      this.num_hunt = num_hunt;
      this.clumsiness_deer = clumsiness_deer;
      this.clumsiness_moose = clumsiness_moose;
      this.fight_back_wolf = fight_back_wolf;
      this.fight_back_deer = fight_back_deer;
      this.fight_back_moose = fight_back_moose;
      this.last_level = last_level;
      ref = this.deer.create(num_deer);
      for (j = 0, len = ref.length; j < len; j++) {
        deer = ref[j];
        deer.position = this.patches.randomPoint();
      }
      ref1 = this.moose.create(num_moose);
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        moose = ref1[k];
        moose.position = this.patches.randomPoint();
      }
      this.wolves.create(num_wolves);
      this.enemy_wolves.create(num_enemy_wolves);
      this.form_circle(this.wolves, num_wolves / 3, {
        x: 0,
        y: 0
      });
      this.form_circle(this.enemy_wolves, num_enemy_wolves / 3, {
        x: 30,
        y: 30
      });
      this.show_energies(true);
      this.change_label("status", "Created");
      return this.change_label("hunted", this.hunted + "/" + this.num_hunt);
    };

    WolvesModel.prototype.end_game = function() {
      if (this.hunted === this.num_hunt) {
        this.win_game();
      }
      if (this.wolves.length < this.num_to_die_deer - 1) {
        return this.lose_game("Your wolves have died.");
      }
    };

    WolvesModel.prototype.win_game = function() {
      this.change_label("status", "Won");
      this.stop();
      $('#btn_start').hide();
      $('#btn_stop').hide();
      $('#won_modal').modal();
      if (this.last_level) {
        $('#won_modal').find('.modal-body').text("Your wolves are gods now.");
        $('#won_modal').find('.modal-footer').hide();
        return $('#btn_refresh').show();
      } else {
        $('#btn_reset').show();
        return $('#btn_reset').text("Next level");
      }
    };

    WolvesModel.prototype.lose_game = function(msg) {
      this.change_label("status", "Game over");
      this.stop();
      $('#btn_start').hide();
      $('#btn_stop').hide();
      $('#btn_reset').show();
      $('#btn_reset').text("Try again");
      $('#lost_modal').modal();
      return this.change_label("lost_modal", msg);
    };

    WolvesModel.prototype.change_label = function(name, message) {
      return $('#spn_' + name).text(message);
    };

    WolvesModel.prototype.change_energy = function(wolf, amount) {
      var color, energy, id, text_energy;
      wolf.energy += amount;
      if (wolf.energy > 100) {
        wolf.energy = 100;
      }
      id = wolf.id;
      energy = wolf.energy;
      color = 'success';
      if (wolf.energy < 20) {
        color = 'danger';
      } else if (wolf.energy < 40) {
        color = 'warning';
      }
      text_energy = energy.toFixed(0);
      if (this.wolves.indexOf(wolf) === 0) {
        text_energy += '*';
      }
      $('#wolf' + id).text(text_energy);
      $('#wolf' + id).css('width', energy + '%');
      $('#wolf' + id).attr('aria-valuenow', energy);
      return $('#wolf' + id).attr('class', 'progress-bar progress-bar-' + color);
    };

    WolvesModel.prototype.show_energies = function() {
      var color, i, j, len, ref, results, wolf;
      $('#div_energy').html('');
      ref = this.wolves;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        wolf = ref[i];
        if (i === 0) {
          wolf.energy = 100;
        } else {
          wolf.energy = u.randomInt(75, 100);
        }
        color = 'success';
        if (wolf.energy < 20) {
          color = 'danger';
        } else if (wolf.energy < 40) {
          color = 'warning';
        }
        results.push($('#div_energy').append('<div class="progress"> <div id="wolf' + wolf.id + '" class="progress-bar progress-bar-' + color + '" role="progressbar" aria-valuenow="' + wolf.energy + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + wolf.energy + '%">' + wolf.energy + '</div> </div>'));
      }
      return results;
    };

    WolvesModel.prototype.rotate_alpha = function(degrees) {
      return this.wolves[0].rotate(u.degreesToRadians(degrees));
    };

    WolvesModel.prototype.move_alpha = function() {
      return this.move = true;
    };

    WolvesModel.prototype.stop_alpha = function() {
      return this.move = false;
    };

    WolvesModel.prototype.roam = function(alpha, auto) {
      var prey, preys;
      preys = alpha.neighbors({
        radius: this.vision_wolf
      }).exclude("wolves enemy_wolves");
      if (preys.any()) {
        prey = preys.min((function(p) {
          return p.distance(alpha.position);
        }));
        if (auto) {
          return this.hunting2 = [prey, 0];
        } else {
          return this.hunting1 = [prey, 0];
        }
      } else {
        if (auto) {
          alpha.rotate(u.randomCentered(u.degreesToRadians(20)));
          return alpha.forward(this.walk_speed_wolf / this.fraction_rate);
        } else if (this.move) {
          this.change_energy(alpha, -this.energy_lose);
          return alpha.forward(this.walk_speed_wolf / this.fraction_rate);
        }
      }
    };

    WolvesModel.prototype.follow1 = function(wolf, index) {
      var following;
      following = this.wolves[index];
      wolf.face(following.position);
      if (this.move && !wolf.neighbors({
        radius: 2
      }).contains(following)) {
        wolf.forward(this.walk_speed_wolf / this.fraction_rate);
        return this.change_energy(wolf, -this.energy_lose);
      }
    };

    WolvesModel.prototype.follow2 = function(wolf, index) {
      var following;
      following = this.enemy_wolves[index];
      wolf.face(following.position);
      if (!wolf.neighbors({
        radius: 2
      }).contains(following)) {
        return wolf.forward(this.walk_speed_wolf / this.fraction_rate);
      }
    };

    WolvesModel.prototype.hunt1 = function(wolf) {
      wolf.face(this.hunting1[0].position);
      wolf.forward(u.randomNormal(this.run_speed_mean_wolf, this.run_speed_sd_wolf) / this.fraction_rate);
      return this.change_energy(wolf, -this.hunting_energy);
    };

    WolvesModel.prototype.hunt2 = function(wolf) {
      wolf.face(this.hunting2[0].position);
      return wolf.forward(u.randomNormal(this.run_speed_mean_wolf, this.run_speed_sd_wolf) / this.fraction_rate);
    };

    WolvesModel.prototype.eat1 = function(wolf) {
      var degrees;
      this.change_energy(wolf, this.energy_per_tick_eating);
      if (this.resting1 % 2 === 0) {
        degrees = 25;
        if (this.resting1 % 4 === 0) {
          wolf.color = u.color.darkgreen;
          degrees = -degrees;
        }
        return wolf.rotate(u.degreesToRadians(degrees));
      }
    };

    WolvesModel.prototype.eat2 = function(wolf) {
      var degrees;
      if (this.resting2 % 2 === 0) {
        degrees = 25;
        if (this.resting2 % 4 === 0) {
          degrees = -degrees;
        }
        return wolf.rotate(u.degreesToRadians(degrees));
      }
    };

    WolvesModel.prototype.get_hurt = function(wolf, max_damage) {
      var hurt_energy;
      hurt_energy = u.randomNormal(0, max_damage);
      if (hurt_energy > max_damage / 1.5) {
        wolf.color = u.color.darkred;
        return this.change_energy(wolf, -hurt_energy);
      }
    };

    WolvesModel.prototype.die_wolf = function(wolf) {
      if (this.wolves.indexOf(wolf) === 0) {
        this.wolves.sort(function(a, b) {
          if (a.energy < b.energy) {
            return 1;
          } else if (a.energy > b.energy) {
            return -1;
          } else {
            return 0;
          }
        });
      }
      return wolf.die();
    };

    WolvesModel.prototype.form_circle = function(agents, radius, start_point) {
      var agent, dTheta, direction, i, j, len, results, startAngle;
      dTheta = 2 * Math.PI / agents.length;
      startAngle = Math.PI / 2;
      direction = -1;
      results = [];
      for (i = j = 0, len = agents.length; j < len; i = ++j) {
        agent = agents[i];
        agent.moveTo(start_point);
        agent.heading = startAngle + direction * dTheta * i;
        results.push(agent.forward(radius));
      }
      return results;
    };

    WolvesModel.prototype.fight_other_wolves = function(wolf) {
      var enemy_wolves;
      enemy_wolves = wolf.neighbors({
        radius: 2
      }).exclude("deer moose wolves");
      if (enemy_wolves.length >= 2) {
        return this.get_hurt(wolf, this.fight_back_wolf);
      }
    };

    WolvesModel.prototype.wiggle = function(prey, walk_speed) {
      prey.rotate(u.randomCentered(u.degreesToRadians(20)));
      return prey.forward(u.randomFloat(0, walk_speed / this.fraction_rate));
    };

    WolvesModel.prototype.run_away = function(prey, predators, run_speed_mean, run_speed_sd, clumsiness) {
      var ang, angle_avg, avg_position, avg_position_x, avg_position_y, nearest_predator, p, positions;
      nearest_predator = predators.min((function(p) {
        return p.distance(prey.position);
      }));
      ang = u.angle(prey.position, nearest_predator.position, this.patches);
      positions = predators.getProperty("position");
      avg_position_x = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = positions.length; j < len; j++) {
          p = positions[j];
          results.push(p.x);
        }
        return results;
      })()).reduce(function(a, b) {
        return a + b;
      }) / predators.length;
      avg_position_y = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = positions.length; j < len; j++) {
          p = positions[j];
          results.push(p.y);
        }
        return results;
      })()).reduce(function(a, b) {
        return a + b;
      }) / predators.length;
      avg_position = {
        x: avg_position_x,
        y: avg_position_y
      };
      angle_avg = u.angle(prey.position, avg_position, this.patches);
      prey.face(avg_position);
      prey.rotate(u.degreesToRadians(u.randomInt(180 - clumsiness, 180 + clumsiness)));
      return prey.forward(u.randomNormal(run_speed_mean, run_speed_sd) / this.fraction_rate);
    };

    WolvesModel.prototype.die_prey = function(prey, num_to_die, time_eating) {
      if ((this.hunting1 != null) && prey === this.hunting1[0] && prey.neighbors({
        radius: 1
      }).exclude("deer moose enemy_wolves").length >= num_to_die) {
        this.change_label("status", "Eating");
        if ((this.hunting2 != null) && prey === this.hunting2[0]) {
          this.hunting2 = null;
        }
        prey.die();
        this.hunting1 = null;
        this.resting1 = time_eating;
        this.eating1 = true;
        this.hunted++;
        return this.change_label("hunted", this.hunted + "/" + this.num_hunt);
      } else if ((this.hunting2 != null) && prey === this.hunting2[0] && prey.neighbors({
        radius: 1
      }).exclude("deer moose wolves").length >= num_to_die) {
        if ((this.hunting1 != null) && prey === this.hunting1[0]) {
          this.hunting1 = null;
        }
        prey.die();
        this.hunting2 = null;
        this.resting2 = time_eating;
        return this.eating2 = true;
      }
    };

    return WolvesModel;

  })(ABM.Model);

  $(function() {
    var clumsiness_deer, clumsiness_moose, countdown, fight_back_deer, fight_back_moose, fight_back_wolf, level, model, num_deer, num_enemy_wolves, num_hunt, num_moose, num_wolves, playing, set_model_level, times, timing;
    level = 0;
    times = [60, 90, 100, 110];
    num_hunt = [4, 6, 7, 7];
    num_wolves = [7, 7, 7, 7];
    num_deer = [15, 12, 13, 10];
    num_moose = [0, 5, 7, 5];
    num_enemy_wolves = [0, 0, 5, 5];
    clumsiness_deer = [115, 100, 95, 90];
    clumsiness_moose = [110, 110, 105, 100];
    fight_back_wolf = [3, 3, 3, 3];
    fight_back_deer = [0, 0, 0, 0];
    fight_back_moose = [0, 1.3, 1.3, 1.4];
    playing = false;
    timing = times[level];
    model = new WolvesModel({
      div: "world",
      patchSize: 9,
      mapSize: 70,
      isTorus: true
    });
    set_model_level = function() {
      return model.set_level(num_hunt[level], num_wolves[level], num_deer[level], num_moose[level], num_enemy_wolves[level], clumsiness_deer[level], clumsiness_moose[level], fight_back_wolf[level], fight_back_deer[level], fight_back_moose[level], level === times.length - 1 ? true : false);
    };
    this.start = function() {
      model.start();
      playing = true;
      return countdown();
    };
    this.stop = function() {
      model.change_label("status", "Paused");
      model.stop();
      return playing = false;
    };
    this.reset = function() {
      timing = times[level];
      model.reset();
      set_model_level();
      model.start();
      $('#btn_start').show();
      $('#btn_stop').show();
      $('#btn_reset').hide();
      playing = true;
      $('#spn_level').text(level + 1);
      return countdown();
    };
    this.refresh = function() {
      return window.location.reload();
    };
    this.key_down = function(event, num_btn) {
      if (event.keyCode === 13) {
        return $('#btn_modal_' + num_btn).click();
      }
    };
    this.change_rate = function(value) {
      console.log(value);
      return model.animator.setRate(value);
    };
    countdown = function() {
      timing--;
      $('#spn_time').text(timing);
      if (timing === 0) {
        model.lose_game("Time's up.");
        return playing = false;
      } else if (playing) {
        return setTimeout(function() {
          return countdown();
        }, 1000);
      }
    };
    $('#won_modal').on('show.bs.modal', function() {
      playing = false;
      return level++;
    });
    $('#lost_modal').on('shown.bs.modal', function() {
      return playing = false;
    });
    $('body').keydown(function(e) {
      switch (e.keyCode) {
        case 37:
          model.rotate_alpha(20);
          break;
        case 38:
          model.move_alpha();
          break;
        case 39:
          model.rotate_alpha(-20);
          break;
        case 40:
          model.stop_alpha();
          break;
      }
    });
    set_model_level();
    $('#btn_reset').hide();
    $('#btn_refresh').hide();
    $('#spn_time').text(times[level]);
    $('#spn_level').text(level + 1);
    $('#initial_modal').modal();
    return $('#lost_modal').modal('hide');
  });

}).call(this);

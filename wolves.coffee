
class WolvesModel extends ABM.Model
	u = ABM.util
	# startup: ->
	# 	u.shapes.add "cc", true, u.importImage("images/coffee.png")
	setup: ->
		# Variables
		#general
		@rate = 35
		@energy_per_tick_eating = 0.5
		@energy_per_tick_resting = 0.1
		@num_hunt = 0
		@last_level = false
		#auxiliar
		@fraction = 1.5
		@fraction_rate = @rate * @fraction
		@resting1 = 0
		@resting2 = 0
		@eating1 = false
		@move = false
		@hunted = 0
		#wolves
		@size_wolf = 1.9
		@walk_speed_wolf = 8
		@run_speed_mean_wolf = 47/@fraction
		@run_speed_sd_wolf = 10/@fraction
		@vision_wolf = 4
		@max_time_hunting = 20
		@energy_lose = 0.05
		@hunting_energy = @energy_lose*8
		@color_wolf = u.color.lightgray
		#deer
		@size_deer = 2
		@walk_speed_deer = 9
		@run_speed_mean_deer = 49/@fraction
		@run_speed_sd_deer = 5/@fraction
		@vision_deer = 2
		@num_to_die_deer = 4
		@time_eating_deer = 30
		@clumsiness_deer = 90
		@fight_back_deer = 0
		@color_deer = u.color.fromHex 'ba8759'
		#moose
		@size_moose = 2.8
		@walk_speed_moose = 6
		@run_speed_mean_moose = 45/@fraction
		@run_speed_sd_moose = 3/@fraction
		@vision_moose = 2.5
		@num_to_die_moose = 5
		@time_eating_moose = 48
		@clumsiness_moose = 110
		@fight_back_moose = 2
		@color_moose = u.color.fromHex 'bea596'
		#enemy wolf
		@fight_back_wolf = 3
		@color_enemy_wolf = u.color.lightslategray

		@animator.setRate @rate
		@refreshPatches = false
		@agentBreeds ["wolves", "deer", "moose", "enemy_wolves"]

		#defaults
		@wolves.setDefault "color", @color_wolf
		@wolves.setDefault "size", @size_wolf
		@deer.setDefault "color", @color_deer
		@deer.setDefault "size", @size_deer
		@deer.setDefault "fight_back", @fight_back_deer
		@moose.setDefault "color", @color_moose
		@moose.setDefault "size", @size_moose
		@moose.setDefault "fight_back", @fight_back_moose
		# @moose.setDefault "shape", u.shapes.cc
		@enemy_wolves.setDefault "color", @color_enemy_wolf
		@enemy_wolves.setDefault "size", @size_wolf
		# @wolves.setDefault "energy", 0

		for patch in @patches.create()
			patch.color = u.color.random type: "gray", min: 10, max: 30

		

	step: ->
		@end_game()

		# Wolves
		@wolves.setProperty "color", @color_wolf
		for wolf in @wolves
			@fight_other_wolves(wolf)
			#die
			if wolf.energy < 0
				@die_wolf(wolf)
				break
		if @resting1 > 0
			@resting1--
			#eating
			if @eating1
				for wolf in @wolves
					@eat1(wolf)
			#resting
			else
				for wolf in @wolves
					@change_energy(wolf, @energy_per_tick_resting)
		else
			#roaming and following
			if not @hunting1?
				if @animator.ticks % (@rate/2) is 0
					@change_label "status", "Roaming"
				@roam @wolves[0], false
				for wolf, i in @wolves
					if i > 0
						@follow1(wolf, i-1)
			else
				#resting
				if @hunting1[1] > @max_time_hunting
					@change_label "status", "Resting"
					@eating1 = false
					@hunting1 = null
					@resting1 = @max_time_hunting*1.5
				#hunting
				else
					@change_label "status", "Hunting"
					@hunting1[1]++
					for wolf in @wolves
						@hunt1(wolf)
						@get_hurt(wolf, @hunting1[0].fight_back)

		# enemy wolves
		if @enemy_wolves.length > 0
			if @resting2 > 0
				@resting2--
				if @eating2
					for wolf in @enemy_wolves
						@eat2(wolf)
			else
				if not @hunting2?
					@roam @enemy_wolves[0], true
					for wolf, i in @enemy_wolves
						if i > 0
							@follow2(wolf, i-1)
				else
					if @hunting2[1] > @max_time_hunting
						@eating2 = false
						@hunting2 = null
						@resting2 = @max_time_hunting*1.5
					else
						@hunting2[1]++
						for wolf in @enemy_wolves
							@hunt2(wolf)
			
		# Deer
		for deer in @deer by -1
			predators = deer.neighbors(radius: @vision_deer).exclude("deer moose")
			if predators.any()
				@run_away(deer, predators, @run_speed_mean_deer, @run_speed_sd_deer, @clumsiness_deer)
				@die_prey(deer, @num_to_die_deer, @time_eating_deer)
			else
				@wiggle(deer, @walk_speed_deer)

		# Moose
		for moose in @moose by -1
			predators = moose.neighbors(radius: @vision_moose).exclude("deer moose")
			if predators.any()
				@run_away(moose, predators, @run_speed_mean_moose, @run_speed_sd_moose, @clumsiness_moose)
				@die_prey(moose, @num_to_die_moose, @time_eating_moose)
			else
				@wiggle(moose, @walk_speed_moose)
			

	# Aux

	set_level: (num_hunt, num_wolves, num_deer, num_moose, num_enemy_wolves, clumsiness_deer, clumsiness_moose, fight_back_wolf, fight_back_deer, fight_back_moose, last_level) ->
		@num_hunt = num_hunt
		@clumsiness_deer = clumsiness_deer
		@clumsiness_moose = clumsiness_moose
		@fight_back_wolf = fight_back_wolf
		@fight_back_deer = fight_back_deer
		@fight_back_moose = fight_back_moose
		@last_level = last_level
		for deer in @deer.create(num_deer)
			deer.position = @patches.randomPoint()
		for moose in @moose.create(num_moose)
			moose.position = @patches.randomPoint()
		@wolves.create(num_wolves)
		@enemy_wolves.create(num_enemy_wolves)
		@form_circle @wolves, num_wolves/3, {x:0, y:0}
		@form_circle @enemy_wolves, num_enemy_wolves/3, {x:30, y:30}
		@show_energies(true)
		@change_label "status", "Created"
		@change_label "hunted", @hunted+"/"+@num_hunt

	end_game: () ->
		if @hunted is @num_hunt
			@win_game()
		if @wolves.length < @num_to_die_deer-1
			@lose_game("Your wolves have died.")

	win_game: () ->
		@change_label "status", "Won"
		@stop()
		$('#btn_start').hide()
		$('#btn_stop').hide()
		$('#won_modal').modal()
		if @last_level
			$('#won_modal').find('.modal-body').text "Your wolves are gods now."
			$('#won_modal').find('.modal-footer').hide()
			$('#btn_refresh').show()
		else
			$('#btn_reset').show()
			$('#btn_reset').text "Next level"

	lose_game: (msg) ->
		@change_label "status", "Game over"
		@stop()
		$('#btn_start').hide()
		$('#btn_stop').hide()
		$('#btn_reset').show()
		$('#btn_reset').text "Try again"
		$('#lost_modal').modal()
		@change_label "lost_modal", msg
		
	change_label: (name, message) ->
		$('#spn_'+name).text message

	change_energy: (wolf, amount) ->
		wolf.energy += amount
		wolf.energy = 100 if wolf.energy > 100
		id = wolf.id
		energy = wolf.energy
		color = 'success'
		if wolf.energy < 20
			color = 'danger'
		else if wolf.energy < 40
			color = 'warning'
		text_energy = energy.toFixed(0)
		if @wolves.indexOf(wolf) is 0
			text_energy += '*'
		$('#wolf'+id).text text_energy
		$('#wolf'+id).css 'width', energy+'%'
		$('#wolf'+id).attr 'aria-valuenow', energy
		$('#wolf'+id).attr 'class', 'progress-bar progress-bar-'+color

	show_energies: () ->
		$('#div_energy').html ''
		for wolf, i in @wolves
			if i is 0
				wolf.energy = 100
			else
				wolf.energy = u.randomInt 75, 100
			color = 'success'
			if wolf.energy < 20
				color = 'danger'
			else if wolf.energy < 40
				color = 'warning'
			$('#div_energy').append('
				<div class="progress">
					<div id="wolf'+wolf.id+'" class="progress-bar progress-bar-'+color+'" role="progressbar" aria-valuenow="'+wolf.energy+'" aria-valuemin="0" aria-valuemax="100" style="width: '+wolf.energy+'%">'+
						wolf.energy+'
					</div>
				</div>')

	rotate_alpha: (degrees) ->
		@wolves[0].rotate u.degreesToRadians(degrees)

	move_alpha: () ->
		@move = true
			
	stop_alpha: () ->
		@move = false


	# Wolves

	roam: (alpha, auto) ->
		preys = alpha.neighbors(radius: @vision_wolf).exclude("wolves enemy_wolves")
		if preys.any()
			prey = preys.min(((p) -> p.distance alpha.position))
			if auto
				@hunting2 = [prey, 0]
			else
				@hunting1 = [prey, 0]
		else
			if auto
				alpha.rotate u.randomCentered u.degreesToRadians(20)
				alpha.forward @walk_speed_wolf/@fraction_rate
			else if @move
				@change_energy(alpha, -@energy_lose)
				alpha.forward @walk_speed_wolf/@fraction_rate
			
	follow1: (wolf, index) ->
		following = @wolves[index]
		wolf.face following.position
		if @move and !wolf.neighbors(radius: 2).contains(following)
			wolf.forward @walk_speed_wolf/@fraction_rate
			@change_energy(wolf, -@energy_lose)
			
	follow2: (wolf, index) ->
		following = @enemy_wolves[index]
		wolf.face following.position
		if !wolf.neighbors(radius: 2).contains(following)
			wolf.forward @walk_speed_wolf/@fraction_rate

	hunt1: (wolf) ->
		wolf.face @hunting1[0].position
		wolf.forward u.randomNormal(@run_speed_mean_wolf, @run_speed_sd_wolf)/@fraction_rate
		@change_energy(wolf, -@hunting_energy)

	hunt2: (wolf) ->
		wolf.face @hunting2[0].position
		wolf.forward u.randomNormal(@run_speed_mean_wolf, @run_speed_sd_wolf)/@fraction_rate

	eat1: (wolf) ->
		@change_energy(wolf, @energy_per_tick_eating)
		if @resting1 % 2 is 0
			degrees = 25
			if @resting1 % 4 is 0
				wolf.color = u.color.darkgreen
				degrees = -degrees
			wolf.rotate u.degreesToRadians(degrees)

	eat2: (wolf) ->
		if @resting2 % 2 is 0
			degrees = 25
			if @resting2 % 4 is 0
				degrees = -degrees
			wolf.rotate u.degreesToRadians(degrees)

	get_hurt: (wolf, max_damage) ->
		hurt_energy = u.randomNormal 0, max_damage
		if hurt_energy > max_damage/1.5
			wolf.color = u.color.darkred
			@change_energy(wolf, -hurt_energy)

	die_wolf: (wolf) ->
		if @wolves.indexOf(wolf) is 0
			#change alpha
			@wolves.sort((a, b) ->
	      if a.energy < b.energy
	        1
	      else if a.energy > b.energy
	        -1
	      else
	        0)
		wolf.die()

	form_circle: (agents, radius, start_point) ->
		dTheta = 2 * Math.PI / agents.length
		startAngle = Math.PI / 2
		direction = -1
		for agent, i in agents
			agent.moveTo start_point
			agent.heading = startAngle + direction * dTheta * i
			agent.forward radius

	fight_other_wolves: (wolf) ->
		enemy_wolves = wolf.neighbors(radius: 2).exclude("deer moose wolves")
		if enemy_wolves.length >= 2
			@get_hurt wolf, @fight_back_wolf
		
		
	# Preys

	wiggle: (prey, walk_speed) ->
		prey.rotate u.randomCentered u.degreesToRadians(20)
		prey.forward u.randomFloat 0, walk_speed/@fraction_rate

	run_away: (prey, predators, run_speed_mean, run_speed_sd, clumsiness) ->
		nearest_predator = predators.min(((p) -> p.distance prey.position))
		ang = u.angle(prey.position, nearest_predator.position, @patches)
		positions = predators.getProperty "position"
		avg_position_x = (p.x for p in positions).reduce((a, b) -> a + b) / predators.length
		avg_position_y = (p.y for p in positions).reduce((a, b) -> a + b) / predators.length
		avg_position = {x: avg_position_x, y: avg_position_y}
		angle_avg = u.angle(prey.position, avg_position, @patches)
		prey.face avg_position
		prey.rotate u.degreesToRadians u.randomInt 180-clumsiness, 180+clumsiness
		prey.forward u.randomNormal(run_speed_mean, run_speed_sd)/@fraction_rate

	die_prey: (prey, num_to_die, time_eating) ->
		if @hunting1? and prey is @hunting1[0] and prey.neighbors(radius: 1).exclude("deer moose enemy_wolves").length >= num_to_die
			@change_label "status", "Eating"
			if @hunting2? and prey is @hunting2[0]
				@hunting2 = null
			prey.die()
			@hunting1 = null
			@resting1 = time_eating
			@eating1 = true
			@hunted++
			@change_label "hunted", @hunted+"/"+@num_hunt
		else if @hunting2? and prey is @hunting2[0] and prey.neighbors(radius: 1).exclude("deer moose wolves").length >= num_to_die
			if @hunting1? and prey is @hunting1[0]
				@hunting1 = null
			prey.die()
			@hunting2 = null
			@resting2 = time_eating
			@eating2 = true
		


$ ->
	#Variables
	level = 0
	times = [60,90,100,110]
	num_hunt = [4,6,7,7]
	num_wolves = [7,7,7,7]
	num_deer = [15,12,13,10]
	num_moose = [0,5,7,5]
	num_enemy_wolves = [0,0,5,5]
	clumsiness_deer = [115,100,95,90]
	clumsiness_moose = [110,110,105,100]
	fight_back_wolf = [3,3,3,3]
	fight_back_deer = [0,0,0,0]
	fight_back_moose = [0,1.3,1.3,1.4]
	playing = false
	timing = times[level]
	model = new WolvesModel {
	  div: "world",
	  patchSize: 9,
	  mapSize: 70,
	  isTorus: true
	}

	set_model_level = () ->
		model.set_level(
			num_hunt[level],
			num_wolves[level],
			num_deer[level],
			num_moose[level],
			num_enemy_wolves[level],
			clumsiness_deer[level],
			clumsiness_moose[level],
			fight_back_wolf[level],
			fight_back_deer[level],
			fight_back_moose[level],
			if level is times.length-1 then true else false)
	@start = () ->
		model.start()
		playing = true
		countdown()
	@stop = () ->
		model.change_label "status", "Paused"
		model.stop()
		playing = false
	@reset = () ->
		timing = times[level]
		model.reset()
		set_model_level()
		model.start()
		$('#btn_start').show()
		$('#btn_stop').show()
		$('#btn_reset').hide()
		playing = true
		$('#spn_level').text level+1
		countdown()
	@refresh = () ->
		window.location.reload()
	@key_down = (event, num_btn) ->
		if event.keyCode is 13
			$('#btn_modal_'+num_btn).click()
	@change_rate = (value) ->
		console.log value
		model.animator.setRate value
	countdown = () ->
		timing--
		$('#spn_time').text timing
		if timing is 0
			model.lose_game "Time's up."
			playing = false
		else if playing
			setTimeout ->
				countdown()
			, 1000
	$('#won_modal').on 'show.bs.modal', ->
		playing = false
		level++
	$('#lost_modal').on 'shown.bs.modal', ->
		playing = false
	$('body').keydown((e) ->
		switch e.keyCode
			when 37
				model.rotate_alpha 20
				break
			when 38
				model.move_alpha()
				break
			when 39
				model.rotate_alpha -20
				break
			when 40
				model.stop_alpha()
				break
	)

	#Initialization
	set_model_level()
	$('#btn_reset').hide()
	$('#btn_refresh').hide()
	$('#spn_time').text times[level]
	$('#spn_level').text level+1
	$('#initial_modal').modal()
	$('#lost_modal').modal('hide')
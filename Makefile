move::
	ipconfig getifaddr en1 | nats req qcon.advertise

leaf::
	nats-server -c leaf.conf

survey_mirror::
	nats s add --config survey_mirror.json

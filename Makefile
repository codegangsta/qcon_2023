move::
	ipconfig getifaddr en1 | nats req qcon.advertise

leaf::
	nats-server -c leaf.conf

survey_mirror::
	nats s add --config survey_mirror.json

config_change::
	jo -d . chart_color="#ff0000" | nats kv put config all

config_reset::
	nats kv del config all -f

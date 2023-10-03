move::
	nats pub qcon.advertise wss://nats.codegangsta.dev:8080

unmove::
	nats pub qcon.advertise ""

leaf::
	nats-server -c leaf.conf

mirrors::
	nats s add --config survey_mirror.json
	nats kv add config --mirror config --mirror-domain cloud

config_change::
	jo -d . chart_color="#ff0000" | nats kv put config all

config_reset::
	nats kv del config all -f

move::
	nats pub qcon.advertise wss://local.codegangsta.dev

unmove::
	nats pub qcon.advertise ""

leaf::
	nats-server -c leaf.conf

tunnel:
	ngrok http --domain=local.codegangsta.dev 8080

mirrors::
	nats s add --config survey_mirror.json --js-domain leaf
	nats kv add config --mirror config --mirror-domain cloud --js-domain leaf

rm_mirrors::
	nats s rm survey --js-domain leaf -f
	nats kv rm config --js-domain leaf -f

source::
	nats s add --config metrics_source.json --js-domain cloud

rm_source::
	nats s rm global_metrics --js-domain cloud -f


config_change::
	jo -d . chart_color="#ff0000" | nats kv put config all

config_reset::
	nats kv del config all -f

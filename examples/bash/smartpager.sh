#!/bin/bash
## Bash Library for sending out Pages and/or getting their State
# dependencies: curl, jq

# echo "Bericht" | send_page "http://127.0.0.1:3000" "duplex" "birdyslim" "dapnet=dl-all#DXxxx"
send_page() {
	text=$(cat -)
	endpoint=$1
	msgType=$2
	deviceType=$3
	argArr=("$@")
	connectorJSON=$(for arg in "${argArr[@]}"; do echo $arg; done | jq -Rcs '{array:split("\n")|.[3:-1]|map(split("=")|[(.[0]),.[1]]?)}.array')
	echo $connectorJSON |\
		jq -c --arg t "$msgType" --arg d "$deviceType" --arg p "$text" '{type:$t, routing: {connectors:.,device:$d}, payload:$p}' |\
		curl -s -XPOST -H "Content-type: application/json" "$endpoint/api/message/advanced" -d @- |\
		jq -r .
}
msg_status() {
	endpoint=$1
	msgid=$2
	curl -s "$endpoint/api/message/status/$msgid" |\
		jq -r ._routerData
}
is_msg_recv() {
	msg_status $* | jq .recvAck | grep -q "true"
	return $?
}
is_msg_read() {
	msg_status $* | jq .readAck | grep -q "true"
	return $?
}
is_msg_resp() {
	msg_status $* | jq .response | grep -vq "false"
	return $?
}

ENDPOINT="http://127.0.0.1:3000"
#echo "Test" | send_page "$ENDPOINT" "duplex" "birdyslim" "pocsag=133701D" "test=123"
#msgid=$(echo "Test" | send_page "$ENDPOINT" "duplex" "birdyslim" "pocsag=133701D" "test=123")
msgid="Bznka"
msg_status "$ENDPOINT" "$msgid"


if is_msg_recv "$ENDPOINT" "$msgid"; then
	echo "message is recv"
fi
if is_msg_read "$ENDPOINT" "$msgid"; then
	echo "message is read"
fi
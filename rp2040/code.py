import digitalio
import board
import displayio
import rgbmatrix
import terminalio
import time
import adafruit_display_shapes.rect
import adafruit_display_text.label
import framebufferio
import wifi
import os
import adafruit_minimqtt.adafruit_minimqtt as MQTT
import socketpool
import ssl
import adafruit_logging as logging
import supervisor

message = "..."
text = None

def center(text):
    # Get text width and height
    text_width = text.bounding_box[2]
    text_height = text.bounding_box[3]

    center_x = (32 - text_width) / 2
    center_y = (28 - text_height) / 2

    text.x = int(center_x)
    text.y = int(center_y)

def on_connected(client, userdata, flags, rc):
    # This function will be called when the client is connected
    # successfully to the broker.
    print("Connected to NATS")
    # Subscribe to all changes on the onoff_feed.
    client.subscribe("pico", 1)
    print("Subscribed to pico")
    
    global message
    message = "dope"
    text.color = 0x00FF00



def on_disconnected(client, userdata, rc):
    # This method is called when the client is disconnected
    print("Disconnected from NATS!")


def on_message(client, topic, msg):
    # This method is called when a topic the client is subscribed to
    # has a new message.
    print(f"New message on topic {topic}: {msg}")

    global message
    message = msg

try:

    print("Setting up display...")
    displayio.release_displays()

    matrix = rgbmatrix.RGBMatrix(
        width=32, height=16,    # Dimensions of the matrix
        bit_depth=2,            # 2-bit color depth
        rgb_pins=[
            board.GP2,  # R1
            board.GP3,  # G1
            board.GP4,  # B1
            board.GP5,  # R2
            board.GP8,  # G2
            board.GP9   # B2
        ],
        addr_pins=[
            board.GP10,  # A
            board.GP16,  # B
            board.GP18,  # C
            # board.GP20,  # D
            # board.GP22,  # e
        ],
        clock_pin=board.GP11,
        latch_pin=board.GP12,
        output_enable_pin=board.GP13
    )

    display = framebufferio.FramebufferDisplay(matrix, auto_refresh=True)

# Create a display context
    group = displayio.Group()
    text = adafruit_display_text.label.Label(terminalio.FONT, backgound_tight=True, text=message, color=0xAAAAAA, x=0, y=0)
    center(text)
    group.append(text)
    display.show(group)

    print("Connecting to WIFI...")
    text.text = "wifi"
    center(text)
    display.refresh()
    wifi.radio.connect(os.getenv('WIFI_SSID'), os.getenv('WIFI_PASSWORD'))



# Create a socket pool
    pool = socketpool.SocketPool(wifi.radio)
    ssl_context = ssl.create_default_context()

# Set up a MiniMQTT Client
    mqtt_client = MQTT.MQTT(
        broker=os.getenv("MQTT_SERVER"),
        username=os.getenv("MQTT_USER"),
        password=os.getenv("MQTT_PASSWORD"),
        port=1883,
        socket_pool=pool,
        recv_timeout=10,
        socket_timeout=1,
    )
    mqtt_client.enable_logger(logging)

# Setup the callback methods above
    mqtt_client.on_connect = on_connected
    mqtt_client.on_disconnect = on_disconnected
    mqtt_client.on_message = on_message

# Connect the client to the MQTT broker.
    print("Connecting to NATS...")
    text.text = "nats"
    center(text)
    display.refresh()
    mqtt_client.connect()
    text.text = "dope"
    center(text)
    display.refresh()

    while True:
        print("Waiting for message...")
        mqtt_client.loop()

        text.text = message
        center(text)

        time.sleep(1)

except Exception as e:
    print(e)
    if display and text:
        text.text = "error"
        text.color = 0xFF0000
        center(text)
        display.refresh()

    time.sleep(5)
    displayio.release_displays()
    supervisor.reload()

